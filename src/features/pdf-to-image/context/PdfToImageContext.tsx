/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { generateId, readFileAsArrayBuffer, isValidPDF, downloadBlob } from '../../../utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImageFormat = 'png' | 'jpeg';
export type ScaleOption = 1 | 2 | 3;

export interface RenderedPage {
    id: string;
    pageIndex: number;       // 0-based
    thumbnailUrl: string | null;
    imageBlob: Blob | null;
    isSelected: boolean;
    width: number;
    height: number;
}

export interface PdfToImageFileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    isLoading: boolean;
    arrayBuffer: ArrayBuffer | null;
    error: string | null;
}

export interface ConversionOptions {
    format: ImageFormat;
    scale: ScaleOption;
    jpegQuality: number; // 0.0 – 1.0, only used when format === 'jpeg'
}

export interface PdfToImageProgress {
    status: 'idle' | 'loading' | 'rendering' | 'zipping' | 'complete' | 'error';
    progress: number;
    message: string;
}

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------

interface PdfToImageState {
    file: PdfToImageFileInfo | null;
    pages: RenderedPage[];
    options: ConversionOptions;
    progress: PdfToImageProgress;
    isRendering: boolean;
}

type PdfToImageAction =
    | { type: 'SET_FILE'; payload: PdfToImageFileInfo }
    | { type: 'UPDATE_FILE'; payload: Partial<PdfToImageFileInfo> }
    | { type: 'CLEAR_FILE' }
    | { type: 'SET_PAGES'; payload: RenderedPage[] }
    | { type: 'UPDATE_PAGE'; payload: { id: string; data: Partial<RenderedPage> } }
    | { type: 'TOGGLE_SELECT'; payload: string }
    | { type: 'SELECT_ALL' }
    | { type: 'DESELECT_ALL' }
    | { type: 'SET_OPTIONS'; payload: Partial<ConversionOptions> }
    | { type: 'SET_PROGRESS'; payload: PdfToImageProgress }
    | { type: 'SET_RENDERING'; payload: boolean };

const DEFAULT_OPTIONS: ConversionOptions = {
    format: 'png',
    scale: 1,
    jpegQuality: 0.92,
};

const INITIAL_PROGRESS: PdfToImageProgress = { status: 'idle', progress: 0, message: '' };

const initialState: PdfToImageState = {
    file: null,
    pages: [],
    options: DEFAULT_OPTIONS,
    progress: INITIAL_PROGRESS,
    isRendering: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: PdfToImageState, action: PdfToImageAction): PdfToImageState {
    switch (action.type) {
        case 'SET_FILE':
            return { ...state, file: action.payload };

        case 'UPDATE_FILE':
            if (!state.file) return state;
            return { ...state, file: { ...state.file, ...action.payload } };

        case 'CLEAR_FILE':
            return { ...initialState };

        case 'SET_PAGES':
            return { ...state, pages: action.payload };

        case 'UPDATE_PAGE':
            return {
                ...state,
                pages: state.pages.map((p) =>
                    p.id === action.payload.id ? { ...p, ...action.payload.data } : p
                ),
            };

        case 'TOGGLE_SELECT':
            return {
                ...state,
                pages: state.pages.map((p) =>
                    p.id === action.payload ? { ...p, isSelected: !p.isSelected } : p
                ),
            };

        case 'SELECT_ALL':
            return { ...state, pages: state.pages.map((p) => ({ ...p, isSelected: true })) };

        case 'DESELECT_ALL':
            return { ...state, pages: state.pages.map((p) => ({ ...p, isSelected: false })) };

        case 'SET_OPTIONS':
            return { ...state, options: { ...state.options, ...action.payload } };

        case 'SET_PROGRESS':
            return { ...state, progress: action.payload };

        case 'SET_RENDERING':
            return { ...state, isRendering: action.payload };

        default:
            return state;
    }
}

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

interface PdfToImageContextValue extends PdfToImageState {
    addFile: (files: File[]) => Promise<void>;
    removeFile: () => void;
    setOptions: (opts: Partial<ConversionOptions>) => void;
    renderPages: () => Promise<void>;
    toggleSelect: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    downloadPage: (id: string) => void;
    downloadSelected: () => Promise<void>;
    downloadAllAsZip: () => Promise<void>;
    selectedCount: number;
}

const PdfToImageContext = createContext<PdfToImageContextValue | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFileExtension(format: ImageFormat): string {
    return format === 'jpeg' ? 'jpg' : 'png';
}

function getMimeType(format: ImageFormat): string {
    return `image/${format}`;
}

/** Render a single PDF page to a Blob at the given scale + format. */
async function renderPageToBlob(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfDoc: any,
    pageNumber: number,
    scale: number,
    format: ImageFormat,
    jpegQuality: number,
): Promise<{ blob: Blob; width: number; height: number; thumbnailUrl: string }> {
    const page = await pdfDoc.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render({ canvasContext: ctx, viewport } as any)).promise;

    // Full-size blob
    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
            getMimeType(format),
            format === 'jpeg' ? jpegQuality : undefined,
        );
    });

    // Thumbnail (max 200px tall)
    const thumbScale = Math.min(200 / baseViewport.height, 1);
    const thumbViewport = page.getViewport({ scale: thumbScale });
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = thumbViewport.width;
    thumbCanvas.height = thumbViewport.height;
    const thumbCtx = thumbCanvas.getContext('2d')!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page.render({ canvasContext: thumbCtx, viewport: thumbViewport } as any)).promise;
    const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

    return { blob, width: viewport.width, height: viewport.height, thumbnailUrl };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PdfToImageProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // -- Load PDF --
    const addFile = useCallback(async (files: File[]) => {
        const pdf = files.find(isValidPDF);
        if (!pdf) return;

        const skeleton: PdfToImageFileInfo = {
            id: generateId(),
            file: pdf,
            name: pdf.name,
            size: pdf.size,
            pageCount: 0,
            isLoading: true,
            arrayBuffer: null,
            error: null,
        };

        dispatch({ type: 'SET_FILE', payload: skeleton });
        dispatch({ type: 'SET_PAGES', payload: [] });
        dispatch({ type: 'SET_PROGRESS', payload: INITIAL_PROGRESS });

        try {
            const buffer = await readFileAsArrayBuffer(pdf);
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const doc = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
            const pageCount = doc.numPages;
            doc.destroy();

            // Initialize page placeholders
            const pages: RenderedPage[] = Array.from({ length: pageCount }, (_, i) => ({
                id: generateId(),
                pageIndex: i,
                thumbnailUrl: null,
                imageBlob: null,
                isSelected: true,
                width: 0,
                height: 0,
            }));

            dispatch({ type: 'SET_PAGES', payload: pages });
            dispatch({
                type: 'UPDATE_FILE',
                payload: { pageCount, isLoading: false, arrayBuffer: buffer },
            });
        } catch (err) {
            dispatch({
                type: 'UPDATE_FILE',
                payload: {
                    isLoading: false,
                    error: err instanceof Error ? err.message : 'Failed to load PDF',
                },
            });
        }
    }, []);

    const removeFile = useCallback(() => {
        dispatch({ type: 'CLEAR_FILE' });
    }, []);

    const setOptions = useCallback((opts: Partial<ConversionOptions>) => {
        dispatch({ type: 'SET_OPTIONS', payload: opts });
    }, []);

    // -- Render all pages to images --
    const renderPages = useCallback(async () => {
        const { file, pages, options } = state;
        if (!file?.arrayBuffer || pages.length === 0) return;

        dispatch({ type: 'SET_RENDERING', payload: true });
        dispatch({
            type: 'SET_PROGRESS',
            payload: { status: 'rendering', progress: 0, message: 'Rendering pages…' },
        });

        try {
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const doc = await pdfjsLib.getDocument({ data: file.arrayBuffer.slice(0) }).promise;
            const total = pages.length;

            // Render in batches of 3 for responsiveness
            const BATCH = 3;
            for (let batchStart = 0; batchStart < total; batchStart += BATCH) {
                const batchEnd = Math.min(batchStart + BATCH, total);
                const promises = [];

                for (let i = batchStart; i < batchEnd; i++) {
                    const page = pages[i];
                    promises.push(
                        renderPageToBlob(
                            doc,
                            page.pageIndex + 1,
                            options.scale,
                            options.format,
                            options.jpegQuality,
                        ).then(({ blob, width, height, thumbnailUrl }) => {
                            dispatch({
                                type: 'UPDATE_PAGE',
                                payload: {
                                    id: page.id,
                                    data: { imageBlob: blob, width, height, thumbnailUrl },
                                },
                            });
                        })
                    );
                }

                await Promise.all(promises);
                const pct = Math.round(((batchEnd) / total) * 100);
                dispatch({
                    type: 'SET_PROGRESS',
                    payload: {
                        status: 'rendering',
                        progress: pct,
                        message: `Rendered ${batchEnd} of ${total} pages`,
                    },
                });
            }

            doc.destroy();

            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'complete', progress: 100, message: 'Rendering complete!' },
            });
            setTimeout(() => {
                dispatch({ type: 'SET_PROGRESS', payload: INITIAL_PROGRESS });
            }, 3000);
        } catch (err) {
            dispatch({
                type: 'SET_PROGRESS',
                payload: {
                    status: 'error',
                    progress: 0,
                    message: err instanceof Error ? err.message : 'Rendering failed',
                },
            });
        } finally {
            dispatch({ type: 'SET_RENDERING', payload: false });
        }
    }, [state]);

    // -- Selection --
    const toggleSelect = useCallback((id: string) => {
        dispatch({ type: 'TOGGLE_SELECT', payload: id });
    }, []);

    const selectAll = useCallback(() => {
        dispatch({ type: 'SELECT_ALL' });
    }, []);

    const deselectAll = useCallback(() => {
        dispatch({ type: 'DESELECT_ALL' });
    }, []);

    // -- Download single page --
    const downloadPage = useCallback(
        (id: string) => {
            const page = state.pages.find((p) => p.id === id);
            if (!page?.imageBlob || !state.file) return;

            const baseName = state.file.name.replace(/\.pdf$/i, '');
            const ext = getFileExtension(state.options.format);
            const fileName = `${baseName}_${page.pageIndex + 1}.${ext}`;

            downloadBlob(page.imageBlob, fileName);
        },
        [state.pages, state.file, state.options.format],
    );

    // -- Download selected as ZIP --
    const downloadSelected = useCallback(async () => {
        const { file, pages, options } = state;
        if (!file) return;

        const selected = pages.filter((p) => p.isSelected && p.imageBlob);
        if (selected.length === 0) return;

        // Single file: download directly
        if (selected.length === 1) {
            const page = selected[0];
            const baseName = file.name.replace(/\.pdf$/i, '');
            const ext = getFileExtension(options.format);
            downloadBlob(page.imageBlob!, `${baseName}_${page.pageIndex + 1}.${ext}`);
            return;
        }

        dispatch({
            type: 'SET_PROGRESS',
            payload: { status: 'zipping', progress: 0, message: 'Creating ZIP…' },
        });

        try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const baseName = file.name.replace(/\.pdf$/i, '');
            const ext = getFileExtension(options.format);

            for (const page of selected) {
                zip.file(`${baseName}_${page.pageIndex + 1}.${ext}`, page.imageBlob!);
            }

            const blob = await zip.generateAsync(
                { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
                (meta) => {
                    dispatch({
                        type: 'SET_PROGRESS',
                        payload: {
                            status: 'zipping',
                            progress: Math.round(meta.percent),
                            message: `Zipping… ${Math.round(meta.percent)}%`,
                        },
                    });
                },
            );

            downloadBlob(blob, `${baseName}_images.zip`);

            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'complete', progress: 100, message: 'Download started!' },
            });
            setTimeout(() => {
                dispatch({ type: 'SET_PROGRESS', payload: INITIAL_PROGRESS });
            }, 3000);
        } catch (err) {
            dispatch({
                type: 'SET_PROGRESS',
                payload: {
                    status: 'error',
                    progress: 0,
                    message: err instanceof Error ? err.message : 'ZIP creation failed',
                },
            });
        }
    }, [state]);

    // -- Download ALL as ZIP --
    const downloadAllAsZip = useCallback(async () => {
        const { file, pages, options } = state;
        if (!file) return;

        const withBlobs = pages.filter((p) => p.imageBlob);
        if (withBlobs.length === 0) return;

        dispatch({
            type: 'SET_PROGRESS',
            payload: { status: 'zipping', progress: 0, message: 'Creating ZIP…' },
        });

        try {
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            const baseName = file.name.replace(/\.pdf$/i, '');
            const ext = getFileExtension(options.format);

            for (const page of withBlobs) {
                zip.file(`${baseName}_${page.pageIndex + 1}.${ext}`, page.imageBlob!);
            }

            const blob = await zip.generateAsync(
                { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
                (meta) => {
                    dispatch({
                        type: 'SET_PROGRESS',
                        payload: {
                            status: 'zipping',
                            progress: Math.round(meta.percent),
                            message: `Zipping… ${Math.round(meta.percent)}%`,
                        },
                    });
                },
            );

            downloadBlob(blob, `${baseName}_images.zip`);

            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'complete', progress: 100, message: 'Download started!' },
            });
            setTimeout(() => {
                dispatch({ type: 'SET_PROGRESS', payload: INITIAL_PROGRESS });
            }, 3000);
        } catch (err) {
            dispatch({
                type: 'SET_PROGRESS',
                payload: {
                    status: 'error',
                    progress: 0,
                    message: err instanceof Error ? err.message : 'ZIP creation failed',
                },
            });
        }
    }, [state]);

    const selectedCount = state.pages.filter((p) => p.isSelected).length;

    const value: PdfToImageContextValue = {
        ...state,
        addFile,
        removeFile,
        setOptions,
        renderPages,
        toggleSelect,
        selectAll,
        deselectAll,
        downloadPage,
        downloadSelected,
        downloadAllAsZip,
        selectedCount,
    };

    return <PdfToImageContext.Provider value={value}>{children}</PdfToImageContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePdfToImage(): PdfToImageContextValue {
    const ctx = useContext(PdfToImageContext);
    if (!ctx) throw new Error('usePdfToImage must be used within a PdfToImageProvider');
    return ctx;
}
