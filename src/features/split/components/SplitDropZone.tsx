import { useCallback } from 'react';
import { Box, Text, VStack, Icon } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useSplit } from '../../../context/SplitContext';

/* eslint-disable @typescript-eslint/no-explicit-any */
const MotionBox: any = (motion as any)(Box);

const ACCEPTED_TYPES = {
    'application/pdf': ['.pdf'],
};

export function SplitDropZone() {
    const { addFile, file } = useSplit();

    const onDrop = useCallback(
        (accepted: File[]) => { if (accepted.length > 0) addFile(accepted); },
        [addFile]
    );

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        multiple: false,
        maxFiles: 1,
    });

    const hasFile = file !== null;

    const borderColor = isDragReject
        ? 'red.400'
        : isDragAccept
          ? 'green.400'
          : isDragActive
            ? 'red.400'
            : hasFile
              ? 'red.300'
              : 'gray.200';

    const bgColor = isDragReject
        ? 'red.50'
        : isDragAccept
          ? 'green.50'
          : isDragActive
            ? '#fff5f5'
            : hasFile
              ? '#fff5f5'
              : 'gray.50';

    return (
        <MotionBox
            {...getRootProps()}
            tabIndex={0}
            role="button"
            aria-label="Drop a PDF file here or click to select"
            cursor="pointer"
            border="2px dashed"
            borderColor={borderColor}
            borderRadius="xl"
            bg={bgColor}
            p={{ base: 6, md: hasFile ? 5 : 12 }}
            textAlign="center"
            style={{ transition: 'all 0.2s' }}
            _hover={{ borderColor: 'red.400', bg: '#fff5f5' }}
            _focus={{
                outline: '2px solid',
                outlineColor: 'red.500',
                outlineOffset: '2px',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <input {...getInputProps()} aria-label="Upload PDF file to split" />

            <VStack gap={3}>
                <MotionBox
                    animate={{ y: isDragActive ? [-5, 5, -5] : 0 }}
                    transition={{ repeat: isDragActive ? Infinity : 0, duration: 1 }}
                >
                    <Icon
                        w={{ base: 10, md: hasFile ? 8 : 14 }}
                        h={{ base: 10, md: hasFile ? 8 : 14 }}
                        color={isDragActive ? 'red.500' : hasFile ? 'red.400' : 'gray.400'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </Icon>
                </MotionBox>

                <VStack gap={1}>
                    <Text
                        fontSize={{ base: 'md', md: hasFile ? 'md' : 'xl' }}
                        fontWeight="600"
                        color={isDragActive ? 'red.600' : hasFile ? 'red.700' : 'gray.700'}
                    >
                        {isDragActive
                            ? isDragReject
                                ? 'Only PDF files are accepted'
                                : 'Drop your PDF here'
                            : hasFile
                              ? 'Drop a new PDF to replace'
                              : 'Drag & drop a PDF here'}
                    </Text>

                    {!hasFile && (
                        <Text fontSize="sm" color="gray.500">
                            Single PDF only • all splitting happens in your browser
                        </Text>
                    )}
                </VStack>

                <Box
                    as="span"
                    bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                    color="white"
                    px={{ base: 6, md: hasFile ? 4 : 8 }}
                    py={{ base: 2, md: hasFile ? 2 : 3 }}
                    borderRadius="full"
                    fontWeight="600"
                    fontSize={{ base: 'sm', md: hasFile ? 'sm' : 'md' }}
                    shadow="lg"
                    style={{ transition: 'all 0.2s' }}
                    _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                >
                    {hasFile ? 'Replace PDF' : 'Select PDF'}
                </Box>
            </VStack>
        </MotionBox>
    );
}
