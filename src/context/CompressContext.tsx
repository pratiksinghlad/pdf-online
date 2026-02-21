/* eslint-disable @typescript-eslint/no-explicit-any, react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from "react";
import type {
  CompressedFileInfo,
  CompressionProgress,
  CompressionOptions,
  CompressionLevel,
} from "../types/compress";
import {
  generateId,
  readFileAsArrayBuffer,
  isValidPDF,
  downloadBlob,
  formatFileSize,
} from "../utils";
import {
  getCompressionService,
  type CompressionService,
} from "../services/compressionService";
import PDFWorker from "../workers/pdfWorker?worker";

// State interface
interface CompressState {
  files: CompressedFileInfo[];
  compressionProgress: CompressionProgress;
  compressionOptions: CompressionOptions;
  isLoading: boolean;
  error: string | null;
  engine: "ghostscript" | "canvas-fallback" | "unknown";
}

// Action types
type CompressAction =
  | { type: "ADD_FILES"; payload: CompressedFileInfo[] }
  | { type: "REMOVE_FILE"; payload: string }
  | {
      type: "UPDATE_FILE";
      payload: { id: string; updates: Partial<CompressedFileInfo> };
    }
  | { type: "CLEAR_FILES" }
  | { type: "RESET_COMPRESSED_FILES" }
  | { type: "SET_COMPRESSION_PROGRESS"; payload: CompressionProgress }
  | { type: "SET_COMPRESSION_OPTIONS"; payload: CompressionOptions }
  | { type: "SET_COMPRESSION_LEVEL"; payload: CompressionLevel }
  | { type: "SET_CUSTOM_DPI"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "SET_ENGINE";
      payload: "ghostscript" | "canvas-fallback" | "unknown";
    };

// Initial state
const initialState: CompressState = {
  files: [],
  compressionProgress: {
    status: "idle",
    progress: 0,
    message: "",
    currentFileIndex: 0,
    totalFiles: 0,
  },
  compressionOptions: {
    level: "best",
    customDpi: 150,
    removeMetadata: true,
    flattenAnnotations: false,
  },
  isLoading: false,
  error: null,
  engine: "unknown",
};

// Reducer
function compressReducer(
  state: CompressState,
  action: CompressAction,
): CompressState {
  switch (action.type) {
    case "ADD_FILES":
      return {
        ...state,
        files: [...state.files, ...action.payload],
        error: null,
      };
    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.payload),
      };
    case "UPDATE_FILE":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.id ? { ...f, ...action.payload.updates } : f,
        ),
      };
    case "CLEAR_FILES":
      return {
        ...state,
        files: [],
        compressionProgress: initialState.compressionProgress,
      };
    case "RESET_COMPRESSED_FILES":
      return {
        ...state,
        files: state.files.map((f) => ({
          ...f,
          isCompressed: false,
          compressedBuffer: null,
          compressedSize: null,
          compressionRatio: null,
          error: null,
        })),
        compressionProgress: initialState.compressionProgress,
      };
    case "SET_COMPRESSION_PROGRESS":
      return { ...state, compressionProgress: action.payload };
    case "SET_COMPRESSION_OPTIONS":
      return { ...state, compressionOptions: action.payload };
    case "SET_COMPRESSION_LEVEL":
      return {
        ...state,
        compressionOptions: {
          ...state.compressionOptions,
          level: action.payload,
        },
      };
    case "SET_CUSTOM_DPI":
      return {
        ...state,
        compressionOptions: {
          ...state.compressionOptions,
          customDpi: action.payload,
        },
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_ENGINE":
      return { ...state, engine: action.payload };
    default:
      return state;
  }
}

// Context interface
interface CompressContextValue extends CompressState {
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  setCompressionLevel: (level: CompressionLevel) => void;
  setCustomDpi: (dpi: number) => void;
  compressPDFs: (forceAll?: boolean) => Promise<void>;
  downloadCompressed: (id: string) => void;
  downloadAllCompressed: () => void;
  cancelCompression: () => void;
}

const CompressContext = createContext<CompressContextValue | null>(null);

// Provider component
export function CompressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(compressReducer, initialState);
  const workerRef = useRef<Worker | null>(null);
  const compressionServiceRef = useRef<CompressionService | null>(null);
  const compressAbortRef = useRef(false);

  // Initialize workers
  useEffect(() => {
    // 1. Legacy PDF worker (for page count)
    try {
      console.log("Initializing PDF Worker for page counts...");
      workerRef.current = new PDFWorker();
      workerRef.current.onerror = (e) => {
        console.error("Legacy worker error:", e);
      };
    } catch (error) {
      console.error("Failed to initialize PDF worker:", error);
    }

    // 2. Compression service (Web Worker-based)
    const service = getCompressionService();
    compressionServiceRef.current = service;

    service
      .initialize()
      .then(({ engine }) => {
        console.log(`Compression service ready with engine: ${engine}`);
        dispatch({ type: "SET_ENGINE", payload: engine });
      })
      .catch((err) => {
        console.error("Failed to initialize compression service:", err);
        dispatch({ type: "SET_ENGINE", payload: "canvas-fallback" });
      });

    return () => {
      workerRef.current?.terminate();
      service.cancel(); // Don't destroy singleton, just cancel pending
    };
  }, []);

  // Generate thumbnail using pdfjs-dist
  const generateThumbnail = useCallback(
    async (buffer: ArrayBuffer): Promise<string | null> => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const originalViewport = page.getViewport({ scale: 1 });
        const scale = 96 / originalViewport.height;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return null;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        } as any).promise;

        const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
        pdf.destroy();

        return thumbnailUrl;
      } catch (error) {
        console.error("Failed to generate thumbnail:", error);
        return null;
      }
    },
    [],
  );

  // Get page count using legacy worker
  const getPageCount = useCallback(
    async (buffer: ArrayBuffer): Promise<number> => {
      return new Promise((resolve) => {
        if (!workerRef.current) {
          console.warn("Worker not available for getPageCount");
          resolve(0);
          return;
        }

        const id = generateId();
        const bufferToTransfer = buffer.slice(0);

        const handler = (event: MessageEvent) => {
          if (event.data.id === id) {
            workerRef.current?.removeEventListener("message", handler);
            resolve(
              event.data.result.success ? event.data.result.pageCount : 0,
            );
          }
        };

        workerRef.current.addEventListener("message", handler);
        workerRef.current.postMessage(
          { type: "getPageCount", payload: { buffer: bufferToTransfer }, id },
          [bufferToTransfer],
        );

        setTimeout(() => {
          workerRef.current?.removeEventListener("message", handler);
          resolve(0);
        }, 10000);
      });
    },
    [],
  );

  // Add files
  const addFiles = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter(isValidPDF);

      if (validFiles.length === 0) {
        dispatch({
          type: "SET_ERROR",
          payload: "Please select valid PDF files",
        });
        return;
      }

      const newFiles: CompressedFileInfo[] = validFiles.map((file) => ({
        id: generateId(),
        file,
        name: file.name,
        originalSize: file.size,
        compressedSize: null,
        pageCount: 0,
        thumbnailUrl: null,
        isLoading: true,
        isCompressing: false,
        isCompressed: false,
        error: null,
        arrayBuffer: null,
        compressedBuffer: null,
        compressionRatio: null,
      }));

      dispatch({ type: "ADD_FILES", payload: newFiles });

      for (const fileInfo of newFiles) {
        try {
          if (fileInfo.originalSize > 50 * 1024 * 1024) {
            dispatch({
              type: "UPDATE_FILE",
              payload: {
                id: fileInfo.id,
                updates: {
                  error: `Large file (${formatFileSize(fileInfo.originalSize)}). Processing may be slow.`,
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
            type: "UPDATE_FILE",
            payload: {
              id: fileInfo.id,
              updates: {
                pageCount,
                thumbnailUrl,
                isLoading: false,
                arrayBuffer: buffer,
                error: pageCount === 0 ? "Failed to read PDF" : null,
              },
            },
          });
        } catch (error) {
          console.error("Error processing file:", error);
          dispatch({
            type: "UPDATE_FILE",
            payload: {
              id: fileInfo.id,
              updates: {
                isLoading: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to process file",
              },
            },
          });
        }
      }
    },
    [generateThumbnail, getPageCount],
  );

  // Remove file
  const removeFile = useCallback(
    (id: string) => {
      const file = state.files.find((f) => f.id === id);
      if (file?.thumbnailUrl) {
        URL.revokeObjectURL(file.thumbnailUrl);
      }
      dispatch({ type: "REMOVE_FILE", payload: id });
    },
    [state.files],
  );

  // Clear all files
  const clearFiles = useCallback(() => {
    state.files.forEach((file) => {
      if (file.thumbnailUrl) {
        URL.revokeObjectURL(file.thumbnailUrl);
      }
    });
    dispatch({ type: "CLEAR_FILES" });
  }, [state.files]);

  // Set compression level
  const setCompressionLevel = useCallback((level: CompressionLevel) => {
    dispatch({ type: "SET_COMPRESSION_LEVEL", payload: level });
  }, []);

  // Set custom DPI
  const setCustomDpi = useCallback((dpi: number) => {
    dispatch({ type: "SET_CUSTOM_DPI", payload: dpi });
  }, []);

  // ─── Compress PDFs via CompressionService (Web Worker) ──────────────────
  const compressPDFs = useCallback(
    async (forceAll = false) => {
      const shouldForce = forceAll === true;

      if (state.files.length === 0) {
        dispatch({ type: "SET_ERROR", payload: "No files to compress" });
        return;
      }

      const service = compressionServiceRef.current;
      if (!service) {
        dispatch({
          type: "SET_ERROR",
          payload: "Compression service not available. Please refresh.",
        });
        return;
      }

      compressAbortRef.current = false;

      dispatch({
        type: "SET_COMPRESSION_PROGRESS",
        payload: {
          status: "loading",
          progress: 5,
          message: "Preparing files...",
          currentFileIndex: 0,
          totalFiles: state.files.length,
        },
      });

      const totalFiles = state.files.length;

      for (let i = 0; i < state.files.length; i++) {
        if (compressAbortRef.current) {
          dispatch({
            type: "SET_COMPRESSION_PROGRESS",
            payload: initialState.compressionProgress,
          });
          return;
        }

        const file = state.files[i];

        if (file.isCompressed && !shouldForce) continue;

        dispatch({
          type: "UPDATE_FILE",
          payload: {
            id: file.id,
            updates: { isCompressing: true, error: null },
          },
        });

        dispatch({
          type: "SET_COMPRESSION_PROGRESS",
          payload: {
            status: "compressing",
            progress: Math.round(((i + 0.5) / totalFiles) * 100),
            message: `Compressing ${file.name}...`,
            currentFileIndex: i + 1,
            totalFiles,
          },
        });

        try {
          const buffer =
            file.arrayBuffer || (await readFileAsArrayBuffer(file.file));

          // Use the CompressionService (runs in Web Worker)
          const result = await service.compressFile(
            buffer,
            state.compressionOptions.level,
            state.compressionOptions.removeMetadata,
            (progress, message) => {
              dispatch({
                type: "SET_COMPRESSION_PROGRESS",
                payload: {
                  status: "compressing",
                  progress: Math.round(
                    (i / totalFiles) * 100 + progress / totalFiles,
                  ),
                  message,
                  currentFileIndex: i + 1,
                  totalFiles,
                },
              });
            },
            state.compressionOptions.customDpi,
          );

          if (result.success) {
            const compressedSize = result.compressedSize;
            const compressionRatio =
              ((file.originalSize - compressedSize) / file.originalSize) * 100;

            dispatch({
              type: "UPDATE_FILE",
              payload: {
                id: file.id,
                updates: {
                  isCompressing: false,
                  isCompressed: true,
                  compressedBuffer: result.data,
                  compressedSize,
                  compressionRatio,
                },
              },
            });

            // Update engine info
            dispatch({ type: "SET_ENGINE", payload: result.engine });
          } else {
            dispatch({
              type: "UPDATE_FILE",
              payload: {
                id: file.id,
                updates: {
                  isCompressing: false,
                  error: result.error,
                },
              },
            });
          }
        } catch (error) {
          console.error("Error compressing file:", error);
          dispatch({
            type: "UPDATE_FILE",
            payload: {
              id: file.id,
              updates: {
                isCompressing: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to compress file",
              },
            },
          });
        }
      }

      dispatch({
        type: "SET_COMPRESSION_PROGRESS",
        payload: {
          status: "complete",
          progress: 100,
          message: "Compression complete!",
          currentFileIndex: totalFiles,
          totalFiles,
        },
      });
    },
    [state.files, state.compressionOptions],
  );

  // Download single compressed file
  const downloadCompressed = useCallback(
    (id: string) => {
      const file = state.files.find((f) => f.id === id);
      if (file?.compressedBuffer) {
        const filename = file.name.replace(".pdf", "_compressed.pdf");
        downloadBlob(file.compressedBuffer, filename);

        // Clear all files after download with a small delay
        setTimeout(() => {
          clearFiles();
        }, 500);
      }
    },
    [state.files, clearFiles],
  );

  // Download all compressed files
  const downloadAllCompressed = useCallback(async () => {
    const compressedFiles = state.files.filter(
      (f) => f.isCompressed && f.compressedBuffer,
    );

    if (compressedFiles.length === 0) return;

    if (compressedFiles.length === 1) {
      const file = compressedFiles[0];
      const filename = file.name.replace(".pdf", "_compressed.pdf");
      downloadBlob(file.compressedBuffer!, filename);
    } else {
      // For multiple files, download individually with delay
      for (const file of compressedFiles) {
        if (file.compressedBuffer) {
          const filename = file.name.replace(".pdf", "_compressed.pdf");
          downloadBlob(file.compressedBuffer, filename);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    // Clear all files after download
    setTimeout(() => {
      clearFiles();
    }, 1000);
  }, [state.files, clearFiles]);

  // Cancel compression
  const cancelCompression = useCallback(() => {
    compressAbortRef.current = true;
    compressionServiceRef.current?.cancel();
    dispatch({
      type: "SET_COMPRESSION_PROGRESS",
      payload: initialState.compressionProgress,
    });
  }, []);

  // Auto-recompress when level changes
  const lastLevelRef = useRef<CompressionLevel>(state.compressionOptions.level);
  useEffect(() => {
    if (state.compressionOptions.level !== lastLevelRef.current) {
      lastLevelRef.current = state.compressionOptions.level;

      if (
        state.files.length > 0 &&
        !state.isLoading &&
        !state.files.some((f) => f.isLoading)
      ) {
        compressPDFs(true);
      }
    }
  }, [
    state.compressionOptions.level,
    state.files,
    state.isLoading,
    compressPDFs,
  ]);

  const value: CompressContextValue = {
    ...state,
    addFiles,
    removeFile,
    clearFiles,
    setCompressionLevel,
    setCustomDpi,
    compressPDFs,
    downloadCompressed,
    downloadAllCompressed,
    cancelCompression,
  };

  return (
    <CompressContext.Provider value={value}>
      {children}
    </CompressContext.Provider>
  );
}

// Custom hook
export function useCompress() {
  const context = useContext(CompressContext);
  if (!context) {
    throw new Error("useCompress must be used within a CompressProvider");
  }
  return context;
}
