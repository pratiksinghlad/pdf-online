/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ImageFileInfo, ConvertProgress, ImageToPDFOptions } from '../types/image';
import { generateId, formatFileSize, downloadBlob } from '../utils';
import { jsPDF } from 'jspdf';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------


/**
 * File extensions that indicate HEIC/HEIF format.
 * Browsers report these as "" or "image/heic" / "image/heif" inconsistently,
 * so we also check the filename extension as a fallback.
 */
const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);

// ---------------------------------------------------------------------------
// State, Actions, Types
// ---------------------------------------------------------------------------

interface ImageToPDFState {
    files: ImageFileInfo[];
    convertProgress: ConvertProgress;
    options: ImageToPDFOptions;
    isLoading: boolean;
    error: string | null;
}

type ImageToPDFAction =
    | { type: 'ADD_FILES'; payload: ImageFileInfo[] }
    | { type: 'REMOVE_FILE'; payload: string }
    | { type: 'UPDATE_FILE'; payload: { id: string; updates: Partial<ImageFileInfo> } }
    | { type: 'REORDER_FILES'; payload: ImageFileInfo[] }
    | { type: 'MOVE_FILE'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'CLEAR_FILES' }
    | { type: 'SET_CONVERT_PROGRESS'; payload: ConvertProgress }
    | { type: 'SET_OPTIONS'; payload: Partial<ImageToPDFOptions> }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

const defaultOptions: ImageToPDFOptions = {
    pageSize: 'A4',
    orientation: 'auto',
    margin: 10,
    imageQuality: 0.92,
};

const initialState: ImageToPDFState = {
    files: [],
    convertProgress: { status: 'idle', progress: 0, message: '' },
    options: defaultOptions,
    isLoading: false,
    error: null,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function imageToPDFReducer(state: ImageToPDFState, action: ImageToPDFAction): ImageToPDFState {
    switch (action.type) {
        case 'ADD_FILES':
            return { ...state, files: [...state.files, ...action.payload], error: null };
        case 'REMOVE_FILE':
            return { ...state, files: state.files.filter((f) => f.id !== action.payload) };
        case 'UPDATE_FILE':
            return {
                ...state,
                files: state.files.map((f) =>
                    f.id === action.payload.id ? { ...f, ...action.payload.updates } : f
                ),
            };
        case 'REORDER_FILES':
            return { ...state, files: action.payload };
        case 'MOVE_FILE': {
            const { fromIndex, toIndex } = action.payload;
            const newFiles = [...state.files];
            const [movedFile] = newFiles.splice(fromIndex, 1);
            newFiles.splice(toIndex, 0, movedFile);
            return { ...state, files: newFiles };
        }
        case 'CLEAR_FILES':
            return { ...state, files: [], convertProgress: initialState.convertProgress };
        case 'SET_CONVERT_PROGRESS':
            return { ...state, convertProgress: action.payload };
        case 'SET_OPTIONS':
            return { ...state, options: { ...state.options, ...action.payload } };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

interface ImageToPDFContextValue extends ImageToPDFState {
    addFiles: (files: File[]) => Promise<void>;
    removeFile: (id: string) => void;
    reorderFiles: (files: ImageFileInfo[]) => void;
    moveFile: (fromIndex: number, toIndex: number) => void;
    moveFileToTop: (id: string) => void;
    moveFileToBottom: (id: string) => void;
    clearFiles: () => void;
    convertToPDF: () => Promise<void>;
    setOptions: (options: Partial<ImageToPDFOptions>) => void;
}

const ImageToPDFContext = createContext<ImageToPDFContextValue | null>(null);

// ---------------------------------------------------------------------------
// Image helpers
// ---------------------------------------------------------------------------

/** Returns true if the file appears to be HEIC/HEIF by MIME type or extension. */
function isHeicFile(file: File): boolean {
    if (file.type === 'image/heic' || file.type === 'image/heif') return true;
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return HEIC_EXTENSIONS.has(ext);
}

/**
 * Accepts ANY image file and resolves with a PNG data-URL suitable for jsPDF.
 *
 * Pipeline:
 *   HEIC/HEIF  → heic2any (Blob JPEG) → canvas → PNG data-URL
 *   Other      → FileReader (data-URL) → <img>   → canvas → PNG data-URL
 *
 * Using canvas as the final step guarantees a uniform PNG output regardless
 * of source format (TIFF, AVIF, SVG, BMP, WebP, etc.), so jsPDF never has
 * to deal with exotic MIME types.
 */
async function normalizeImageToDataUrl(
    file: File
): Promise<{ dataUrl: string; width: number; height: number }> {
    let sourceBlob: Blob = file;

    // Step 1 — Convert HEIC/HEIF to JPEG blob first (heic2any is browser-only,
    // but this feature is inherently browser-only anyway).
    if (isHeicFile(file)) {
        const heic2any = (await import('heic2any')).default;
        const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
        sourceBlob = Array.isArray(converted) ? converted[0] : converted;
    }

    // Step 2 — Read blob as object-URL and draw onto a canvas to produce a
    // normalised PNG data-URL.
    const objectUrl = URL.createObjectURL(sourceBlob);
    try {
        const { dataUrl, width, height } = await drawImageToCanvas(objectUrl);
        return { dataUrl, width, height };
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

/** Draws an image (by URL) to an offscreen canvas and returns a PNG data-URL. */
function drawImageToCanvas(
    src: string
): Promise<{ dataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas 2D context unavailable'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            resolve({
                dataUrl: canvas.toDataURL('image/png'),
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };
        img.onerror = () => reject(new Error('Failed to decode image'));
        img.src = src;
    });
}

/** Returns true for any file that is plausibly an image. */
function isAcceptedImageFile(file: File): boolean {
    // Accept by known MIME type
    if (file.type.startsWith('image/')) return true;
    // Accept HEIC/HEIF which may report an empty MIME type on some browsers
    if (isHeicFile(file)) return true;
    return false;
}

/** Produces a stable, timestamped PDF filename. */
function generatePDFFilename(): string {
    const ts = new Date()
        .toISOString()
        .replace(/[:-]/g, '')
        .replace('T', '_')
        .split('.')[0];
    return `images_to_pdf_${ts}.pdf`;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ImageToPDFProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(imageToPDFReducer, initialState);

    // Revoke object-URLs when files are removed to prevent memory leaks.
    useEffect(() => {
        return () => {
            state.files.forEach((f) => {
                if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
            });
        };
    }, [state.files]);

    // -----------------------------------------------------------------------
    // addFiles — accepts any image type including HEIC/HEIF
    // -----------------------------------------------------------------------
    const addFiles = useCallback(async (files: File[]) => {
        const validFiles = files.filter(isAcceptedImageFile);

        if (validFiles.length === 0) {
            dispatch({
                type: 'SET_ERROR',
                payload: 'Please select valid image files (JPG, PNG, WebP, HEIC, TIFF, AVIF, BMP…)',
            });
            return;
        }

        // Create skeleton entries immediately so the UI feels responsive.
        const newFiles: ImageFileInfo[] = validFiles.map((file) => ({
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            width: 0,
            height: 0,
            thumbnailUrl: null,
            // For HEIC, createObjectURL still gives a URL the browser uses as
            // src for <video>; for previewing we'll replace it once decoded.
            previewUrl: isHeicFile(file) ? null : URL.createObjectURL(file),
            isLoading: true,
            error: null,
        }));

        dispatch({ type: 'ADD_FILES', payload: newFiles });

        // Process each file sequentially to avoid thrashing memory.
        for (const fileInfo of newFiles) {
            if (fileInfo.size > 50 * 1024 * 1024) {
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                        id: fileInfo.id,
                        updates: {
                            error: `Large file (${formatFileSize(fileInfo.size)}). Processing may be slow.`,
                        },
                    },
                });
            }

            try {
                const { dataUrl, width, height } = await normalizeImageToDataUrl(fileInfo.file);
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                        id: fileInfo.id,
                        updates: {
                            width,
                            height,
                            thumbnailUrl: dataUrl,
                            previewUrl: fileInfo.previewUrl ?? dataUrl,
                            isLoading: false,
                            error: null,
                        },
                    },
                });
            } catch (err) {
                console.error('Error processing image:', err);
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                        id: fileInfo.id,
                        updates: {
                            isLoading: false,
                            error: err instanceof Error ? err.message : 'Failed to process image',
                        },
                    },
                });
            }
        }
    }, []);

    // -----------------------------------------------------------------------
    // File management
    // -----------------------------------------------------------------------

    const removeFile = useCallback(
        (id: string) => {
            const file = state.files.find((f) => f.id === id);
            if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
            dispatch({ type: 'REMOVE_FILE', payload: id });
        },
        [state.files]
    );

    const reorderFiles = useCallback((files: ImageFileInfo[]) => {
        dispatch({ type: 'REORDER_FILES', payload: files });
    }, []);

    const moveFile = useCallback((fromIndex: number, toIndex: number) => {
        dispatch({ type: 'MOVE_FILE', payload: { fromIndex, toIndex } });
    }, []);

    const moveFileToTop = useCallback(
        (id: string) => {
            const index = state.files.findIndex((f) => f.id === id);
            if (index > 0) dispatch({ type: 'MOVE_FILE', payload: { fromIndex: index, toIndex: 0 } });
        },
        [state.files]
    );

    const moveFileToBottom = useCallback(
        (id: string) => {
            const index = state.files.findIndex((f) => f.id === id);
            if (index >= 0 && index < state.files.length - 1) {
                dispatch({
                    type: 'MOVE_FILE',
                    payload: { fromIndex: index, toIndex: state.files.length - 1 },
                });
            }
        },
        [state.files]
    );

    const clearFiles = useCallback(() => {
        state.files.forEach((f) => {
            if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
        dispatch({ type: 'CLEAR_FILES' });
    }, [state.files]);

    const setOptions = useCallback((options: Partial<ImageToPDFOptions>) => {
        dispatch({ type: 'SET_OPTIONS', payload: options });
    }, []);

    // -----------------------------------------------------------------------
    // convertToPDF
    // -----------------------------------------------------------------------

    const convertToPDF = useCallback(async () => {
        if (state.files.length === 0) {
            dispatch({ type: 'SET_ERROR', payload: 'No images to convert' });
            return;
        }

        dispatch({
            type: 'SET_CONVERT_PROGRESS',
            payload: { status: 'loading', progress: 10, message: 'Preparing images…' },
        });

        try {
            const { pageSize, orientation, margin } = state.options;

            const pageSizes: Record<string, { width: number; height: number }> = {
                A4: { width: 210, height: 297 },
                Letter: { width: 215.9, height: 279.4 },
                // 'Original' is resolved per-image from the actual image dimensions.
                Original: { width: 210, height: 297 },
            };

            let pdf: jsPDF | null = null;
            const totalFiles = state.files.length;

            for (let i = 0; i < totalFiles; i++) {
                const fileInfo = state.files[i];

                dispatch({
                    type: 'SET_CONVERT_PROGRESS',
                    payload: {
                        status: 'converting',
                        progress: 10 + Math.round((i / totalFiles) * 80),
                        message: `Processing image ${i + 1} of ${totalFiles}…`,
                    },
                });

                // All images arrive as PNG data-URLs (already normalised), so we
                // can always use the 'PNG' format with jsPDF—no format guessing.
                const imageData = fileInfo.thumbnailUrl ?? fileInfo.previewUrl;
                if (!imageData) continue;

                // Recover actual pixel dimensions from the stored values.
                const naturalWidth = fileInfo.width || 1;
                const naturalHeight = fileInfo.height || 1;

                // Determine page dimensions in mm.
                let pageWidth: number;
                let pageHeight: number;
                let imgOrientation: 'portrait' | 'landscape';

                if (pageSize === 'Original') {
                    pageWidth = (naturalWidth / 96) * 25.4;
                    pageHeight = (naturalHeight / 96) * 25.4;
                    imgOrientation = pageWidth > pageHeight ? 'landscape' : 'portrait';
                } else {
                    const base = pageSizes[pageSize];
                    const aspect = naturalWidth / naturalHeight;
                    imgOrientation =
                        orientation === 'auto'
                            ? aspect > 1
                                ? 'landscape'
                                : 'portrait'
                            : orientation;

                    if (imgOrientation === 'landscape') {
                        pageWidth = base.height;
                        pageHeight = base.width;
                    } else {
                        pageWidth = base.width;
                        pageHeight = base.height;
                    }
                }

                if (i === 0) {
                    pdf = new jsPDF({
                        orientation: imgOrientation,
                        unit: 'mm',
                        format: [pageWidth, pageHeight],
                    });
                } else {
                    pdf!.addPage([pageWidth, pageHeight], imgOrientation);
                }

                // Fit image within margins, preserving aspect ratio.
                const availableWidth = pageWidth - 2 * margin;
                const availableHeight = pageHeight - 2 * margin;
                const imgAspect = naturalWidth / naturalHeight;
                const areaAspect = availableWidth / availableHeight;

                let drawWidth: number;
                let drawHeight: number;

                if (imgAspect > areaAspect) {
                    drawWidth = availableWidth;
                    drawHeight = availableWidth / imgAspect;
                } else {
                    drawHeight = availableHeight;
                    drawWidth = availableHeight * imgAspect;
                }

                const x = margin + (availableWidth - drawWidth) / 2;
                const y = margin + (availableHeight - drawHeight) / 2;

                // All images are normalised to PNG by the pipeline above.
                pdf!.addImage(imageData, 'PNG', x, y, drawWidth, drawHeight, undefined, 'MEDIUM');
            }

            dispatch({
                type: 'SET_CONVERT_PROGRESS',
                payload: { status: 'converting', progress: 95, message: 'Generating PDF…' },
            });

            const pdfBlob = pdf!.output('blob');
            downloadBlob(pdfBlob, generatePDFFilename());

            dispatch({
                type: 'SET_CONVERT_PROGRESS',
                payload: { status: 'complete', progress: 100, message: 'Download started!' },
            });

            setTimeout(() => {
                clearFiles();
                dispatch({ type: 'SET_CONVERT_PROGRESS', payload: initialState.convertProgress });
            }, 3000);
        } catch (err) {
            console.error('Error converting to PDF:', err);
            dispatch({
                type: 'SET_CONVERT_PROGRESS',
                payload: {
                    status: 'error',
                    progress: 0,
                    message: err instanceof Error ? err.message : 'Failed to convert images to PDF',
                },
            });
        }
    }, [state.files, state.options, clearFiles]);

    // -----------------------------------------------------------------------
    // Context value
    // -----------------------------------------------------------------------

    const value: ImageToPDFContextValue = {
        ...state,
        addFiles,
        removeFile,
        reorderFiles,
        moveFile,
        moveFileToTop,
        moveFileToBottom,
        clearFiles,
        convertToPDF,
        setOptions,
    };

    return <ImageToPDFContext.Provider value={value}>{children}</ImageToPDFContext.Provider>;
}

// ---------------------------------------------------------------------------
// Custom hook
// ---------------------------------------------------------------------------

export function useImageToPDF(): ImageToPDFContextValue {
    const context = useContext(ImageToPDFContext);
    if (!context) {
        throw new Error('useImageToPDF must be used within an ImageToPDFProvider');
    }
    return context;
}
