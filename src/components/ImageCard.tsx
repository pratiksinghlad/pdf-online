import { Box, Text, Flex, IconButton, Image, HStack, Badge, Skeleton, VStack } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { ImageFileInfo } from '../types/image';
import { formatFileSize } from '../utils';
import { useImageToPDF } from '../context/ImageToPDFContext';

const MotionBox = motion.create(Box);

interface ImageCardProps {
    file: ImageFileInfo;
    index: number;
}

export function ImageCard({ file, index }: ImageCardProps) {
    const { removeFile, moveFileToTop, moveFileToBottom, moveFile, files } = useImageToPDF();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (index > 0) {
                    moveFile(index, index - 1);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (index < files.length - 1) {
                    moveFile(index, index + 1);
                }
                break;
            case 'Home':
                e.preventDefault();
                moveFileToTop(file.id);
                break;
            case 'End':
                e.preventDefault();
                moveFileToBottom(file.id);
                break;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                removeFile(file.id);
                break;
        }
    };

    const getDimensionText = () => {
        if (file.width && file.height) {
            return `${file.width} × ${file.height}`;
        }
        return null;
    };

    return (
        <MotionBox
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: isDragging ? 0.8 : 1,
                scale: isDragging ? 1.02 : 1,
                boxShadow: isDragging
                    ? '0 20px 40px rgba(0,0,0,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.08)'
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="listitem"
            aria-label={`Image: ${file.name}, ${getDimensionText() || 'loading'}, ${formatFileSize(file.size)}. Use arrow keys to reorder, Delete to remove.`}
            _focus={{
                outline: '2px solid',
                outlineColor: 'purple.500',
                outlineOffset: '2px',
            }}
        >
            <Box
                bg="white"
                borderRadius="xl"
                border="1px solid"
                borderColor={file.error && !file.isLoading ? 'red.200' : 'gray.100'}
                overflow="hidden"
                transition="all 0.2s"
                _hover={{
                    borderColor: 'purple.200',
                    shadow: 'lg',
                }}
            >
                <Flex direction={{ base: 'row', md: 'row' }} align="stretch">
                    {/* Drag Handle */}
                    <Flex
                        {...attributes}
                        {...listeners}
                        align="center"
                        justify="center"
                        px={3}
                        cursor="grab"
                        bg="gray.50"
                        borderRight="1px solid"
                        borderColor="gray.100"
                        _hover={{ bg: 'gray.100' }}
                        _active={{ cursor: 'grabbing' }}
                        aria-label="Drag to reorder"
                        style={{ touchAction: 'none' }}
                    >
                        <VStack gap={0.5}>
                            {[0, 1, 2].map((i) => (
                                <HStack key={i} gap={0.5}>
                                    <Box w={1} h={1} bg="gray.400" borderRadius="full" />
                                    <Box w={1} h={1} bg="gray.400" borderRadius="full" />
                                </HStack>
                            ))}
                        </VStack>
                    </Flex>

                    {/* Thumbnail */}
                    <Box
                        w={{ base: '60px', md: '80px' }}
                        minW={{ base: '60px', md: '80px' }}
                        h={{ base: '80px', md: '100px' }}
                        bg="gray.100"
                        overflow="hidden"
                        borderRight="1px solid"
                        borderColor="gray.100"
                    >
                        {file.isLoading ? (
                            <Skeleton w="100%" h="100%" />
                        ) : file.previewUrl || file.thumbnailUrl ? (
                            <Image
                                src={file.previewUrl || file.thumbnailUrl || ''}
                                alt={`Preview of ${file.name}`}
                                w="100%"
                                h="100%"
                                objectFit="cover"
                            />
                        ) : (
                            <Flex w="100%" h="100%" align="center" justify="center" bg="gray.200">
                                <Text fontSize="xs" color="gray.500">
                                    No preview
                                </Text>
                            </Flex>
                        )}
                    </Box>

                    {/* File Info */}
                    <Flex flex={1} direction="column" justify="center" p={3} gap={1} minW={0}>
                        <Text
                            fontWeight="600"
                            fontSize={{ base: 'sm', md: 'md' }}
                            color="gray.800"
                            truncate
                            title={file.name}
                        >
                            {file.name}
                        </Text>

                        <HStack gap={2} flexWrap="wrap">
                            <Badge
                                colorPalette="gray"
                                variant="subtle"
                                fontSize="xs"
                                px={2}
                                py={0.5}
                                borderRadius="full"
                            >
                                {formatFileSize(file.size)}
                            </Badge>

                            {file.isLoading ? (
                                <Skeleton w="60px" h="20px" borderRadius="full" />
                            ) : getDimensionText() ? (
                                <Badge
                                    colorPalette="purple"
                                    variant="subtle"
                                    fontSize="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                >
                                    {getDimensionText()}
                                </Badge>
                            ) : null}
                        </HStack>

                        {file.error && (
                            <Text fontSize="xs" color="red.500" mt={1}>
                                ⚠️ {file.error}
                            </Text>
                        )}
                    </Flex>

                    {/* Actions */}
                    <Flex align="center" gap={1} px={2}>
                        {/* Move Up */}
                        <IconButton
                            aria-label="Move up"
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => moveFile(index, index - 1)}
                            _hover={{ bg: 'gray.100' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            </svg>
                        </IconButton>

                        {/* Move Down */}
                        <IconButton
                            aria-label="Move down"
                            variant="ghost"
                            size="sm"
                            disabled={index === files.length - 1}
                            onClick={() => moveFile(index, index + 1)}
                            _hover={{ bg: 'gray.100' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </IconButton>

                        {/* Remove */}
                        <IconButton
                            aria-label="Remove file"
                            variant="ghost"
                            size="sm"
                            color="red.500"
                            onClick={() => removeFile(file.id)}
                            _hover={{ bg: 'red.50' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </IconButton>
                    </Flex>
                </Flex>

                {/* Position indicator */}
                <Box
                    position="absolute"
                    top={2}
                    left={2}
                    bg="purple.500"
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                    w={5}
                    h={5}
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    shadow="md"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.2s"
                >
                    {index + 1}
                </Box>
            </Box>
        </MotionBox>
    );
}
