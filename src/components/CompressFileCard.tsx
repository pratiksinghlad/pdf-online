import { Box, Text, Flex, IconButton, Image, HStack, Badge, Skeleton, Progress } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { CompressedFileInfo } from '../types/compress';
import { formatFileSize } from '../utils';
import { useCompress } from '../context/CompressContext';

const MotionBox = motion.create(Box);

interface CompressFileCardProps {
    file: CompressedFileInfo;
}

export function CompressFileCard({ file }: CompressFileCardProps) {
    const { removeFile, downloadCompressed } = useCompress();

    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Box
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor={file.error && !file.isLoading ? 'red.200' : 'gray.100'}
                overflow="hidden"
                transition="all 0.2s"
                _hover={{
                    borderColor: 'blue.200',
                    shadow: 'lg',
                }}
            >
                <Flex direction="row" align="center" p={4} gap={4}>
                    {/* Thumbnail */}
                    <Box
                        w={{ base: '50px', md: '60px' }}
                        minW={{ base: '50px', md: '60px' }}
                        h={{ base: '65px', md: '75px' }}
                        bg="gray.100"
                        overflow="hidden"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.200"
                        position="relative"
                    >
                        {file.isLoading ? (
                            <Skeleton w="100%" h="100%" />
                        ) : file.thumbnailUrl ? (
                            <Image
                                src={file.thumbnailUrl}
                                alt={`First page of ${file.name}`}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                            />
                        ) : (
                            <Flex w="100%" h="100%" align="center" justify="center" bg="red.50">
                                <Box
                                    bg="red.500"
                                    color="white"
                                    px={2}
                                    py={1}
                                    fontSize="xs"
                                    fontWeight="bold"
                                    borderRadius="sm"
                                >
                                    PDF
                                </Box>
                            </Flex>
                        )}
                    </Box>

                    {/* File Info */}
                    <Flex flex={1} direction="column" gap={1} minW={0}>
                        <Text
                            fontWeight="600"
                            fontSize={{ base: 'sm', md: 'md' }}
                            color={file.isCompressed ? 'blue.600' : 'gray.800'}
                            truncate
                            title={file.name}
                        >
                            {file.name}
                        </Text>

                        <HStack gap={2} flexWrap="wrap">
                            <Text fontSize="xs" color="gray.500">
                                {formatFileSize(file.originalSize)}
                            </Text>

                            {file.isLoading ? (
                                <Skeleton w="50px" h="16px" borderRadius="full" />
                            ) : file.pageCount > 0 ? (
                                <Text fontSize="xs" color="gray.400">
                                    - {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}
                                </Text>
                            ) : null}
                        </HStack>

                        {/* Compression Result */}
                        {file.isCompressed && file.compressedSize !== null && (
                            <HStack gap={2} mt={1}>
                                <Badge
                                    colorPalette="green"
                                    variant="subtle"
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                >
                                    {formatFileSize(file.compressedSize)}
                                </Badge>
                                {file.compressionRatio !== null && file.compressionRatio > 0 && (
                                    <Badge
                                        colorPalette="green"
                                        variant="solid"
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        borderRadius="full"
                                    >
                                        -{file.compressionRatio.toFixed(1)}%
                                    </Badge>
                                )}
                            </HStack>
                        )}

                        {/* Compressing Progress */}
                        {file.isCompressing && (
                            <Progress.Root value={null} size="xs" mt={2} colorPalette="blue">
                                <Progress.Track>
                                    <Progress.Range />
                                </Progress.Track>
                            </Progress.Root>
                        )}

                        {file.error && (
                            <Text fontSize="xs" color="red.500" mt={1}>
                                ⚠️ {file.error}
                            </Text>
                        )}
                    </Flex>

                    {/* Actions */}
                    <HStack gap={1}>
                        {/* Download Button (show when compressed) */}
                        {file.isCompressed && file.compressedBuffer && (
                            <IconButton
                                aria-label="Download compressed file"
                                variant="ghost"
                                size="sm"
                                color="green.500"
                                onClick={() => downloadCompressed(file.id)}
                                _hover={{ bg: 'green.50' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </IconButton>
                        )}

                        {/* Remove Button */}
                        <IconButton
                            aria-label="Remove file"
                            variant="ghost"
                            size="sm"
                            color="gray.400"
                            onClick={() => removeFile(file.id)}
                            _hover={{ bg: 'gray.100', color: 'red.500' }}
                            disabled={file.isCompressing}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </IconButton>
                    </HStack>
                </Flex>
            </Box>
        </MotionBox>
    );
}
