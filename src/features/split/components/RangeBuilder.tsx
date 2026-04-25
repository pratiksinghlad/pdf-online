import { useCallback } from 'react';
import { Box, Text, VStack, HStack, Button, IconButton } from '@chakra-ui/react';
import { Plus, Trash2, FileDown, Files } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSplit, type PageRange } from '../../../context/SplitContext';
import { LabeledNumberInput } from '../../../components/NumberInput';

/* eslint-disable @typescript-eslint/no-explicit-any */
const MotionBox: any = (motion as any)(Box);

const BRAND = '#e53e3e';
const BRAND_LIGHT = '#fff5f5';
const BRAND_BORDER = '#feb2b2';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateRange(range: PageRange, totalPages: number): string | null {
    if (!Number.isInteger(range.from) || range.from < 1) return 'Start page must be ≥ 1';
    if (!Number.isInteger(range.to) || range.to < range.from) return 'End must be ≥ start';
    if (range.to > totalPages) return `End must be ≤ ${totalPages}`;
    return null;
}

// ---------------------------------------------------------------------------
// Single range row
// ---------------------------------------------------------------------------

function RangeRow({
    range,
    totalPages,
    canRemove,
    onUpdate,
    onRemove,
    index,
}: {
    range: PageRange;
    totalPages: number;
    canRemove: boolean;
    onUpdate: (id: string, updates: Partial<PageRange>) => void;
    onRemove: (id: string) => void;
    index: number;
}) {
    const error = validateRange(range, totalPages);
    const isInvalid = error !== null;

    const handleFrom = useCallback(
        (val: number) => onUpdate(range.id, { from: val }),
        [range.id, onUpdate]
    );
    const handleTo = useCallback(
        (val: number) => onUpdate(range.id, { to: val }),
        [range.id, onUpdate]
    );

    return (
        <MotionBox
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 16, transition: { duration: 0.18 } }}
            transition={{ delay: index * 0.04, duration: 0.22 }}
        >
            <Box
                bg={isInvalid ? '#fff5f5' : 'white'}
                border="1.5px solid"
                borderColor={isInvalid ? BRAND_BORDER : 'rgba(0,0,0,0.08)'}
                borderRadius="12px"
                px={{ base: 3, md: 4 }}
                py={{ base: 2.5, md: 3 }}
                style={{ transition: 'border-color 0.18s, background 0.18s' }}
            >
                <HStack gap={{ base: 2, md: 3 }} align="center" flexWrap="wrap">
                    {/* Range badge */}
                    <Box px={2.5} py={0.5} borderRadius="full" bg={BRAND_LIGHT} flexShrink={0}>
                        <Text fontSize="11px" fontWeight="700" color={BRAND} letterSpacing="0.04em" userSelect="none">
                            Range {index + 1}
                        </Text>
                    </Box>

                    {/* From → To inputs */}
                    <HStack gap={{ base: 1.5, md: 2 }} align="center" flex={1}>
                        <LabeledNumberInput
                            id={`range-from-${range.id}`}
                            label="From"
                            value={range.from}
                            min={1}
                            max={totalPages}
                            isInvalid={isInvalid}
                            aria-label={`Range ${index + 1} start page`}
                            onChange={handleFrom}
                        />
                        <Box flexShrink={0} color="rgba(0,0,0,0.22)" fontSize="16px" fontWeight="300" mt="14px" lineHeight={1}>
                            →
                        </Box>
                        <LabeledNumberInput
                            id={`range-to-${range.id}`}
                            label="To"
                            value={range.to}
                            min={1}
                            max={totalPages}
                            isInvalid={isInvalid}
                            aria-label={`Range ${index + 1} end page`}
                            onChange={handleTo}
                        />
                    </HStack>

                    {/* Remove */}
                    {canRemove && (
                        <IconButton
                            aria-label={`Remove range ${index + 1}`}
                            size="sm"
                            variant="ghost"
                            borderRadius="8px"
                            color="rgba(0,0,0,0.3)"
                            _hover={{ bg: '#fff5f5', color: BRAND }}
                            style={{ transition: 'all 0.15s' }}
                            onClick={() => onRemove(range.id)}
                        >
                            <Trash2 size={15} />
                        </IconButton>
                    )}
                </HStack>

                {/* Inline error */}
                {isInvalid && (
                    <Text fontSize="11px" color={BRAND} mt={1.5} ml="100px" fontWeight="500">
                        {error}
                    </Text>
                )}
            </Box>
        </MotionBox>
    );
}

// ---------------------------------------------------------------------------
// Output mode toggle
// ---------------------------------------------------------------------------

function OutputModeToggle() {
    const { outputMode, setOutputMode } = useSplit();

    return (
        <HStack
            gap={0.5}
            bg="rgba(0,0,0,0.05)"
            borderRadius="full"
            p="3px"
            display="inline-flex"
            aria-label="Output mode"
        >
            {([
                { mode: 'separate' as const, Icon: Files, label: 'Separate files' },
                { mode: 'single' as const, Icon: FileDown, label: 'Single file' },
            ] as const).map(({ mode, Icon, label }) => {
                const active = outputMode === mode;
                return (
                    <Button
                        key={mode}
                        id={`output-mode-${mode}`}
                        size="xs"
                        borderRadius="full"
                        px={3.5}
                        h="28px"
                        bg={active ? 'white' : 'transparent'}
                        color={active ? BRAND : 'gray.500'}
                        fontWeight={active ? '700' : '500'}
                        shadow={active ? 'sm' : 'none'}
                        onClick={() => setOutputMode(mode)}
                        _hover={{ bg: active ? 'white' : 'rgba(255,255,255,0.6)' }}
                        gap={1.5}
                        aria-pressed={active}
                        style={{ transition: 'all 0.2s' }}
                        fontSize="12px"
                    >
                        <Icon size={12} />
                        {label}
                    </Button>
                );
            })}
        </HStack>
    );
}

// ---------------------------------------------------------------------------
// RangeBuilder
// ---------------------------------------------------------------------------

export function RangeBuilder() {
    const { file, ranges, addRange, updateRange, removeRange } = useSplit();
    const totalPages = file?.pageCount ?? 1;
    const allValid = ranges.every((r) => validateRange(r, totalPages) === null);

    return (
        <Box
            bg="white"
            border="1.5px solid"
            borderColor="rgba(0,0,0,0.08)"
            borderRadius="16px"
            shadow="sm"
            overflow="hidden"
        >
            {/* Header */}
            <Box
                px={{ base: 4, md: 6 }}
                pt={{ base: 4, md: 5 }}
                pb={4}
                borderBottom="1px solid"
                borderColor="rgba(0,0,0,0.06)"
            >
                <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                    <Box>
                        <Text fontWeight="700" color="gray.800" fontSize="md" lineHeight={1.3}>
                            Page Ranges
                        </Text>
                        {file && (
                            <Text fontSize="12px" color="gray.400" mt={0.5}>
                                {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'} total — define which pages to extract
                            </Text>
                        )}
                    </Box>
                    {file && <OutputModeToggle />}
                </HStack>
            </Box>

            {/* Range rows */}
            <Box px={{ base: 4, md: 6 }} py={4}>
                <VStack align="stretch" gap={2.5}>
                    <AnimatePresence initial={false}>
                        {ranges.map((range, index) => (
                            <RangeRow
                                key={range.id}
                                range={range}
                                totalPages={totalPages}
                                canRemove={ranges.length > 1}
                                onUpdate={updateRange}
                                onRemove={removeRange}
                                index={index}
                            />
                        ))}
                    </AnimatePresence>
                </VStack>

                {/* Add range */}
                <Button
                    id="add-range-btn"
                    mt={3}
                    w="full"
                    size="sm"
                    variant="ghost"
                    borderRadius="10px"
                    border="1.5px dashed"
                    borderColor={!file || !allValid ? 'rgba(0,0,0,0.1)' : BRAND_BORDER}
                    color={!file || !allValid ? 'gray.400' : BRAND}
                    bg="transparent"
                    fontWeight="600"
                    fontSize="13px"
                    gap={2}
                    disabled={!file || !allValid}
                    onClick={addRange}
                    _hover={{
                        bg: file && allValid ? BRAND_LIGHT : 'transparent',
                        borderColor: file && allValid ? BRAND : undefined,
                    }}
                    style={{ transition: 'all 0.18s' }}
                >
                    <Plus size={14} />
                    Add Range
                </Button>
            </Box>
        </Box>
    );
}
