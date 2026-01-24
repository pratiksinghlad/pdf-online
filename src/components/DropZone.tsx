import { useCallback } from 'react';
import { Box, Text, VStack, Icon } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { usePDF } from '../context/PDFContext';

const MotionBox = motion.create(Box);

export function DropZone() {
    const { addFiles, files } = usePDF();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            addFiles(acceptedFiles);
        },
        [addFiles]
    );

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
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
                if (item.kind === 'file') {
                    const file = item.getAsFile();
                    if (file && file.type === 'application/pdf') {
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
        if (isDragActive) return 'brand.400';
        return 'gray.200';
    };

    const getBgColor = () => {
        if (isDragReject) return 'red.50';
        if (isDragAccept) return 'green.50';
        if (isDragActive) return 'brand.50';
        return 'gray.50';
    };

    const hasFiles = files.length > 0;

    return (
        <MotionBox
            {...getRootProps()}
            onPaste={handlePaste}
            tabIndex={0}
            role="button"
            aria-label="Drop PDF files here or click to select"
            cursor="pointer"
            border="2px dashed"
            borderColor={getBorderColor()}
            borderRadius="xl"
            bg={getBgColor()}
            p={{ base: 6, md: hasFiles ? 6 : 12 }}
            textAlign="center"
            transition="all 0.2s"
            _hover={{
                borderColor: 'brand.400',
                bg: 'brand.50',
            }}
            _focus={{
                outline: '2px solid',
                outlineColor: 'brand.500',
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
                        color={isDragActive ? 'brand.500' : 'gray.400'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </Icon>
                </MotionBox>

                {/* Text */}
                <VStack gap={1}>
                    <Text
                        fontSize={{ base: 'md', md: hasFiles ? 'md' : 'xl' }}
                        fontWeight="600"
                        color={isDragActive ? 'brand.600' : 'gray.700'}
                    >
                        {isDragActive
                            ? isDragReject
                                ? 'Only PDF files are accepted'
                                : 'Drop your PDFs here'
                            : hasFiles
                                ? 'Drop more files or click to add'
                                : 'Drag & drop PDF files here'}
                    </Text>

                    {!hasFiles && (
                        <Text fontSize="sm" color="gray.500">
                            or click to select files • paste from clipboard
                        </Text>
                    )}
                </VStack>

                {/* Upload Button */}
                <Box
                    as="span"
                    bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                    color="white"
                    px={{ base: 6, md: hasFiles ? 4 : 8 }}
                    py={{ base: 2, md: hasFiles ? 2 : 3 }}
                    borderRadius="full"
                    fontWeight="600"
                    fontSize={{ base: 'sm', md: hasFiles ? 'sm' : 'md' }}
                    shadow="lg"
                    transition="all 0.2s"
                    _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'xl',
                    }}
                >
                    {hasFiles ? '+ Add More PDFs' : 'Select PDF Files'}
                </Box>
            </VStack>
        </MotionBox>
    );
}
