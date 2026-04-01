import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect } from "react";
import type { EncryptFileInfo } from "../types";
import { generateId, readFileAsArrayBuffer, getFileCategory } from "../utils";
import EncryptWorker from "../workers/encrypt.worker?worker";

interface EncryptState {
  files: EncryptFileInfo[];
  isProcessing: boolean;
  globalPassword?: string;
}

type EncryptAction =
  | { type: "ADD_FILES"; payload: EncryptFileInfo[] }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "UPDATE_FILE"; payload: { id: string; updates: Partial<EncryptFileInfo> } }
  | { type: "CLEAR_FILES" }
  | { type: "SET_GLOBAL_PASSWORD"; payload: string }
  | { type: "SET_PROCESSING"; payload: boolean };

const initialState: EncryptState = {
  files: [],
  isProcessing: false,
};

function encryptReducer(state: EncryptState, action: EncryptAction): EncryptState {
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

interface EncryptContextValue extends EncryptState {
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  updateFile: (id: string, updates: Partial<EncryptFileInfo>) => void;
  clearFiles: () => void;
  setGlobalPassword: (password: string) => void;
  processFiles: () => Promise<void>;
  downloadProcessedFile: (id: string) => void;
  downloadAllProcessed: () => void;
}

const EncryptContext = createContext<EncryptContextValue | null>(null);

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

export function EncryptProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(encryptReducer, initialState);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    try {
      workerRef.current = new EncryptWorker();
      workerRef.current.onerror = (e) => {
        console.error("EncryptWorker error:", e);
      };
    } catch (error) {
      console.error("Failed to initialize Encrypt worker:", error);
    }
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const addFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter((f) => getFileCategory(f) === "pdf" || f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (validFiles.length === 0) return;

    const newFiles: EncryptFileInfo[] = validFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      status: "idle",
    }));
    dispatch({ type: "ADD_FILES", payload: newFiles });
  }, []);

  const removeFile = useCallback((id: string) => {
    dispatch({ type: "REMOVE_FILE", payload: id });
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<EncryptFileInfo>) => {
    dispatch({ type: "UPDATE_FILE", payload: { id, updates } });
  }, []);

  const clearFiles = useCallback(() => {
    dispatch({ type: "CLEAR_FILES" });
  }, []);

  const setGlobalPassword = useCallback((password: string) => {
    dispatch({ type: "SET_GLOBAL_PASSWORD", payload: password });
  }, []);

  const processFiles = useCallback(async () => {
    if (!workerRef.current || state.files.length === 0) return;
    dispatch({ type: "SET_PROCESSING", payload: true });

    const filesToProcess = state.files.filter((f) => f.status !== "success");
    
    for (const fileInfo of filesToProcess) {
       const pass = fileInfo.password || state.globalPassword;
       if (!pass) {
         dispatch({
           type: "UPDATE_FILE",
           payload: { id: fileInfo.id, updates: { status: "error", error: "No password provided" } },
         });
         continue;
       }
       
       dispatch({ type: "UPDATE_FILE", payload: { id: fileInfo.id, updates: { status: "processing", error: undefined } } });
       
       try {
         const buffer = await readFileAsArrayBuffer(fileInfo.file);
         
         const processedBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
           if (!workerRef.current) return reject("Worker missing");
           
           const handler = (e: MessageEvent) => {
             if (e.data.id === fileInfo.id) {
               workerRef.current?.removeEventListener("message", handler);
               if (e.data.result.success && e.data.result.data) {
                 resolve(e.data.result.data);
               } else {
                 reject(e.data.result.error || "Encryption failed");
               }
             }
           };
           workerRef.current.addEventListener("message", handler);
           
           workerRef.current.postMessage(
             { type: "encrypt", payload: { buffer: buffer.slice(0), password: pass }, id: fileInfo.id },
             [buffer.slice(0)]
           );
         });
         
         dispatch({
           type: "UPDATE_FILE",
           payload: { id: fileInfo.id, updates: { status: "success", processedBuffer } },
         });
         
       } 
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       catch (err: any) {
         dispatch({
           type: "UPDATE_FILE",
           payload: { id: fileInfo.id, updates: { status: "error", error: err.toString() } },
         });
       }
    }
    
    dispatch({ type: "SET_PROCESSING", payload: false });
  }, [state.files, state.globalPassword]);

  const downloadProcessedFile = useCallback((id: string) => {
    const file = state.files.find(f => f.id === id);
    if (file && file.status === "success" && file.processedBuffer) {
      downloadBlobDirectly(file.processedBuffer, getFormattedFileName(file.name));
    }
  }, [state.files]);

  const downloadAllProcessed = useCallback(() => {
    state.files.forEach(file => {
      if (file.status === "success" && file.processedBuffer) {
        downloadBlobDirectly(file.processedBuffer, getFormattedFileName(file.name));
      }
    });
  }, [state.files]);

  return (
    <EncryptContext.Provider value={{
      ...state, addFiles, removeFile, updateFile, clearFiles, setGlobalPassword, processFiles, downloadProcessedFile, downloadAllProcessed
    }}>
      {children}
    </EncryptContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export function useEncrypt() {
  const ctx = useContext(EncryptContext);
  if (!ctx) throw new Error("useEncrypt must be used within EncryptProvider");
  return ctx;
}
