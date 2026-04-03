import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { UnlockFileInfo } from "../types";
import { generateId, readFileAsArrayBuffer, getFileCategory } from "../utils";
import QPDFWorker from "../workers/qpdf.worker?worker";
import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs for encryption check
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/**
 * Check whether a PDF buffer is password-protected using pdfjs-dist.
 */
async function checkIfEncrypted(buffer: ArrayBuffer): Promise<boolean> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer.slice(0)),
    });
    const pdf = await loadingTask.promise;
    pdf.destroy();
    return false;
  } catch (err: any) {
    if (err.name === "PasswordException") {
      return true;
    }
    return false;
  }
}

interface UnlockState {
  files: UnlockFileInfo[];
  isProcessing: boolean;
  globalPassword?: string;
}

type UnlockAction =
  | { type: "ADD_FILES"; payload: UnlockFileInfo[] }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "UPDATE_FILE"; payload: { id: string; updates: Partial<UnlockFileInfo> } }
  | { type: "CLEAR_FILES" }
  | { type: "SET_GLOBAL_PASSWORD"; payload: string }
  | { type: "SET_PROCESSING"; payload: boolean };

const initialState: UnlockState = {
  files: [],
  isProcessing: false,
};

function unlockReducer(state: UnlockState, action: UnlockAction): UnlockState {
  switch (action.type) {
    case "ADD_FILES":
      return { ...state, files: [...state.files, ...action.payload] };
    case "REMOVE_FILE":
      return { ...state, files: state.files.filter((f) => f.id !== action.payload) };
    case "UPDATE_FILE":
      return {
        ...state,
        files: state.files.map((f) => (f.id === action.payload.id ? { ...f, ...action.payload.updates } : f)),
      };
    case "CLEAR_FILES":
      return { ...state, files: [] };
    case "SET_GLOBAL_PASSWORD":
      return { ...state, globalPassword: action.payload };
    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };
    default:
      return state;
  }
}

interface UnlockContextValue extends UnlockState {
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<UnlockFileInfo>) => void;
  clearFiles: () => void;
  setGlobalPassword: (password: string) => void;
  processFiles: () => Promise<void>;
  downloadProcessedFile: (id: string) => void;
  downloadAllProcessed: () => void;
}

const UnlockContext = createContext<UnlockContextValue | null>(null);

function downloadBlobDirectly(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function getFormattedFileName(originalName: string): string {
  const baseName = originalName.replace(/\.pdf$/i, "");
  const d = new Date();
  
  const pad = (n: number) => n.toString().padStart(2, "0");
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  return `${baseName}_${dd}${mm}${yyyy}${hh}${min}${ss}.pdf`;
}

export function UnlockProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(unlockReducer, initialState);
  const workerRef = React.useRef<Worker | null>(null);

  React.useEffect(() => {
    workerRef.current = new QPDFWorker();
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const addFiles = useCallback(async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(
      (f) => getFileCategory(f) === "pdf" || f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (validFiles.length === 0) return;

    const newFileInfos: UnlockFileInfo[] = [];

    for (const file of validFiles) {
      const id = generateId();
      const buffer = await readFileAsArrayBuffer(file);
      const isEncrypted = await checkIfEncrypted(buffer);

      newFileInfos.push({
        id,
        file,
        name: file.name,
        size: file.size,
        status: isEncrypted ? "idle" : "not-protected",
      });
    }

    dispatch({ type: "ADD_FILES", payload: newFileInfos });
  }, []);

  const removeFile = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FILE", payload: id });
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<UnlockFileInfo>) => {
    dispatch({ type: "UPDATE_FILE", payload: { id, updates } });
  }, []);

  const clearFiles = useCallback(() => {
    dispatch({ type: "CLEAR_FILES" });
  }, []);

  const setGlobalPassword = useCallback((password: string) => {
    dispatch({ type: "SET_GLOBAL_PASSWORD", payload: password });
  }, []);

  const processFiles = useCallback(async () => {
    if (state.files.length === 0) return;
    dispatch({ type: "SET_PROCESSING", payload: true });

    const filesToProcess = state.files.filter(
      (f) => f.status !== "success" && f.status !== "not-protected"
    );

    for (const fileInfo of filesToProcess) {
      const pass = fileInfo.password || state.globalPassword || "";

      dispatch({
        type: "UPDATE_FILE",
        payload: { id: fileInfo.id, updates: { status: "processing", error: undefined } },
      });

      try {
        const buffer = await readFileAsArrayBuffer(fileInfo.file);
        
        // Structural unlock via QPDF Worker
        const result = await new Promise<any>((resolve, reject) => {
          if (!workerRef.current) return reject("Worker not initialized");
          
          const handler = (e: MessageEvent) => {
            if (e.data.id === fileInfo.id) {
              workerRef.current?.removeEventListener("message", handler);
              resolve(e.data.result);
            }
          };
          
          workerRef.current.addEventListener("message", handler);
          workerRef.current.postMessage({
            id: fileInfo.id,
            type: "unlock",
            payload: { buffer, password: pass }
          }, [buffer]);
        });

        if (result.success) {
          dispatch({
            type: "UPDATE_FILE",
            payload: {
              id: fileInfo.id,
              updates: { status: "success", processedBuffer: result.data },
            },
          });
        } else {
          throw new Error(result.error);
        }
      } catch (err: unknown) {
        const error = err as { message?: string };
        dispatch({
          type: "UPDATE_FILE",
          payload: {
            id: fileInfo.id,
            updates: { status: "error", error: error.message || "Unlock failed" },
          },
        });
      }
    }

    dispatch({ type: "SET_PROCESSING", payload: false });
  }, [state.files, state.globalPassword]);

  const downloadProcessedFile = useCallback(
    (id: string) => {
      const file = state.files.find((f) => f.id === id);
      if (file && file.status === "success" && file.processedBuffer) {
        downloadBlobDirectly(file.processedBuffer, getFormattedFileName(file.name));
      }
    },
    [state.files]
  );

  const downloadAllProcessed = useCallback(() => {
    state.files.forEach((file) => {
      if (file.status === "success" && file.processedBuffer) {
        downloadBlobDirectly(file.processedBuffer, getFormattedFileName(file.name));
      }
    });
  }, [state.files]);

  return (
    <UnlockContext.Provider
      value={{
        ...state,
        addFiles,
        removeFile,
        updateFile,
        clearFiles,
        setGlobalPassword,
        processFiles,
        downloadProcessedFile,
        downloadAllProcessed,
      }}
    >
      {children}
    </UnlockContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUnlock() {
  const ctx = useContext(UnlockContext);
  if (!ctx) throw new Error("useUnlock must be used within UnlockProvider");
  return ctx;
}
