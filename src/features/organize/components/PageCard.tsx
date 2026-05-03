import { Box, Text, Center, IconButton, HStack } from '@chakra-ui/react';
import { RotateCcw, RotateCw, Trash2, Check, ZoomIn } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { OrganizedPage } from '../context/OrganizeContext';

interface PageCardProps {
    page: OrganizedPage;
    displayIndex: number;
    onRotate: (id: string, direction: 'cw' | 'ccw') => void;
    onDelete: (id: string) => void;
    onToggleSelect: (id: string) => void;
    onPreview: (page: OrganizedPage) => void;
}

export function PageCard({ page, displayIndex, onRotate, onDelete, onToggleSelect, onPreview }: PageCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto' as const,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            position="relative"
            borderRadius="xl"
            border="2px solid"
            borderColor={page.isSelected ? 'brand.400' : 'gray.100'}
            bg={page.isSelected ? 'brand.50' : 'white'}
            shadow={isDragging ? 'xl' : 'sm'}
            _hover={{
                shadow: 'md',
                borderColor: page.isSelected ? 'brand.500' : 'gray.200',
            }}
            transition="all 0.2s"
            overflow="hidden"
            role="group"
        >
            {/* Selection checkbox */}
            <Box
                position="absolute"
                top={2}
                left={2}
                zIndex={10}
                cursor="pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(page.id);
                }}
            >
                <Center
                    w="24px"
                    h="24px"
                    borderRadius="md"
                    bg={page.isSelected ? 'brand.500' : 'white'}
                    border="2px solid"
                    borderColor={page.isSelected ? 'brand.500' : 'gray.300'}
                    transition="all 0.15s"
                    _hover={{
                        borderColor: 'brand.400',
                    }}
                >
                    {page.isSelected && <Check size={14} color="white" strokeWidth={3} />}
                </Center>
            </Box>

            {/* Action Buttons Row */}
            <HStack
                gap={1}
                justify="center"
                py={2}
                px={2}
                bg="gray.50"
                borderBottom="1px solid"
                borderColor="gray.100"
            >
                <IconButton
                    aria-label="Rotate counter-clockwise"
                    variant="ghost"
                    size="sm"
                    borderRadius="lg"
                    color="gray.500"
                    _hover={{ color: 'brand.600', bg: 'brand.50' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRotate(page.id, 'ccw');
                    }}
                >
                    <RotateCcw size={16} />
                </IconButton>
                <IconButton
                    aria-label="Rotate clockwise"
                    variant="ghost"
                    size="sm"
                    borderRadius="lg"
                    color="gray.500"
                    _hover={{ color: 'brand.600', bg: 'brand.50' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onRotate(page.id, 'cw');
                    }}
                >
                    <RotateCw size={16} />
                </IconButton>
                <IconButton
                    aria-label="Delete page"
                    variant="ghost"
                    size="sm"
                    borderRadius="lg"
                    color="gray.500"
                    _hover={{ color: 'red.600', bg: 'red.50' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(page.id);
                    }}
                >
                    <Trash2 size={16} />
                </IconButton>
                {page.thumbnailUrl && (
                    <IconButton
                        aria-label="Preview page"
                        variant="ghost"
                        size="sm"
                        borderRadius="lg"
                        color="gray.500"
                        _hover={{ color: 'purple.600', bg: 'purple.50' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onPreview(page);
                        }}
                    >
                        <ZoomIn size={16} />
                    </IconButton>
                )}
            </HStack>

            {/* Thumbnail area — draggable */}
            <Box
                {...attributes}
                {...listeners}
                cursor="grab"
                _active={{ cursor: 'grabbing' }}
                display="flex"
                justifyContent="center"
                alignItems="center"
                minH="180px"
                p={3}
                bg="white"
            >
                {page.thumbnailUrl ? (
                    <Box
                        as="img"
                        {...({
                            src: page.thumbnailUrl,
                            alt: `Page ${displayIndex + 1}`,
                            maxH: '180px',
                            maxW: '100%',
                            objectFit: 'contain',
                            borderRadius: 'md',
                            shadow: 'sm',
                            transform: `rotate(${page.rotation}deg)`,
                            transition: 'transform 0.3s ease',
                            draggable: false,
                            userSelect: 'none',
                        } as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                    />
                ) : (
                    <Center
                        w="120px"
                        h="160px"
                        bg="gray.100"
                        borderRadius="md"
                        transform={`rotate(${page.rotation}deg)`}
                        transition="transform 0.3s ease"
                    >
                        <Box className="animate-pulse">
                            <Text fontSize="2xl" color="gray.300">📄</Text>
                        </Box>
                    </Center>
                )}
            </Box>

            {/* Page number label */}
            <Text
                textAlign="center"
                py={2}
                fontSize="sm"
                fontWeight="700"
                color="gray.600"
                borderTop="1px solid"
                borderColor="gray.100"
                bg="gray.50"
            >
                Page {displayIndex + 1}
            </Text>
        </Box>
    );
}
