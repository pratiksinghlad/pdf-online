/**
 * Compression Configuration – Strategy Pattern
 *
 * DRY configuration for Ghostscript arguments and canvas fallback settings.
 * Each profile maps to a -dPDFSETTINGS level with specific DPI targets.
 */
import type { CompressionLevel, CompressionProfile } from '../types/compress';

// ─── Profile Registry ───────────────────────────────────────────────────────

export const COMPRESSION_PROFILES: Record<CompressionLevel, CompressionProfile> = {
    best: {
        name: 'Best',
        level: 'best',
        description: 'Best quality, 150 DPI images',
        gsSettings: '/ebook',
        dpi: 150,
        canvasScale: 1.5,    // ~144 DPI render
        canvasQuality: 0.75, // 75% JPEG quality
    },
    basic: { // User requested rename to "Advance" but keeping key 'basic' for now to minimize refactors
        name: 'Advance',
        level: 'basic',
        description: 'Smallest file size, 90 DPI images',
        gsSettings: '/screen',
        dpi: 90,
        canvasScale: 1.0,    // ~96 DPI render
        canvasQuality: 0.60, // 60% JPEG quality
    },
    custom: {
        name: 'Custom',
        level: 'custom',
        description: 'Custom DPI (72-200)',
        gsSettings: '/ebook', // Use ebook as flexible base
        dpi: 150, // Default if not provided
        canvasScale: 1.5,
        canvasQuality: 0.75,
    },
} as const;

// ─── Ghostscript Argument Builder (DRY) ─────────────────────────────────────

/**
 * Build Ghostscript CLI args for the given compression profile.
 * These args are passed to the GS WASM module.
 */
export function getGhostscriptArgs(
    inputPath: string,
    outputPath: string,
    level: CompressionLevel,
    customDpi?: number
): string[] {
    const profile = COMPRESSION_PROFILES[level];
    const targetDpi = (level === 'custom' && customDpi) ? customDpi : profile.dpi;

    // Adjust GS settings based on DPI if Custom
    // If DPI < 100, use /screen to get better compression ratios
    // Otherwise use /ebook to preserve quality
    const gsSettings = (level === 'custom' && targetDpi < 100) 
        ? '/screen' 
        : profile.gsSettings;

    return [
        '-sDEVICE=pdfwrite',
        `-dPDFSETTINGS=${gsSettings}`,
        '-dNOPAUSE',
        '-dBATCH',
        '-dQUIET',
        // Image downsampling
        '-dDownsampleColorImages=true',
        '-dDownsampleGrayImages=true',
        '-dDownsampleMonoImages=true',
        `-dColorImageResolution=${targetDpi}`,
        `-dGrayImageResolution=${targetDpi}`,
        `-dMonoImageResolution=${targetDpi}`,
        // Compatibility
        '-dCompatibilityLevel=1.5',
        '-dAutoRotatePages=/None',
        // I/O
        `-sOutputFile=${outputPath}`,
        inputPath,
    ];
}

/**
 * Get the canvas fallback configuration for a given level.
 */
export function getCanvasFallbackConfig(level: CompressionLevel, customDpi?: number) {
    const profile = COMPRESSION_PROFILES[level];
    const dpi = (level === 'custom' && customDpi) ? customDpi : profile.dpi;
    
    // Scale canvas based on target DPI (96 is browser standard)
    // e.g. 150 DPI -> 1.56 scale
    const scale = dpi / 96;

    // Adjust quality slightly based on DPI
    const quality = dpi < 100 ? 0.6 : 0.75;

    return {
        scale,
        quality,
        dpi,
    };
}
