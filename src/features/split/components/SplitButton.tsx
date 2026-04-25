import { Box, Button, Text, Flex, Progress } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useSplit, type PageRange } from '../../../context/SplitContext';

const MotionBox = motion.create(Box);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateRange(range: PageRange, totalPages: number): boolean {
    return (
        Number.isInteger(range.from) &&
        range.from >= 1 &&
        Number.isInteger(range.to) &&
        range.to >= range.from &&
        range.to <= totalPages
    );
}

function getButtonLabel(
    outputMode: 'separate' | 'single',
    rangeCount: number,
    isConverting: boolean,
    isComplete: boolean,
    isError: boolean,
    hasFile: boolean
): string {
    if (isComplete) return '✓ Download started!';
    if (isError) return 'Try Again';
    if (isConverting) return outputMode === 'single' ? 'Combining…' : 'Splitting…';
    if (!hasFile) return 'Upload a PDF first';
    if (outputMode === 'single') return 'Combine & Download';
    return `Split into ${rangeCount} ${rangeCount === 1 ? 'file' : 'files'}`;
}

// ---------------------------------------------------------------------------
// Shared button sub-component
// ---------------------------------------------------------------------------

function ActionButton({
    onClick,
    disabled,
    isConverting,
    label,
    colorScheme,
    size,
    fullWidth = false,
}: {
    onClick: () => void;
    disabled: boolean;
    isConverting: boolean;
    label: string;
    colorScheme: string;
    size: 'lg' | 'xl';
    fullWidth?: boolean;
}) {
    const gradient = disabled
        ? undefined
        : `linear-gradient(135deg, ${colorScheme}.500 0%, ${colorScheme}.600 100%)`;

    return (
        <Button
            size={size}
            onClick={onClick}
            disabled={disabled}
            bg={disabled ? 'gray.300' : gradient}
            color="white"
            px={fullWidth ? undefined : 12}
            py={6}
            w={fullWidth ? '100%' : undefined}
            fontSize={size === 'xl' ? 'lg' : 'md'}
            fontWeight="600"
            borderRadius={fullWidth ? 'xl' : 'full'}
            shadow="lg"
            transition="all 0.3s"
            _hover={{
                transform: disabled ? 'none' : 'translateY(-2px)',
                shadow: disabled ? 'lg' : 'xl',
            }}
            _active={{ transform: 'translateY(0)' }}
            _disabled={{ cursor: 'not-allowed', opacity: 0.6 }}
        >
            {isConverting && (
                <Box
                    as="span"
                    display="inline-block"
                    w={4}
                    h={4}
                    mr={2}
                    border="2px solid"
                    borderColor="white"
                    borderTopColor="transparent"
                    borderRadius="full"
                    animation="spin 1s linear infinite"
                />
            )}
            {label}
        </Button>
    );
}

// ---------------------------------------------------------------------------
// SplitButton
// ---------------------------------------------------------------------------

export function SplitButton() {
    const { file, ranges, outputMode, progress, splitPDF } = useSplit();

    const totalPages = file?.pageCount ?? 1;

    const allValid =
        file !== null &&
        ranges.length > 0 &&
        ranges.every((r) => validateRange(r, totalPages));

    const isConverting = progress.status === 'splitting' || progress.status === 'loading';
    const isComplete = progress.status === 'complete';
    const isError = progress.status === 'error';
    const isDisabled = !allValid || isConverting;

    const label = getButtonLabel(
        outputMode,
        ranges.length,
        isConverting,
        isComplete,
        isError,
        file !== null
    );

    const colorScheme = isComplete ? 'green' : isError ? 'red' : 'red';

    return (
        <Box>
            {/* Desktop button */}
            <Box display={{ base: 'none', md: 'block' }}>
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Flex direction="column" align="center" gap={3}>
                        <ActionButton
                            onClick={splitPDF}
                            disabled={isDisabled && !isError}
                            isConverting={isConverting}
                            label={label}
                            colorScheme={colorScheme}
                            size="xl"
                        />

                        {isConverting && (
                            <Box w="100%" maxW="300px">
                                <Progress.Root value={progress.progress} size="sm" colorPalette="red">
                                    <Progress.Track>
                                        <Progress.Range />
                                    </Progress.Track>
                                </Progress.Root>
                                <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                                    {progress.message}
                                </Text>
                            </Box>
                        )}

                        {isError && (
                            <Text fontSize="sm" color="red.500" textAlign="center">
                                {progress.message}
                            </Text>
                        )}
                    </Flex>
                </MotionBox>
            </Box>

            {/* Mobile sticky button */}
            <Box
                display={{ base: 'block', md: 'none' }}
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                p={4}
                bg="white"
                borderTop="1px solid"
                borderColor="gray.100"
                shadow="0 -4px 20px rgba(0,0,0,0.1)"
                zIndex={50}
            >
                <Flex direction="column" gap={2} maxW="500px" mx="auto">
                    <ActionButton
                        onClick={splitPDF}
                        disabled={isDisabled && !isError}
                        isConverting={isConverting}
                        label={label}
                        colorScheme={colorScheme}
                        size="lg"
                        fullWidth
                    />

                    {isConverting && (
                        <Box>
                            <Progress.Root value={progress.progress} size="xs" colorPalette="red">
                                <Progress.Track>
                                    <Progress.Range />
                                </Progress.Track>
                            </Progress.Root>
                            <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                                {progress.message}
                            </Text>
                        </Box>
                    )}

                    {isError && (
                        <Text fontSize="xs" color="red.500" textAlign="center">
                            {progress.message}
                        </Text>
                    )}
                </Flex>
            </Box>

            {/* Spacer for mobile sticky button */}
            <Box display={{ base: 'block', md: 'none' }} h="100px" />
        </Box>
    );
}
