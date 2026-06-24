import { Box, Text, HStack, Center, chakra } from '@chakra-ui/react';
import { Download, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePdfToImage } from '../context/PdfToImageContext';

/* eslint-disable @typescript-eslint/no-explicit-any */
const MotionBox: any = (motion as any)(Box);

export function PagePreviewGrid() {
    const { pages, toggleSelect, downloadPage, isRendering } = usePdfToImage();

    const renderedPages = pages.filter((p) => p.thumbnailUrl);

    if (renderedPages.length === 0) return null;

    return (
        <Box>
            <Text fontWeight="800" color="gray.700" fontSize="sm" mb={4}>
                Rendered Pages ({renderedPages.length})
            </Text>

            <Box
                display="grid"
                gridTemplateColumns={{
                    base: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(5, 1fr)',
                }}
                gap={4}
            >
                {pages.map((page, idx) => (
                    <MotionBox
                        key={page.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        position="relative"
                        borderRadius="xl"
                        overflow="hidden"
                        border="2px solid"
                        borderColor={page.isSelected ? 'brand.400' : 'gray.100'}
                        bg="white"
                        shadow={page.isSelected ? 'md' : 'sm'}
                        cursor="pointer"
                        onClick={() => toggleSelect(page.id)}
                        _hover={{
                            shadow: 'lg',
                            borderColor: page.isSelected ? 'brand.500' : 'gray.200',
                        }}
                        style={{ transition: 'all 0.2s' }}
                    >
                        {/* Selection indicator */}
                        <Box
                            position="absolute"
                            top={2}
                            left={2}
                            zIndex={2}
                            w="24px"
                            h="24px"
                            borderRadius="md"
                            bg={page.isSelected ? 'brand.500' : 'rgba(255,255,255,0.9)'}
                            border="2px solid"
                            borderColor={page.isSelected ? 'brand.500' : 'gray.300'}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            transition="all 0.2s"
                        >
                            {page.isSelected && <Check size={14} color="white" />}
                        </Box>

                        {/* Thumbnail image */}
                        <Center
                            bg="gray.50"
                            minH="160px"
                            p={2}
                        >
                            {page.thumbnailUrl ? (
                                <chakra.img
                                    src={page.thumbnailUrl}
                                    alt={`Page ${page.pageIndex + 1}`}
                                    maxW="100%"
                                    maxH="200px"
                                    objectFit="contain"
                                    borderRadius="md"
                                />
                            ) : (
                                <Box textAlign="center" py={8}>
                                    <Text fontSize="2xl" color="gray.300">📄</Text>
                                    <Text fontSize="xs" color="gray.400" mt={1}>
                                        Not rendered
                                    </Text>
                                </Box>
                            )}
                        </Center>

                        {/* Footer */}
                        <HStack
                            px={3}
                            py={2}
                            bg="gray.50"
                            borderTop="1px solid"
                            borderColor="gray.100"
                            justify="space-between"
                        >
                            <Text fontSize="xs" fontWeight="700" color="gray.600">
                                Page {page.pageIndex + 1}
                            </Text>

                            {page.imageBlob && (
                                <chakra.button
                                    onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        downloadPage(page.id);
                                    }}
                                    p={1}
                                    borderRadius="md"
                                    _hover={{ bg: 'brand.50', color: 'brand.600' }}
                                    color="gray.500"
                                    transition="all 0.2s"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                    aria-label={`Download page ${page.pageIndex + 1}`}
                                    disabled={isRendering}
                                >
                                    <Download size={14} />
                                </chakra.button>
                            )}
                        </HStack>
                    </MotionBox>
                ))}
            </Box>
        </Box>
    );
}
