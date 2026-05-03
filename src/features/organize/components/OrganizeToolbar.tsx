import { Box, HStack, Text, Button, Badge } from '@chakra-ui/react';
import { RotateCcw, RotateCw, Trash2, CheckSquare, XSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useOrganize } from '../context/OrganizeContext';

/* eslint-disable @typescript-eslint/no-explicit-any */
const MotionBox: any = (motion as any)(Box);

export function OrganizeToolbar() {
    const {
        pages,
        selectedCount,
        selectAll,
        deselectAll,
        rotateSelected,
        deleteSelected,
    } = useOrganize();

    if (pages.length === 0) return null;

    const hasSelection = selectedCount > 0;

    return (
        <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.100"
                borderRadius="xl"
                p={3}
                shadow="sm"
            >
                <HStack
                    justify="space-between"
                    align="center"
                    gap={3}
                    flexWrap="wrap"
                >
                    {/* Left side: Selection controls */}
                    <HStack gap={2} flexWrap="wrap">
                        <Button
                            variant="ghost"
                            size="sm"
                            borderRadius="lg"
                            fontWeight="700"
                            color="gray.600"
                            _hover={{ bg: 'gray.100' }}
                            onClick={hasSelection ? deselectAll : selectAll}
                            gap={2}
                        >
                            {hasSelection ? (
                                <>
                                    <XSquare size={16} />
                                    Deselect All
                                </>
                            ) : (
                                <>
                                    <CheckSquare size={16} />
                                    Select All
                                </>
                            )}
                        </Button>

                        {hasSelection && (
                            <Badge
                                colorPalette="red"
                                fontSize="xs"
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontWeight="700"
                            >
                                {selectedCount} selected
                            </Badge>
                        )}
                    </HStack>

                    {/* Right side: Bulk actions */}
                    {hasSelection && (
                        <HStack gap={2}>
                            <Button
                                variant="outline"
                                size="sm"
                                borderRadius="lg"
                                fontWeight="700"
                                color="gray.700"
                                borderColor="gray.200"
                                _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
                                onClick={() => rotateSelected('ccw')}
                                gap={1.5}
                            >
                                <RotateCcw size={14} />
                                <Text display={{ base: 'none', sm: 'inline' }}>Rotate Left</Text>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                borderRadius="lg"
                                fontWeight="700"
                                color="gray.700"
                                borderColor="gray.200"
                                _hover={{ bg: 'gray.50', borderColor: 'gray.300' }}
                                onClick={() => rotateSelected('cw')}
                                gap={1.5}
                            >
                                <RotateCw size={14} />
                                <Text display={{ base: 'none', sm: 'inline' }}>Rotate Right</Text>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                borderRadius="lg"
                                fontWeight="700"
                                color="red.600"
                                borderColor="red.200"
                                _hover={{ bg: 'red.50', borderColor: 'red.300' }}
                                onClick={deleteSelected}
                                gap={1.5}
                            >
                                <Trash2 size={14} />
                                <Text display={{ base: 'none', sm: 'inline' }}>Delete</Text>
                            </Button>
                        </HStack>
                    )}
                </HStack>
            </Box>
        </MotionBox>
    );
}
