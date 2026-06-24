import React from 'react';
import { Box, IconButton, Portal, Text } from '@chakra-ui/react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { useOrganize } from '../context/OrganizeContext';
import { PageCard } from './PageCard';
import type { OrganizedPage } from '../context/OrganizeContext';

/* eslint-disable @typescript-eslint/no-explicit-any */
const MotionBox: any = (motion as any)(Box);

export function PageGrid() {
    const { pages, reorderPages, rotatePage, deletePage, toggleSelect } = useOrganize();
    const [previewPage, setPreviewPage] = React.useState<OrganizedPage | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = pages.findIndex((p) => p.id === active.id);
            const newIndex = pages.findIndex((p) => p.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = arrayMove(pages, oldIndex, newIndex);
                reorderPages(reordered);
            }
        }
    };

    if (pages.length === 0) return null;

    return (
        <>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={pages.map((p) => p.id)}
                    strategy={rectSortingStrategy}
                >
                    <Box
                        display="grid"
                        gridTemplateColumns={{
                            base: 'repeat(2, 1fr)',
                            sm: 'repeat(3, 1fr)',
                            md: 'repeat(4, 1fr)',
                            lg: 'repeat(5, 1fr)',
                        }}
                        gap={4}
                        w="100%"
                    >
                        {pages.map((page, index) => (
                            <PageCard
                                key={page.id}
                                page={page}
                                displayIndex={index}
                                onRotate={rotatePage}
                                onDelete={deletePage}
                                onToggleSelect={toggleSelect}
                                onPreview={setPreviewPage}
                            />
                        ))}
                    </Box>
                </SortableContext>
            </DndContext>

            {/* Preview Overlay */}
            <AnimatePresence>
                {previewPage && (
                    <Portal>
                        {/* Full-screen backdrop */}
                        <MotionBox
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            position="fixed"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            zIndex={2000}
                            bg="rgba(0, 0, 0, 0.92)"
                            backdropFilter="blur(8px)"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            p={{ base: 4, md: 8 }}
                            onClick={() => setPreviewPage(null)}
                        >
                            {/* Top bar — page label + close */}
                            <Box
                                w="100%"
                                maxW={{ base: '100%', md: '800px' }}
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                mb={4}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                <Text
                                    color="white"
                                    fontSize={{ base: 'lg', md: 'xl' }}
                                    fontWeight="700"
                                    letterSpacing="-0.3px"
                                >
                                    Page {previewPage.pageIndex + 1}
                                    {previewPage.rotation !== 0 && (
                                        <Text as="span" fontSize="sm" color="whiteAlpha.600" ml={2} fontWeight="400">
                                            ({previewPage.rotation}°)
                                        </Text>
                                    )}
                                </Text>

                                <IconButton
                                    aria-label="Close preview"
                                    size="lg"
                                    borderRadius="full"
                                    bg="whiteAlpha.200"
                                    color="white"
                                    border="1px solid"
                                    borderColor="whiteAlpha.300"
                                    _hover={{ bg: 'whiteAlpha.400' }}
                                    onClick={() => setPreviewPage(null)}
                                >
                                    <X size={20} />
                                </IconButton>
                            </Box>

                            {/* Image panel */}
                            <MotionBox
                                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                w="100%"
                                maxW={{ base: '100%', md: '800px' }}
                                flex={1}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                <Box
                                    bg="white"
                                    borderRadius="2xl"
                                    shadow="0 32px 80px rgba(0,0,0,0.6)"
                                    overflow="hidden"
                                    w="100%"
                                    maxH={{ base: '70vh', md: '80vh' }}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    p={{ base: 4, md: 6 }}
                                >
                                    <Box
                                        as="img"
                                        {...({
                                            src: previewPage.thumbnailUrl,
                                            alt: `Page ${previewPage.pageIndex + 1}`,
                                            style: {
                                                width: '100%',
                                                height: 'auto',
                                                maxHeight: 'calc(70vh - 64px)',
                                                objectFit: 'contain',
                                                transform: `rotate(${previewPage.rotation}deg)`,
                                                transition: 'transform 0.3s ease',
                                                display: 'block',
                                                borderRadius: '8px',
                                            },
                                        } as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
                                    />
                                </Box>
                            </MotionBox>

                            {/* Bottom hint */}
                            <Text
                                color="whiteAlpha.500"
                                fontSize="xs"
                                mt={4}
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            >
                                Click outside to close
                            </Text>
                        </MotionBox>
                    </Portal>
                )}
            </AnimatePresence>
        </>
    );
}
