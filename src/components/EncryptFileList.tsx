import { Box, VStack, Text, Flex, Button } from '@chakra-ui/react';
import { useEncrypt } from '../context/EncryptContext';
import { EncryptFileCard } from './EncryptFileCard';

export function EncryptFileList() {
    const { files, clearFiles, processFiles, isProcessing, downloadAllProcessed } = useEncrypt();

    if (files.length === 0) {
        return null;
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const hasSuccess = files.some(f => f.status === 'success');
    const allSuccess = files.length > 0 && files.every(f => f.status === 'success');

    return (
        <Box>
            <Flex
                justify="space-between"
                align="center"
                mb={4}
                pb={3}
                borderBottom="1px solid"
                borderColor="gray.100"
            >
                <VStack align="start" gap={0}>
                    <Text fontWeight="600" fontSize="lg" color="gray.800">
                        Files to Encrypt
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        {files.length} {files.length === 1 ? 'file' : 'files'} • {(totalSize / 1024 / 1024).toFixed(2)} MB total
                    </Text>
                </VStack>

                <Flex gap={2}>
                   {hasSuccess && (
                       <Button
                           variant="outline"
                           size="sm"
                           colorPalette="red"
                           onClick={downloadAllProcessed}
                       >
                           Download Encrypted
                       </Button>
                   )}
                   <Button
                       variant="ghost"
                       size="sm"
                       color="red.500"
                       onClick={clearFiles}
                       disabled={isProcessing}
                       _hover={{ bg: 'red.50' }}
                   >
                       Clear All
                   </Button>
                </Flex>
            </Flex>

            <VStack gap={3} align="stretch" role="list">
                {files.map((file) => (
                    <EncryptFileCard key={file.id} file={file} />
                ))}
            </VStack>

            {files.length > 0 && !allSuccess && (
                <Flex justify="center" mt={8}>
                    <Button
                        colorScheme="red"
                        bg="red.500"
                        color="white"
                        size="lg"
                        px={10}
                        shadow="md"
                        _hover={{ bg: 'red.600', shadow: 'lg' }}
                        onClick={processFiles}
                        loading={isProcessing}
                        loadingText="Encrypting..."
                    >
                        Password Protect PDFs
                    </Button>
                </Flex>
            )}
        </Box>
    );
}
