import { Box, HStack, Button, Text, VStack } from '@chakra-ui/react';
import { Download, Archive, Loader2, Image as ImageIcon } from 'lucide-react';
import { usePdfToImage } from '../context/PdfToImageContext';

export function ExportActions() {
    const {
        file,
        pages,
        progress,
        isRendering,
        selectedCount,
        renderPages,
        selectAll,
        deselectAll,
        downloadSelected,
        downloadAllAsZip,
    } = usePdfToImage();

    if (!file || pages.length === 0) return null;

    const hasRendered = pages.some((p) => p.imageBlob);
    const isProcessing = progress.status === 'rendering' || progress.status === 'zipping';
    const isComplete = progress.status === 'complete';
    const isError = progress.status === 'error';

    return (
        <VStack gap={4} align="stretch">
            {/* Render button — shown until pages are rendered */}
            {!hasRendered && (
                <Button
                    w="100%"
                    h="56px"
                    bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                    color="white"
                    borderRadius="xl"
                    fontSize="md"
                    fontWeight="800"
                    shadow="lg"
                    _hover={{
                        transform: isRendering ? 'none' : 'translateY(-2px)',
                        shadow: isRendering ? 'lg' : 'xl',
                    }}
                    _active={{ transform: 'translateY(0)' }}
                    transition="all 0.2s"
                    onClick={renderPages}
                    disabled={isRendering}
                    gap={2}
                >
                    {isRendering ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            {progress.message}
                        </>
                    ) : (
                        <>
                            <ImageIcon size={20} />
                            Convert to Images
                        </>
                    )}
                </Button>
            )}

            {/* Selection controls — after rendering */}
            {hasRendered && (
                <HStack gap={2} flexWrap="wrap" justify="space-between" align="center" bg="gray.50" p={2} borderRadius="lg">
                    <HStack gap={1}>
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="gray.200"
                            bg="white"
                            onClick={selectAll}
                            disabled={isProcessing}
                        >
                            Select All
                        </Button>
                        <Button
                            size="xs"
                            variant="outline"
                            borderColor="gray.200"
                            bg="white"
                            onClick={deselectAll}
                            disabled={isProcessing}
                        >
                            Deselect All
                        </Button>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" fontWeight="800" pr={2}>
                        {selectedCount} / {pages.length}
                    </Text>
                </HStack>
            )}

            {/* Main Action Buttons */}
            {hasRendered && (
                <VStack gap={3} w="100%">
                    <Button
                        w="100%"
                        h="52px"
                        bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                        color="white"
                        borderRadius="xl"
                        fontSize="md"
                        fontWeight="800"
                        shadow="md"
                        gap={2}
                        _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                        _active={{ transform: 'translateY(0)' }}
                        onClick={downloadSelected}
                        disabled={isProcessing || selectedCount === 0}
                    >
                        <Download size={20} />
                        {isProcessing && progress.status === 'zipping' ? progress.message : `Download Selected (${selectedCount})`}
                    </Button>

                    <Button
                        w="100%"
                        h="52px"
                        bg="gray.800"
                        color="white"
                        borderRadius="xl"
                        fontSize="md"
                        fontWeight="800"
                        shadow="md"
                        gap={2}
                        _hover={{ transform: 'translateY(-2px)', shadow: 'xl', bg: 'gray.700' }}
                        _active={{ transform: 'translateY(0)' }}
                        onClick={downloadAllAsZip}
                        disabled={isProcessing}
                    >
                        <Archive size={20} />
                        Download All as ZIP
                    </Button>

                    <Button
                        w="100%"
                        h="48px"
                        variant="outline"
                        borderColor="gray.200"
                        borderRadius="xl"
                        fontSize="sm"
                        fontWeight="700"
                        color="gray.600"
                        gap={2}
                        _hover={{ bg: 'gray.50', color: 'gray.800' }}
                        onClick={renderPages}
                        disabled={isRendering}
                    >
                        <ImageIcon size={18} />
                        Re-render with new settings
                    </Button>
                </VStack>
            )}

            {/* Progress bar */}
            {isProcessing && (
                <Box w="100%" h="4px" bg="gray.200" borderRadius="full" overflow="hidden">
                    <Box
                        h="100%"
                        w={`${progress.progress}%`}
                        bg="brand.500"
                        borderRadius="full"
                        transition="width 0.3s ease"
                    />
                </Box>
            )}

            {/* Status messages */}
            {isComplete && (
                <Text fontSize="sm" color="green.500" fontWeight="700" textAlign="center">
                    ✓ {progress.message}
                </Text>
            )}

            {isError && (
                <Text fontSize="sm" color="red.500" fontWeight="600" textAlign="center">
                    {progress.message}
                </Text>
            )}
        </VStack>
    );
}
