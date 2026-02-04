/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ImageFileInfo, ConvertProgress, ImageToPDFOptions } from '../types/image';
import { generateId, formatFileSize, downloadBlob } from '../utils';
import { jsPDF } from 'jspdf';

// Supported image types
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

// State interface
interface ImageToPDFState {
    files: ImageFileInfo[];
    convertProgress: ConvertProgress;
    options: ImageToPDFOptions;
    isLoading: boolean;
    error: string | null;
}

// Action types
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

// Default options
const defaultOptions: ImageToPDFOptions = {
    pageSize: 'A4',
    orientation: 'auto',
    margin: 10,
    imageQuality: 0.92,
};

// Initial state
const initialState: ImageToPDFState = {
    files: [],
    convertProgress: { status: 'idle', progress: 0, message: '' },
    options: defaultOptions,
    isLoading: false,
    error: null,
};

// Reducer
function imageToPDFReducer(state: ImageToPDFState, action: ImageToPDFAction): ImageToPDFState {
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

// Context interface
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

// Check if file is a valid image
function isValidImage(file: File): boolean {
    return SUPPORTED_IMAGE_TYPES.includes(file.type);
}

// Load image and get dimensions
function loadImage(file: File): Promise<{ width: number; height: number; dataUrl: string }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    dataUrl: e.target?.result as string,
                });
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Generate a timestamped filename for the PDF
function generatePDFFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[:-]/g, '')
        .replace('T', '_')
        .split('.')[0];
    return `images_to_pdf_${timestamp}.pdf`;
}

// Provider component
export function ImageToPDFProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(imageToPDFReducer, initialState);

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            state.files.forEach((file) => {
                if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
            });
        };
    }, [state.files]);

    // Add files
    const addFiles = useCallback(async (files: File[]) => {
        const validFiles = files.filter(isValidImage);

        if (validFiles.length === 0) {
            dispatch({ type: 'SET_ERROR', payload: 'Please select valid image files (JPG, PNG, GIF, WebP, BMP)' });
            return;
        }

        // Create initial file entries with loading state
        const newFiles: ImageFileInfo[] = validFiles.map((file) => ({
            id: generateId(),
            file,
            name: file.name,
            size: file.size,
            width: 0,
            height: 0,
            thumbnailUrl: null,
            previewUrl: URL.createObjectURL(file),
            isLoading: true,
            error: null,
        }));

        dispatch({ type: 'ADD_FILES', payload: newFiles });

        // Process each file
        for (const fileInfo of newFiles) {
            try {
                // Check file size (warn for files > 10MB)
                if (fileInfo.size > 10 * 1024 * 1024) {
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

                const { width, height, dataUrl } = await loadImage(fileInfo.file);

                dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                        id: fileInfo.id,
                        updates: {
                            width,
                            height,
                            thumbnailUrl: dataUrl,
                            isLoading: false,
                            error: null,
                        },
                    },
                });
            } catch (error) {
                console.error('Error processing file:', error);
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                        id: fileInfo.id,
                        updates: {
                            isLoading: false,
                            error: error instanceof Error ? error.message : 'Failed to process image',
                        },
                    },
                });
            }
        }
    }, []);

    // Remove file
    const removeFile = useCallback((id: string) => {
        const file = state.files.find((f) => f.id === id);
        if (file?.previewUrl) {
            URL.revokeObjectURL(file.previewUrl);
        }
        dispatch({ type: 'REMOVE_FILE', payload: id });
    }, [state.files]);

    // Reorder files
    const reorderFiles = useCallback((files: ImageFileInfo[]) => {
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
            if (file.previewUrl) {
                URL.revokeObjectURL(file.previewUrl);
            }
        });
        dispatch({ type: 'CLEAR_FILES' });
    }, [state.files]);

    // Set options
    const setOptions = useCallback((options: Partial<ImageToPDFOptions>) => {
        dispatch({ type: 'SET_OPTIONS', payload: options });
    }, []);

    // Convert images to PDF
    const convertToPDF = useCallback(async () => {
        if (state.files.length === 0) {
            dispatch({ type: 'SET_ERROR', payload: 'No images to convert' });
            return;
        }

        dispatch({
            type: 'SET_CONVERT_PROGRESS',
            payload: { status: 'loading', progress: 10, message: 'Preparing images...' },
        });

        try {
            const { pageSize, orientation, margin } = state.options;

            // Define page dimensions in mm
            const pageSizes: Record<string, { width: number; height: number }> = {
                A4: { width: 210, height: 297 },
                Letter: { width: 215.9, height: 279.4 },
                Original: { width: 210, height: 297 }, // Will be overridden per image
            };

            let pdf: jsPDF | null = null;
            const totalFiles = state.files.length;

            for (let i = 0; i < totalFiles; i++) {
                const file = state.files[i];

                dispatch({
                    type: 'SET_CONVERT_PROGRESS',
                    payload: {
                        status: 'converting',
                        progress: 10 + Math.round((i / totalFiles) * 80),
                        message: `Processing image ${i + 1} of ${totalFiles}...`,
                    },
                });

                // Load the image
                const img = new Image();
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
                    img.src = file.thumbnailUrl || file.previewUrl || '';
                });

                // Calculate dimensions
                let pageWidth: number;
                let pageHeight: number;
                let imgOrientation: 'portrait' | 'landscape';

                if (pageSize === 'Original') {
                    // Use image dimensions (convert px to mm at 96 DPI)
                    pageWidth = (img.naturalWidth / 96) * 25.4;
                    pageHeight = (img.naturalHeight / 96) * 25.4;
                    imgOrientation = pageWidth > pageHeight ? 'landscape' : 'portrait';
                } else {
                    const baseSize = pageSizes[pageSize];
                    const imgAspect = img.naturalWidth / img.naturalHeight;

                    // Determine orientation
                    if (orientation === 'auto') {
                        imgOrientation = imgAspect > 1 ? 'landscape' : 'portrait';
                    } else {
                        imgOrientation = orientation;
                    }

                    if (imgOrientation === 'landscape') {
                        pageWidth = baseSize.height;
                        pageHeight = baseSize.width;
                    } else {
                        pageWidth = baseSize.width;
                        pageHeight = baseSize.height;
                    }
                }

                // Initialize PDF with first page or add new page
                if (i === 0) {
                    pdf = new jsPDF({
                        orientation: imgOrientation,
                        unit: 'mm',
                        format: [pageWidth, pageHeight],
                    });
                } else {
                    pdf!.addPage([pageWidth, pageHeight], imgOrientation);
                }

                // Calculate image placement with margins
                const availableWidth = pageWidth - 2 * margin;
                const availableHeight = pageHeight - 2 * margin;
                const imgAspect = img.naturalWidth / img.naturalHeight;
                const areaAspect = availableWidth / availableHeight;

                let drawWidth: number;
                let drawHeight: number;

                if (imgAspect > areaAspect) {
                    // Image is wider than area
                    drawWidth = availableWidth;
                    drawHeight = availableWidth / imgAspect;
                } else {
                    // Image is taller than area
                    drawHeight = availableHeight;
                    drawWidth = availableHeight * imgAspect;
                }

                // Center the image
                const x = margin + (availableWidth - drawWidth) / 2;
                const y = margin + (availableHeight - drawHeight) / 2;

                // Add image to PDF
                const imageData = file.thumbnailUrl || file.previewUrl || '';
                const format = file.file.type.includes('png') ? 'PNG' : 'JPEG';

                pdf!.addImage(imageData, format, x, y, drawWidth, drawHeight, undefined, 'MEDIUM');
            }

            dispatch({
                type: 'SET_CONVERT_PROGRESS',
                payload: { status: 'converting', progress: 95, message: 'Generating PDF...' },
            });

            // Generate and download PDF
            const pdfBlob = pdf!.output('blob');
            const filename = generatePDFFilename();

            downloadBlob(pdfBlob, filename);

            dispatch({
                type: 'SET_CONVERT_PROGRESS',
                payload: { status: 'complete', progress: 100, message: 'Download started!' },
            });

            // Reset after download
            setTimeout(() => {
                dispatch({ type: 'SET_CONVERT_PROGRESS', payload: initialState.convertProgress });
            }, 2000);

        } catch (error) {
            console.error('Error converting to PDF:', error);
            dispatch({
                type: 'SET_CONVERT_PROGRESS',
                payload: {
                    status: 'error',
                    progress: 0,
                    message: error instanceof Error ? error.message : 'Failed to convert images to PDF',
                },
            });
        }
    }, [state.files, state.options]);

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

// Custom hook
export function useImageToPDF() {
    const context = useContext(ImageToPDFContext);
    if (!context) {
        throw new Error('useImageToPDF must be used within an ImageToPDFProvider');
    }
    return context;
}
