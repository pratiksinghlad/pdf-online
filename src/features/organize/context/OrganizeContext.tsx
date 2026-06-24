/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import { generateId, readFileAsArrayBuffer, isValidPDF, downloadBlob } from '../../../utils';
import OrganizeWorker from '../workers/organizeWorker?worker';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrganizedPage {
    id: string;
    pageIndex: number;   // 0-based index in the source PDF
    rotation: number;    // 0, 90, 180, 270
    thumbnailUrl: string | null;
    isSelected: boolean;
}

export interface OrganizeFileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    isLoading: boolean;
    arrayBuffer: ArrayBuffer | null;
    error: string | null;
}

export interface OrganizeProgress {
    status: 'idle' | 'loading' | 'processing' | 'complete' | 'error';
    progress: number;
    message: string;
}

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------

interface OrganizeState {
    file: OrganizeFileInfo | null;
    pages: OrganizedPage[];
    progress: OrganizeProgress;
    thumbnailsLoading: boolean;
}

type OrganizeAction =
    | { type: 'SET_FILE'; payload: OrganizeFileInfo }
    | { type: 'UPDATE_FILE'; payload: Partial<OrganizeFileInfo> }
    | { type: 'CLEAR_FILE' }
    | { type: 'SET_PAGES'; payload: OrganizedPage[] }
    | { type: 'REORDER_PAGES'; payload: OrganizedPage[] }
    | { type: 'ROTATE_PAGE'; payload: { id: string; direction: 'cw' | 'ccw' } }
    | { type: 'ROTATE_SELECTED'; payload: 'cw' | 'ccw' }
    | { type: 'DELETE_PAGE'; payload: string }
    | { type: 'DELETE_SELECTED' }
    | { type: 'TOGGLE_SELECT'; payload: string }
    | { type: 'SELECT_ALL' }
    | { type: 'DESELECT_ALL' }
    | { type: 'UPDATE_THUMBNAIL'; payload: { id: string; thumbnailUrl: string } }
    | { type: 'SET_PROGRESS'; payload: OrganizeProgress }
    | { type: 'SET_THUMBNAILS_LOADING'; payload: boolean };

const initialProgress: OrganizeProgress = { status: 'idle', progress: 0, message: '' };

const initialState: OrganizeState = {
    file: null,
    pages: [],
    progress: initialProgress,
    thumbnailsLoading: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function organizeReducer(state: OrganizeState, action: OrganizeAction): OrganizeState {
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

        case 'REORDER_PAGES':
            return { ...state, pages: action.payload };

        case 'ROTATE_PAGE': {
            const delta = action.payload.direction === 'cw' ? 90 : -90;
            return {
                ...state,
                pages: state.pages.map((p) =>
                    p.id === action.payload.id
                        ? { ...p, rotation: ((p.rotation + delta) % 360 + 360) % 360 }
                        : p
                ),
            };
        }

        case 'ROTATE_SELECTED': {
            const delta = action.payload === 'cw' ? 90 : -90;
            return {
                ...state,
                pages: state.pages.map((p) =>
                    p.isSelected
                        ? { ...p, rotation: ((p.rotation + delta) % 360 + 360) % 360 }
                        : p
                ),
            };
        }

        case 'DELETE_PAGE':
            return { ...state, pages: state.pages.filter((p) => p.id !== action.payload) };

        case 'DELETE_SELECTED':
            return { ...state, pages: state.pages.filter((p) => !p.isSelected) };

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

        case 'UPDATE_THUMBNAIL':
            return {
                ...state,
                pages: state.pages.map((p) =>
                    p.id === action.payload.id ? { ...p, thumbnailUrl: action.payload.thumbnailUrl } : p
                ),
            };

        case 'SET_PROGRESS':
            return { ...state, progress: action.payload };

        case 'SET_THUMBNAILS_LOADING':
            return { ...state, thumbnailsLoading: action.payload };

        default:
            return state;
    }
}

// ---------------------------------------------------------------------------
// Context interface
// ---------------------------------------------------------------------------

interface OrganizeContextValue extends OrganizeState {
    addFile: (files: File[]) => Promise<void>;
    removeFile: () => void;
    reorderPages: (pages: OrganizedPage[]) => void;
    rotatePage: (id: string, direction: 'cw' | 'ccw') => void;
    rotateSelected: (direction: 'cw' | 'ccw') => void;
    deletePage: (id: string) => void;
    deleteSelected: () => void;
    toggleSelect: (id: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    downloadOrganized: () => Promise<void>;
    selectedCount: number;
}

const OrganizeContext = createContext<OrganizeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Thumbnail generation using pdfjs-dist (lazy loaded, batched)
// ---------------------------------------------------------------------------

async function generatePageThumbnails(
    buffer: ArrayBuffer,
    pageCount: number,
    onThumbnail: (pageIndex: number, url: string) => void,
): Promise<void> {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const task = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdf = await task.promise;

    // Generate thumbnails in batches of 4 for UI responsiveness
    const BATCH_SIZE = 4;
    for (let batchStart = 0; batchStart < pageCount; batchStart += BATCH_SIZE) {
        const batchEnd = Math.min(batchStart + BATCH_SIZE, pageCount);
        const promises = [];

        for (let i = batchStart; i < batchEnd; i++) {
            promises.push(
                (async () => {
                    try {
                        const page = await pdf.getPage(i + 1);
                        const baseViewport = page.getViewport({ scale: 1 });
                        const targetHeight = 200;
                        const scale = targetHeight / baseViewport.height;
                        const viewport = page.getViewport({ scale });

                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        await page.render({ canvasContext: ctx, viewport } as any).promise;
                        const url = canvas.toDataURL('image/jpeg', 0.7);
                        onThumbnail(i, url);
                    } catch {
                        // Skip failed thumbnails silently
                    }
                })()
            );
        }
        await Promise.all(promises);
    }

    pdf.destroy();
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function OrganizeProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(organizeReducer, initialState);
    const workerRef = useRef<Worker | null>(null);
    const pageIdsRef = useRef<Map<number, string>>(new Map());

    useEffect(() => {
        workerRef.current = new OrganizeWorker();
        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const addFile = useCallback(async (files: File[]) => {
        const pdf = files.find(isValidPDF);
        if (!pdf) return;

        const skeleton: OrganizeFileInfo = {
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

        try {
            const buffer = await readFileAsArrayBuffer(pdf);

            // Get page count via pdfjs
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc =
                `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            const doc = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise;
            const pageCount = doc.numPages;
            doc.destroy();

            // Initialize page objects
            const newPageIds = new Map<number, string>();
            const pages: OrganizedPage[] = Array.from({ length: pageCount }, (_, i) => {
                const id = generateId();
                newPageIds.set(i, id);
                return {
                    id,
                    pageIndex: i,
                    rotation: 0,
                    thumbnailUrl: null,
                    isSelected: false,
                };
            });

            pageIdsRef.current = newPageIds;
            dispatch({ type: 'SET_PAGES', payload: pages });
            dispatch({
                type: 'UPDATE_FILE',
                payload: { pageCount, isLoading: false, arrayBuffer: buffer },
            });

            // Generate thumbnails asynchronously
            dispatch({ type: 'SET_THUMBNAILS_LOADING', payload: true });
            await generatePageThumbnails(buffer, pageCount, (pageIndex, url) => {
                const id = newPageIds.get(pageIndex);
                if (id) {
                    dispatch({ type: 'UPDATE_THUMBNAIL', payload: { id, thumbnailUrl: url } });
                }
            });
            dispatch({ type: 'SET_THUMBNAILS_LOADING', payload: false });

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

    const reorderPages = useCallback((pages: OrganizedPage[]) => {
        dispatch({ type: 'REORDER_PAGES', payload: pages });
    }, []);

    const rotatePage = useCallback((id: string, direction: 'cw' | 'ccw') => {
        dispatch({ type: 'ROTATE_PAGE', payload: { id, direction } });
    }, []);

    const rotateSelected = useCallback((direction: 'cw' | 'ccw') => {
        dispatch({ type: 'ROTATE_SELECTED', payload: direction });
    }, []);

    const deletePage = useCallback((id: string) => {
        dispatch({ type: 'DELETE_PAGE', payload: id });
    }, []);

    const deleteSelected = useCallback(() => {
        dispatch({ type: 'DELETE_SELECTED' });
    }, []);

    const toggleSelect = useCallback((id: string) => {
        dispatch({ type: 'TOGGLE_SELECT', payload: id });
    }, []);

    const selectAll = useCallback(() => {
        dispatch({ type: 'SELECT_ALL' });
    }, []);

    const deselectAll = useCallback(() => {
        dispatch({ type: 'DESELECT_ALL' });
    }, []);

    const downloadOrganized = useCallback(async () => {
        const { file, pages } = state;

        if (!file || !file.arrayBuffer || pages.length === 0) {
            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'error', progress: 0, message: 'No PDF loaded or all pages deleted' },
            });
            return;
        }

        dispatch({
            type: 'SET_PROGRESS',
            payload: { status: 'loading', progress: 10, message: 'Preparing…' },
        });

        const msgId = generateId();
        const bufferCopy = file.arrayBuffer.slice(0);

        try {
            const result = await new Promise<{
                success: boolean;
                data?: ArrayBuffer;
                pageCount?: number;
                error?: string;
            }>((resolve, reject) => {
                if (!workerRef.current) {
                    reject(new Error('Worker not available'));
                    return;
                }

                const handler = (e: MessageEvent) => {
                    if (e.data.id === msgId) {
                        workerRef.current?.removeEventListener('message', handler);
                        resolve(e.data.result);
                    }
                };

                workerRef.current.addEventListener('message', handler);

                dispatch({
                    type: 'SET_PROGRESS',
                    payload: { status: 'processing', progress: 40, message: 'Organizing pages…' },
                });

                workerRef.current.postMessage(
                    {
                        type: 'organize',
                        id: msgId,
                        payload: {
                            buffer: bufferCopy,
                            pages: pages.map((p) => ({
                                id: p.id,
                                pageIndex: p.pageIndex,
                                rotation: p.rotation,
                            })),
                        },
                    },
                    [bufferCopy],
                );

                // Safety timeout — 90s for very large PDFs
                setTimeout(() => {
                    workerRef.current?.removeEventListener('message', handler);
                    reject(new Error('Processing timed out. Please try with a smaller file.'));
                }, 90_000);
            });

            if (!result.success) {
                throw new Error(result.error ?? 'Organize failed');
            }

            dispatch({
                type: 'SET_PROGRESS',
                payload: { status: 'processing', progress: 85, message: 'Preparing download…' },
            });

            if (result.data) {
                const baseName = file.name.replace(/\.pdf$/i, '');
                downloadBlob(result.data, `${baseName}_organized.pdf`);
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
                    message: err instanceof Error ? err.message : 'Organize failed',
                },
            });
        }
    }, [state]);

    const selectedCount = state.pages.filter((p) => p.isSelected).length;

    const value: OrganizeContextValue = {
        ...state,
        addFile,
        removeFile,
        reorderPages,
        rotatePage,
        rotateSelected,
        deletePage,
        deleteSelected,
        toggleSelect,
        selectAll,
        deselectAll,
        downloadOrganized,
        selectedCount,
    };

    return <OrganizeContext.Provider value={value}>{children}</OrganizeContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOrganize(): OrganizeContextValue {
    const ctx = useContext(OrganizeContext);
    if (!ctx) throw new Error('useOrganize must be used within an OrganizeProvider');
    return ctx;
}
