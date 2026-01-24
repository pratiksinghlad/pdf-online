import { Box, VStack, Text, Flex, Button } from '@chakra-ui/react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'framer-motion';
import { usePDF } from '../context/PDFContext';
import { FileCard } from './FileCard';

export function FileList() {
    const { files, reorderFiles, clearFiles } = usePDF();

    // Sensors for drag and drop (mouse, touch, keyboard)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = files.findIndex((f) => f.id === active.id);
            const newIndex = files.findIndex((f) => f.id === over.id);

            const newFiles = [...files];
            const [movedFile] = newFiles.splice(oldIndex, 1);
            newFiles.splice(newIndex, 0, movedFile);

            reorderFiles(newFiles);
        }
    };

    if (files.length === 0) {
        return null;
    }

    const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);

    return (
        <Box>
            {/* Header */}
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
                        Selected Files
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        {files.length} {files.length === 1 ? 'file' : 'files'} • {totalPages}{' '}
                        {totalPages === 1 ? 'page' : 'pages'} total
                    </Text>
                </VStack>

                <Button
                    variant="ghost"
                    size="sm"
                    color="red.500"
                    onClick={clearFiles}
                    _hover={{ bg: 'red.50' }}
                >
                    Clear All
                </Button>
            </Flex>

            {/* File List */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={files.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    <VStack gap={3} align="stretch" role="list" aria-label="PDF files to merge">
                        <AnimatePresence mode="popLayout">
                            {files.map((file, index) => (
                                <FileCard key={file.id} file={file} index={index} />
                            ))}
                        </AnimatePresence>
                    </VStack>
                </SortableContext>
            </DndContext>

            {/* Reorder hint */}
            <Text fontSize="xs" color="gray.400" textAlign="center" mt={4}>
                💡 Drag files or use ↑↓ arrow keys to reorder • Home/End to move to top/bottom
            </Text>
        </Box>
    );
}
