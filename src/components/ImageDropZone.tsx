import { useCallback } from 'react';
import { Box, Text, VStack, Icon } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useImageToPDF } from '../context/ImageToPDFContext';

/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, react-refresh/only-export-components */
// Use a loose typing for the motion-wrapped Chakra component to avoid
// incompatible prop type issues between Chakra's DOM handlers and
// the motion component's prop definitions.
const MotionBox: any = (motion as any)(Box);

export function ImageDropZone() {
    const { addFiles, files } = useImageToPDF();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            addFiles(acceptedFiles);
        },
        [addFiles]
    );

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/gif': ['.gif'],
            'image/webp': ['.webp'],
            'image/bmp': ['.bmp'],
        },
        multiple: true,
    });

    // Handle paste event
    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            const items = e.clipboardData.items;
            const files: File[] = [];

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        files.push(file);
                    }
                }
            }

            if (files.length > 0) {
                addFiles(files);
            }
        },
        [addFiles]
    );

    const getBorderColor = () => {
        if (isDragReject) return 'red.400';
        if (isDragAccept) return 'green.400';
        if (isDragActive) return 'purple.400';
        return 'gray.200';
    };

    const getBgColor = () => {
        if (isDragReject) return 'red.50';
        if (isDragAccept) return 'green.50';
        if (isDragActive) return 'purple.50';
        return 'gray.50';
    };

    const hasFiles = files.length > 0;

    return (
        <MotionBox
            {...getRootProps()}
            onPaste={handlePaste}
            tabIndex={0}
            role="button"
            aria-label="Drop image files here or click to select"
            cursor="pointer"
            border="2px dashed"
            borderColor={getBorderColor()}
            borderRadius="xl"
            bg={getBgColor()}
            p={{ base: 6, md: hasFiles ? 6 : 12 }}
            textAlign="center"
            style={{ transition: 'all 0.2s' }}
            _hover={{
                borderColor: 'purple.400',
                bg: 'purple.50',
            }}
            _focus={{
                outline: '2px solid',
                outlineColor: 'purple.500',
                outlineOffset: '2px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <input {...getInputProps()} />

            <VStack gap={3}>
                {/* Upload Icon */}
                <MotionBox
                    animate={{
                        y: isDragActive ? [-5, 5, -5] : 0,
                    }}
                    transition={{
                        repeat: isDragActive ? Infinity : 0,
                        duration: 1,
                    }}
                >
                    <Icon
                        w={{ base: 10, md: hasFiles ? 8 : 16 }}
                        h={{ base: 10, md: hasFiles ? 8 : 16 }}
                        color={isDragActive ? 'purple.500' : 'gray.400'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                        </svg>
                    </Icon>
                </MotionBox>

                {/* Text */}
                <VStack gap={1}>
                    <Text
                        fontSize={{ base: 'md', md: hasFiles ? 'md' : 'xl' }}
                        fontWeight="600"
                        color={isDragActive ? 'purple.600' : 'gray.700'}
                    >
                        {isDragActive
                            ? isDragReject
                                ? 'Only image files are accepted'
                                : 'Drop your images here'
                            : hasFiles
                                ? 'Drop more images or click to add'
                                : 'Drag & drop images here'}
                    </Text>

                    {!hasFiles && (
                        <Text fontSize="sm" color="gray.500">
                            JPG, PNG, GIF, WebP, BMP • paste from clipboard
                        </Text>
                    )}
                </VStack>

                {/* Upload Button */}
                <Box
                    as="span"
                    bg="linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)"
                    color="white"
                    px={{ base: 6, md: hasFiles ? 4 : 8 }}
                    py={{ base: 2, md: hasFiles ? 2 : 3 }}
                    borderRadius="full"
                    fontWeight="600"
                    fontSize={{ base: 'sm', md: hasFiles ? 'sm' : 'md' }}
                    shadow="lg"
                    style={{ transition: 'all 0.2s' }}
                    _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'xl',
                    }}
                >
                    {hasFiles ? '+ Add More Images' : 'Select Images'}
                </Box>
            </VStack>
        </MotionBox>
    );
}
