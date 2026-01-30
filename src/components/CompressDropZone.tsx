import { useCallback } from 'react';
import { Box, Text, VStack, Icon, HStack, Button } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useCompress } from '../context/CompressContext';

/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, react-refresh/only-export-components */
const MotionBox: any = (motion as any)(Box);

export function CompressDropZone() {
    const { addFiles, files } = useCompress();

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            addFiles(acceptedFiles);
        },
        [addFiles]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        multiple: true,
    });

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

    const hasFiles = files.length > 0;

    if (hasFiles) {
        return null; // Hide dropzone when files are loaded
    }

    return (
        <MotionBox
            {...getRootProps()}
            onPaste={handlePaste}
            tabIndex={0}
            role="button"
            aria-label="Drop PDF files here or click to select"
            cursor="pointer"
            bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
            borderRadius="xl"
            p={{ base: 8, md: 12 }}
            textAlign="center"
            position="relative"
            overflow="hidden"
            border="3px dashed"
            borderColor={isDragActive ? 'white' : 'rgba(255,255,255,0.3)'}
            style={{ transition: 'all 0.3s' }}
            _hover={{
                transform: 'scale(1.01)',
                shadow: '0 20px 60px rgba(229, 62, 62, 0.4)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Background Pattern */}
            <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                opacity={0.1}
                bgImage="radial-gradient(circle at 20% 20%, white 1px, transparent 1px)"
                bgSize="30px 30px"
            />

            <input {...getInputProps()} />

            <VStack gap={6} position="relative" zIndex={1}>
                {/* PDF Icon */}
                <MotionBox
                    animate={{
                        y: isDragActive ? [-5, 5, -5] : 0,
                    }}
                    transition={{
                        repeat: isDragActive ? Infinity : 0,
                        duration: 1,
                    }}
                >
                    <Box
                        w={20}
                        h={20}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                    >
                        {/* Stacked PDF icons */}
                        <Box
                            position="absolute"
                            w={14}
                            h={18}
                            bg="white"
                            borderRadius="md"
                            shadow="lg"
                            transform="rotate(-8deg) translateX(-8px)"
                            opacity={0.7}
                        />
                        <Box
                            position="absolute"
                            w={14}
                            h={18}
                            bg="white"
                            borderRadius="md"
                            shadow="lg"
                            transform="rotate(8deg) translateX(8px)"
                            opacity={0.7}
                        />
                        <Box
                            position="relative"
                            w={14}
                            h={18}
                            bg="white"
                            borderRadius="md"
                            shadow="xl"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Icon color="brand.500" boxSize={6}>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.92,12.31 10.92,12.31Z" />
                                </svg>
                            </Icon>
                        </Box>
                    </Box>
                </MotionBox>

                {/* Button */}
                <HStack gap={0}>
                    <Button
                        bg="white"
                        color="gray.700"
                        px={8}
                        py={6}
                        borderRadius="md"
                        fontWeight="600"
                        fontSize="md"
                        shadow="lg"
                        borderRightRadius={0}
                        _hover={{
                            bg: 'gray.50',
                        }}
                    >
                        <Icon mr={2}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </Icon>
                        CHOOSE FILES
                    </Button>
                    <Button
                        bg="white"
                        color="gray.400"
                        px={4}
                        py={6}
                        borderRadius="md"
                        borderLeftRadius={0}
                        borderLeft="1px solid"
                        borderColor="gray.200"
                        _hover={{
                            bg: 'gray.50',
                        }}
                    >
                        <Icon>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </Icon>
                    </Button>
                </HStack>

                {/* Text */}
                <Text color="rgba(255,255,255,0.9)" fontSize="md" fontWeight="500">
                    {isDragActive
                        ? isDragReject
                            ? 'Only PDF files are accepted'
                            : 'Drop your PDFs here'
                        : 'or drop files here'}
                </Text>
            </VStack>
        </MotionBox>
    );
}
