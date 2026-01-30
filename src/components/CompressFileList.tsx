import { Box, VStack } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import { CompressFileCard } from './CompressFileCard';
import { useCompress } from '../context/CompressContext';

export function CompressFileList() {
    const { files } = useCompress();

    if (files.length === 0) {
        return null;
    }

    return (
        <Box
            bg="white"
            borderRadius="xl"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
            maxH="400px"
            overflowY="auto"
        >
            <VStack gap={0} align="stretch">
                <AnimatePresence mode="popLayout">
                    {files.map((file) => (
                        <Box
                            key={file.id}
                            borderBottom="1px solid"
                            borderColor="gray.50"
                            _last={{ borderBottom: 'none' }}
                        >
                            <CompressFileCard file={file} />
                        </Box>
                    ))}
                </AnimatePresence>
            </VStack>
        </Box>
    );
}
