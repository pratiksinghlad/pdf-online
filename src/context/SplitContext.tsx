/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { generateId, readFileAsArrayBuffer, isValidPDF, downloadBlob } from '../utils';
import SplitWorker from '../workers/splitWorker?worker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageRange {
    id: string;
    from: number; // 1-based, inclusive
    to: number;   // 1-based, inclusive
}

export interface SplitFileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    thumbnailUrl: string | null;
    isLoading: boolean;
    arrayBuffer: ArrayBuffer | null;
    error: string | null;
}

export interface SplitProgress {
    status: 'idle' | 'loading' | 'splitting' | 'complete' | 'error';
    progress: number;
    message: string;
}

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------

interface SplitState {
    file: SplitFileInfo | null;
    ranges: PageRange[];
    outputMode: 'separate' | 'single';
    progress: SplitProgress;
}

type SplitAction =
    | { type: 'SET_FILE'; payload: SplitFileInfo }
    | { type: 'UPDATE_FILE'; payload: Partial<SplitFileInfo> }
    | { type: 'CLEAR_FILE' }
    | { type: 'ADD_RANGE'; payload: PageRange }
    | { type: 'UPDATE_RANGE'; payload: { id: string; updates: Partial<PageRange> } }
    | { type: 'REMOVE_RANGE'; payload: string }
    | { type: 'SET_OUTPUT_MODE'; payload: 'separate' | 'single' }
    | { type: 'SET_PROGRESS'; payload: SplitProgress };

const initialProgress: SplitProgress = { status: 'idle', progress: 0, message: '' };

const initialState: SplitState = {
    file: null,
    ranges: [{ id: generateId(), from: 1, to: 1 }],
    outputMode: 'separate',
    progress: initialProgress,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function splitReducer(state: SplitState, action: SplitAction): SplitState {
    switch (action.type) {
        case 'SET_FILE':
            return { ...state, file: action.payload };
        case 'UPDATE_FILE':
            if (!state.file) return state;
            return { ...state, file: { ...state.file, ...action.payload } };
        case 'CLEAR_FILE':
            return { ...state, file: null, ranges: [{ id: generateId(), from: 1, to: 1 }], progress: initialProgress };
        case 'ADD_RANGE':
            return { ...state, ranges: [...state.ranges, action.payload] };
        case 'UPDATE_RANGE':
            return {
                ...state,
                ranges: state.ranges.map((r) =>
                    r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
                ),
            };
        case 'REMOVE_RANGE':
            return { ...state, ranges: state.ranges.filter((r) => r.id !== action.payload) };
        case 'SET_OUTPUT_MODE':
            return { ...state, outputMode: action.payload };
        case 'SET_PROGRESS':
            return { ...state, progress: action.payload };
        default:
            return state;
    }
}

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

interface SplitContextValue extends SplitState {
    addFile: (files: File[]) => Promise<void>;
    removeFile: () => void;
    addRange: () => void;
    updateRange: (id: string, updates: Partial<PageRange>) => void;
    removeRange: (id: string) => void;
    setOutputMode: (mode: 'separate' | 'single') => void;
    splitPDF: () => Promise<void>;
}

const SplitContext = createContext<SplitContextValue | null>(null);

// ---------------------------------------------------------------------------
// Thumbnail helper (reuses pdfjs pattern from CompressContext)
// ---------------------------------------------------------------------------

async function generateThumbnail(buffer: ArrayBuffer): Promise<string | null> {
    try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const task = pdfjsLib.getDocument({ data: buffer.slice(0) });
        const pdf = await task.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 96 / page.getViewport({ scale: 1 }).height });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await page.render({ canvasContext: ctx, viewport } as any).promise;
        const url = canvas.toDataURL('image/jpeg', 0.7);
        pdf.destroy();
        return url;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Filename helpers
// ---------------------------------------------------------------------------

function buildSeparateFilename(originalName: string, rangeLabel: string): string {
    const base = originalName.replace(/\.pdf$/i, '');
    return `${base}_pages_${rangeLabel}.pdf`;
}

function buildSingleFilename(originalName: string): string {
    const base = originalName.replace(/\.pdf$/i, '');
    return `${base}_split.pdf`;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function SplitProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(splitReducer, initialState);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        workerRef.current = new SplitWorker();
        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const addFile = useCallback(async (files: File[]) => {
        const pdf = files.find(isValidPDF);
        if (!pdf) return;

        const skeleton: SplitFileInfo = {
            id: generateId(),
            file: pdf,
            name: pdf.name,
            size: pdf.size,
            pageCount: 0,
            thumbnailUrl: null,
            isLoading: true,
            arrayBuffer: null,
            error: null,
        };

        dispatch({ type: 'SET_FILE', payload: skeleton });

        try {
            const buffer = await readFileAsArrayBuffer(pdf);
            // Get page count via the worker
            const pageCount = await new Promise<number>((resolve) => {
                if (!workerRef.current) { resolve(0); return; }
                // We re-use pdfjs for page count to avoid loading the split worker twice
                import('pdfjs-dist').then((pdfjsLib) => {
                    pdfjsLib.GlobalWorkerOptions.workerSrc =
                        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                    pdfjsLib.getDocument({ data: buffer.slice(0) }).promise
                        .then((doc) => { resolve(doc.numPages); doc.destroy(); })
                        .catch(() => resolve(0));
                });
            });

            const thumbnailUrl = await generateThumbnail(buffer);

            dispatch({
                type: 'UPDATE_FILE',
                payload: { pageCount, thumbnailUrl, isLoading: false, arrayBuffer: buffer },
            });

            // Seed the first range's `to` with the page count
            if (pageCount > 0) {
                dispatch({ type: 'UPDATE_RANGE', payload: { id: state.ranges[0].id, updates: { to: pageCount } } });
            }
        } catch (err) {
            dispatch({
                type: 'UPDATE_FILE',
                payload: {
                    isLoading: false,
                    error: err instanceof Error ? err.message : 'Failed to load PDF',
                },
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const removeFile = useCallback(() => {
        dispatch({ type: 'CLEAR_FILE' });
    }, []);

    const addRange = useCallback(() => {
        const totalPages = state.file?.pageCount ?? 1;
        dispatch({
            type: 'ADD_RANGE',
            payload: { id: generateId(), from: 1, to: totalPages },
        });
    }, [state.file?.pageCount]);

    const updateRange = useCallback((id: string, updates: Partial<PageRange>) => {
        dispatch({ type: 'UPDATE_RANGE', payload: { id, updates } });
    }, []);

    const removeRange = useCallback((id: string) => {
        dispatch({ type: 'REMOVE_RANGE', payload: id });
    }, []);

    const setOutputMode = useCallback((mode: 'separate' | 'single') => {
        dispatch({ type: 'SET_OUTPUT_MODE', payload: mode });
    }, []);

    const splitPDF = useCallback(async () => {
        const { file, ranges, outputMode } = state;

        if (!file || !file.arrayBuffer) {
            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'error', progress: 0, message: 'No PDF loaded' },
            });
            return;
        }

        if (ranges.length === 0) {
            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'error', progress: 0, message: 'Add at least one range' },
            });
            return;
        }

        dispatch({
            type: 'SET_PROGRESS',
            payload: { status: 'loading', progress: 10, message: 'Preparing…' },
        });

        const id = generateId();
        const bufferToTransfer = file.arrayBuffer.slice(0);

        try {
            const result = await new Promise<{
                success: boolean;
                outputMode: 'separate' | 'single';
                files?: { data: ArrayBuffer; rangeLabel: string }[];
                data?: ArrayBuffer;
                error?: string;
            }>((resolve, reject) => {
                if (!workerRef.current) { reject(new Error('Worker not available')); return; }

                const handler = (e: MessageEvent) => {
                    if (e.data.id === id) {
                        workerRef.current?.removeEventListener('message', handler);
                        resolve(e.data.result);
                    }
                };

                workerRef.current.addEventListener('message', handler);

                dispatch({
                    type: 'SET_PROGRESS',
                    payload: { status: 'splitting', progress: 40, message: 'Splitting pages…' },
                });

                workerRef.current.postMessage(
                    { type: 'split', id, payload: { buffer: bufferToTransfer, ranges, outputMode } },
                    [bufferToTransfer]
                );

                // Safety timeout — 60 s
                setTimeout(() => {
                    workerRef.current?.removeEventListener('message', handler);
                    reject(new Error('Split timed out. Please try again.'));
                }, 60_000);
            });

            if (!result.success) {
                throw new Error(result.error ?? 'Split failed');
            }

            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'splitting', progress: 85, message: 'Preparing download…' },
            });

            if (result.outputMode === 'separate' && result.files) {
                for (const f of result.files) {
                    downloadBlob(f.data, buildSeparateFilename(file.name, f.rangeLabel));
                    // Small stagger to avoid browser popup blockers
                    await new Promise((r) => setTimeout(r, 250));
                }
            } else if (result.outputMode === 'single' && result.data) {
                downloadBlob(result.data, buildSingleFilename(file.name));
            }

            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'complete', progress: 100, message: 'Download started!' },
            });

            setTimeout(() => {
                dispatch({ type: 'SET_PROGRESS', payload: initialProgress });
            }, 3000);
        } catch (err) {
            dispatch({
                type: 'SET_PROGRESS',
                payload: {
                    status: 'error',
                    progress: 0,
                    message: err instanceof Error ? err.message : 'Split failed',
                },
            });
        }
    }, [state]);

    const value: SplitContextValue = {
        ...state,
        addFile,
        removeFile,
        addRange,
        updateRange,
        removeRange,
        setOutputMode,
        splitPDF,
    };

    return <SplitContext.Provider value={value}>{children}</SplitContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSplit(): SplitContextValue {
    const ctx = useContext(SplitContext);
    if (!ctx) throw new Error('useSplit must be used within a SplitProvider');
    return ctx;
}
