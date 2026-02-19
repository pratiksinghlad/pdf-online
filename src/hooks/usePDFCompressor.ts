/**
 * usePDFCompressor Hook
 *
 * React hook that wraps CompressionService to provide a clean API
 * for compressing PDFs with progress, status, and error management.
 *
 * Usage:
 *   const { compress, cancel, status, progress, error, engine } = usePDFCompressor();
 *   const result = await compress(buffer, 'basic');
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
    getCompressionService,
} from '../services/compressionService';
import type {
    CompressionService,
    CompressOutcome,
} from '../services/compressionService';
import type { CompressionLevel } from '../types/compress';

// ─── Types ──────────────────────────────────────────────────────────────────

export type CompressorStatus = 'idle' | 'initializing' | 'compressing' | 'done' | 'error';

export interface UsePDFCompressorReturn {
    /** Compress a PDF buffer with the given profile */
    compress: (buffer: ArrayBuffer, level: CompressionLevel, removeMetadata?: boolean) => Promise<CompressOutcome>;
    /** Cancel the current compression */
    cancel: () => void;
    /** Current status */
    status: CompressorStatus;
    /** Progress percentage (0-100) */
    progress: number;
    /** Progress message */
    progressMessage: string;
    /** Last error message */
    error: string | null;
    /** Active compression engine */
    engine: 'ghostscript' | 'canvas-fallback' | 'unknown';
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePDFCompressor(): UsePDFCompressorReturn {
    const serviceRef = useRef<CompressionService | null>(null);
    const [status, setStatus] = useState<CompressorStatus>('idle');
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [engine, setEngine] = useState<'ghostscript' | 'canvas-fallback' | 'unknown'>('unknown');

    // Initialize service on mount
    useEffect(() => {
        const service = getCompressionService();
        serviceRef.current = service;

        service
            .initialize()
            .then(({ engine: activeEngine }) => {
                setEngine(activeEngine);
                setStatus('idle');
            })
            .catch((err) => {
                console.error('[usePDFCompressor] Init failed:', err);
                setError('Failed to initialize compression service');
                setStatus('error');
            });

        return () => {
            // Don't destroy the singleton, just cancel pending
            service.cancel();
        };
    }, []);

    const compress = useCallback(
        async (
            buffer: ArrayBuffer,
            level: CompressionLevel,
            removeMetadata: boolean = true
        ): Promise<CompressOutcome> => {
            const service = serviceRef.current;
            if (!service) {
                return { success: false, error: 'Service not initialized' };
            }

            setStatus('compressing');
            setProgress(0);
            setProgressMessage('Starting compression...');
            setError(null);

            const result = await service.compressFile(
                buffer,
                level,
                removeMetadata,
                (pct, msg) => {
                    setProgress(pct);
                    setProgressMessage(msg);
                }
            );

            if (result.success) {
                setStatus('done');
                setProgress(100);
                setProgressMessage('Compression complete!');
                setEngine(result.engine);
            } else {
                setStatus('error');
                setError(result.error);
            }

            return result;
        },
        []
    );

    const cancel = useCallback(() => {
        serviceRef.current?.cancel();
        setStatus('idle');
        setProgress(0);
        setProgressMessage('');
    }, []);

    return {
        compress,
        cancel,
        status,
        progress,
        progressMessage,
        error,
        engine,
    };
}
