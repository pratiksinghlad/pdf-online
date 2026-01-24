import { Box, Button, Text, Flex, Progress } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { usePDF } from '../context/PDFContext';

const MotionBox = motion.create(Box);

export function MergeButton() {
    const { files, mergeProgress, mergePDFs, cancelMerge } = usePDF();

    const isDisabled = files.length < 2;
    const isMerging = mergeProgress.status === 'merging' || mergeProgress.status === 'loading';
    const isComplete = mergeProgress.status === 'complete';
    const isError = mergeProgress.status === 'error';

    const getButtonText = () => {
        if (isComplete) return '✓ Downloaded!';
        if (isError) return 'Try Again';
        if (isMerging) return 'Merging...';
        if (files.length === 0) return 'Add PDFs to Merge';
        if (files.length === 1) return 'Add Another PDF';
        return `Merge ${files.length} PDFs`;
    };

    const getButtonColor = () => {
        if (isComplete) return 'green';
        if (isError) return 'red';
        return 'red';
    };

    return (
        <Box>
            {/* Desktop Merge Button */}
            <Box display={{ base: 'none', md: 'block' }}>
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Flex direction="column" align="center" gap={3}>
                        <Button
                            size="xl"
                            onClick={isError ? mergePDFs : isMerging ? cancelMerge : mergePDFs}
                            disabled={isDisabled && !isError}
                            bg={isDisabled ? 'gray.300' : `linear-gradient(135deg, ${getButtonColor()}.500 0%, ${getButtonColor()}.600 100%)`}
                            color="white"
                            px={12}
                            py={6}
                            fontSize="lg"
                            fontWeight="600"
                            borderRadius="full"
                            shadow="lg"
                            transition="all 0.3s"
                            _hover={{
                                transform: isDisabled ? 'none' : 'translateY(-2px)',
                                shadow: isDisabled ? 'lg' : 'xl',
                            }}
                            _active={{
                                transform: 'translateY(0)',
                            }}
                            _disabled={{
                                cursor: 'not-allowed',
                                opacity: 0.6,
                            }}
                        >
                            {isMerging && (
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
                            {getButtonText()}
                        </Button>

                        {/* Progress bar */}
                        {isMerging && (
                            <Box w="100%" maxW="300px">
                                <Progress.Root value={mergeProgress.progress} size="sm" colorPalette="red">
                                    <Progress.Track>
                                        <Progress.Range />
                                    </Progress.Track>
                                </Progress.Root>
                                <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                                    {mergeProgress.message}
                                </Text>
                            </Box>
                        )}

                        {isError && (
                            <Text fontSize="sm" color="red.500" textAlign="center">
                                {mergeProgress.message}
                            </Text>
                        )}
                    </Flex>
                </MotionBox>
            </Box>

            {/* Mobile Sticky Merge Button */}
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
                    <Button
                        size="lg"
                        onClick={isError ? mergePDFs : isMerging ? cancelMerge : mergePDFs}
                        disabled={isDisabled && !isError}
                        bg={isDisabled ? 'gray.300' : `linear-gradient(135deg, ${getButtonColor()}.500 0%, ${getButtonColor()}.600 100%)`}
                        color="white"
                        w="100%"
                        py={6}
                        fontSize="md"
                        fontWeight="600"
                        borderRadius="xl"
                        _disabled={{
                            cursor: 'not-allowed',
                            opacity: 0.6,
                        }}
                    >
                        {isMerging && (
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
                        {getButtonText()}
                    </Button>

                    {/* Mobile progress */}
                    {isMerging && (
                        <Box>
                            <Progress.Root value={mergeProgress.progress} size="xs" colorPalette="red">
                                <Progress.Track>
                                    <Progress.Range />
                                </Progress.Track>
                            </Progress.Root>
                            <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                                {mergeProgress.message}
                            </Text>
                        </Box>
                    )}

                    {isError && (
                        <Text fontSize="xs" color="red.500" textAlign="center">
                            {mergeProgress.message}
                        </Text>
                    )}
                </Flex>
            </Box>

            {/* Spacer for mobile sticky button */}
            <Box display={{ base: 'block', md: 'none' }} h="100px" />
        </Box>
    );
}
