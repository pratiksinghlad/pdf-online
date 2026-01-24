import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react';
import type { PDFFileInfo, MergeProgress } from '../types';
import { generateId, readFileAsArrayBuffer, isValidPDF, downloadBlob, generateMergedFilename, formatFileSize } from '../utils';

// State interface
interface PDFState {
    files: PDFFileInfo[];
    mergeProgress: MergeProgress;
    isLoading: boolean;
    error: string | null;
}

// Action types
type PDFAction =
    | { type: 'ADD_FILES'; payload: PDFFileInfo[] }
    | { type: 'REMOVE_FILE'; payload: string }
    | { type: 'UPDATE_FILE'; payload: { id: string; updates: Partial<PDFFileInfo> } }
    | { type: 'REORDER_FILES'; payload: PDFFileInfo[] }
    | { type: 'MOVE_FILE'; payload: { fromIndex: number; toIndex: number } }
    | { type: 'CLEAR_FILES' }
    | { type: 'SET_MERGE_PROGRESS'; payload: MergeProgress }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: PDFState = {
    files: [],
    mergeProgress: { status: 'idle', progress: 0, message: '' },
    isLoading: false,
    error: null,
};

// Reducer
function pdfReducer(state: PDFState, action: PDFAction): PDFState {
    switch (action.type) {
        case 'ADD_FILES':
            return { ...state, files: [...state.files, ...action.payload], error: null };
        case 'REMOVE_FILE':
            return {
                ...state,
                files: state.files.filter((f) => f.id !== action.payload),
            };
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
            return { ...state, files: [], mergeProgress: initialState.mergeProgress };
        case 'SET_MERGE_PROGRESS':
            return { ...state, mergeProgress: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
}

// Context interface
interface PDFContextValue extends PDFState {
    addFiles: (files: File[]) => Promise<void>;
    removeFile: (id: string) => void;
    reorderFiles: (files: PDFFileInfo[]) => void;
    moveFile: (fromIndex: number, toIndex: number) => void;
    moveFileToTop: (id: string) => void;
    moveFileToBottom: (id: string) => void;
    clearFiles: () => void;
    mergePDFs: () => Promise<void>;
    cancelMerge: () => void;
}

const PDFContext = createContext<PDFContextValue | null>(null);

// Provider component
export function PDFProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(pdfReducer, initialState);
    const workerRef = useRef<Worker | null>(null);
    const mergeAbortRef = useRef(false);

    // Initialize worker
    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../workers/pdfWorker.ts', import.meta.url),
            { type: 'module' }
        );

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    // Generate thumbnail using pdfjs-dist (lazy loaded)
    const generateThumbnail = useCallback(async (buffer: ArrayBuffer): Promise<string | null> => {
        try {
            // Lazy load pdfjs-dist
            const pdfjsLib = await import('pdfjs-dist');

            // Set worker source
            pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                'pdfjs-dist/build/pdf.worker.min.mjs',
                import.meta.url
            ).toString();

            const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            // Low-res thumbnail for list view (96px height)
            const originalViewport = page.getViewport({ scale: 1 });
            const scale = 96 / originalViewport.height;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return null;

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport,
            }).promise;

            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);

            // Cleanup
            pdf.destroy();

            return thumbnailUrl;
        } catch (error) {
            console.error('Failed to generate thumbnail:', error);
            return null;
        }
    }, []);

    // Get page count using worker
    const getPageCount = useCallback(async (buffer: ArrayBuffer): Promise<number> => {
        return new Promise((resolve) => {
            if (!workerRef.current) {
                resolve(0);
                return;
            }

            const id = generateId();
            const handler = (event: MessageEvent) => {
                if (event.data.id === id) {
                    workerRef.current?.removeEventListener('message', handler);
                    resolve(event.data.result.success ? event.data.result.pageCount : 0);
                }
            };

            workerRef.current.addEventListener('message', handler);
            workerRef.current.postMessage(
                { type: 'getPageCount', payload: { buffer: buffer.slice(0) }, id },
                { transfer: [] }
            );
        });
    }, []);

    // Add files
    const addFiles = useCallback(async (files: File[]) => {
        const validFiles = files.filter(isValidPDF);

        if (validFiles.length === 0) {
            dispatch({ type: 'SET_ERROR', payload: 'Please select valid PDF files' });
            return;
        }

        // Create initial file entries with loading state
        const newFiles: PDFFileInfo[] = validFiles.map((file) => ({
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            pageCount: 0,
            thumbnailUrl: null,
            isLoading: true,
            error: null,
            arrayBuffer: null,
        }));

        dispatch({ type: 'ADD_FILES', payload: newFiles });

        // Process each file
        for (const fileInfo of newFiles) {
            try {
                // Check file size (warn for files > 50MB)
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

                const buffer = await readFileAsArrayBuffer(fileInfo.file);
                const [pageCount, thumbnailUrl] = await Promise.all([
                    getPageCount(buffer),
                    generateThumbnail(buffer),
                ]);

                dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                        id: fileInfo.id,
                        updates: {
                            pageCount,
                            thumbnailUrl,
                            isLoading: false,
                            arrayBuffer: buffer,
                            error: pageCount === 0 ? 'Failed to read PDF' : null,
                        },
                    },
                });
            } catch (error) {
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                        id: fileInfo.id,
                        updates: {
                            isLoading: false,
                            error: error instanceof Error ? error.message : 'Failed to process file',
                        },
                    },
                });
            }
        }
    }, [generateThumbnail, getPageCount]);

    // Remove file
    const removeFile = useCallback((id: string) => {
        const file = state.files.find((f) => f.id === id);
        if (file?.thumbnailUrl) {
            URL.revokeObjectURL(file.thumbnailUrl);
        }
        dispatch({ type: 'REMOVE_FILE', payload: id });
    }, [state.files]);

    // Reorder files
    const reorderFiles = useCallback((files: PDFFileInfo[]) => {
        dispatch({ type: 'REORDER_FILES', payload: files });
    }, []);

    // Move file by index
    const moveFile = useCallback((fromIndex: number, toIndex: number) => {
        dispatch({ type: 'MOVE_FILE', payload: { fromIndex, toIndex } });
    }, []);

    // Move file to top
    const moveFileToTop = useCallback((id: string) => {
        const index = state.files.findIndex((f) => f.id === id);
        if (index > 0) {
            dispatch({ type: 'MOVE_FILE', payload: { fromIndex: index, toIndex: 0 } });
        }
    }, [state.files]);

    // Move file to bottom
    const moveFileToBottom = useCallback((id: string) => {
        const index = state.files.findIndex((f) => f.id === id);
        if (index >= 0 && index < state.files.length - 1) {
            dispatch({ type: 'MOVE_FILE', payload: { fromIndex: index, toIndex: state.files.length - 1 } });
        }
    }, [state.files]);

    // Clear all files
    const clearFiles = useCallback(() => {
        state.files.forEach((file) => {
            if (file.thumbnailUrl) {
                URL.revokeObjectURL(file.thumbnailUrl);
            }
        });
        dispatch({ type: 'CLEAR_FILES' });
    }, [state.files]);

    // Merge PDFs
    const mergePDFs = useCallback(async () => {
        if (state.files.length === 0) {
            dispatch({ type: 'SET_ERROR', payload: 'No files to merge' });
            return;
        }

        if (!workerRef.current) {
            dispatch({ type: 'SET_ERROR', payload: 'Worker not available' });
            return;
        }

        mergeAbortRef.current = false;
        dispatch({
            type: 'SET_MERGE_PROGRESS',
            payload: { status: 'loading', progress: 10, message: 'Preparing files...' },
        });

        // Prepare files for worker
        const filesToMerge = await Promise.all(
            state.files.map(async (file) => {
                const buffer = file.arrayBuffer || (await readFileAsArrayBuffer(file.file));
                return {
                    id: file.id,
                    buffer: buffer.slice(0), // Clone buffer
                    name: file.name,
                };
            })
        );

        if (mergeAbortRef.current) {
            dispatch({ type: 'SET_MERGE_PROGRESS', payload: initialState.mergeProgress });
            return;
        }

        dispatch({
            type: 'SET_MERGE_PROGRESS',
            payload: { status: 'merging', progress: 30, message: 'Merging PDFs...' },
        });

        return new Promise<void>((resolve) => {
            const id = generateId();
            const handler = (event: MessageEvent) => {
                if (event.data.id === id) {
                    workerRef.current?.removeEventListener('message', handler);

                    if (mergeAbortRef.current) {
                        dispatch({ type: 'SET_MERGE_PROGRESS', payload: initialState.mergeProgress });
                        resolve();
                        return;
                    }

                    const { result } = event.data;
                    if (result.success && result.data) {
                        dispatch({
                            type: 'SET_MERGE_PROGRESS',
                            payload: { status: 'complete', progress: 100, message: 'Download starting...' },
                        });

                        // Trigger download
                        const filename = generateMergedFilename();
                        downloadBlob(result.data, filename);

                        // Reset after download
                        setTimeout(() => {
                            dispatch({ type: 'SET_MERGE_PROGRESS', payload: initialState.mergeProgress });
                        }, 2000);
                    } else {
                        dispatch({
                            type: 'SET_MERGE_PROGRESS',
                            payload: {
                                status: 'error',
                                progress: 0,
                                message: result.error || 'Failed to merge PDFs',
                            },
                        });
                    }
                    resolve();
                }
            };

            workerRef.current!.addEventListener('message', handler);

            // Transfer buffers to worker
            const transferables = filesToMerge.map((f) => f.buffer);
            workerRef.current!.postMessage(
                { type: 'merge', payload: { files: filesToMerge }, id },
                { transfer: transferables }
            );
        });
    }, [state.files]);

    // Cancel merge
    const cancelMerge = useCallback(() => {
        mergeAbortRef.current = true;
        dispatch({ type: 'SET_MERGE_PROGRESS', payload: initialState.mergeProgress });
    }, []);

    const value: PDFContextValue = {
        ...state,
        addFiles,
        removeFile,
        reorderFiles,
        moveFile,
        moveFileToTop,
        moveFileToBottom,
        clearFiles,
        mergePDFs,
        cancelMerge,
    };

    return <PDFContext.Provider value={value}>{children}</PDFContext.Provider>;
}

// Custom hook
export function usePDF() {
    const context = useContext(PDFContext);
    if (!context) {
        throw new Error('usePDF must be used within a PDFProvider');
    }
    return context;
}
