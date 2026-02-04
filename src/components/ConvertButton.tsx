import { Box, Button, Text, Flex, Progress } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useImageToPDF } from '../context/ImageToPDFContext';

const MotionBox = motion.create(Box);

export function ConvertButton() {
    const { files, convertProgress, convertToPDF } = useImageToPDF();

    const isDisabled = files.length === 0;
    const isConverting = convertProgress.status === 'converting' || convertProgress.status === 'loading';
    const isComplete = convertProgress.status === 'complete';
    const isError = convertProgress.status === 'error';

    const getButtonText = () => {
        if (isComplete) return '✓ Downloaded!';
        if (isError) return 'Try Again';
        if (isConverting) return 'Converting...';
        if (files.length === 0) return 'Add Images to Convert';
        return `Convert ${files.length} ${files.length === 1 ? 'Image' : 'Images'} to PDF`;
    };

    const getButtonColor = () => {
        if (isComplete) return 'green';
        if (isError) return 'red';
        return 'purple';
    };

    return (
        <Box>
            {/* Desktop Convert Button */}
            <Box display={{ base: 'none', md: 'block' }}>
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Flex direction="column" align="center" gap={3}>
                        <Button
                            size="xl"
                            onClick={convertToPDF}
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
                            {getButtonText()}
                        </Button>

                        {/* Progress bar */}
                        {isConverting && (
                            <Box w="100%" maxW="300px">
                                <Progress.Root value={convertProgress.progress} size="sm" colorPalette="purple">
                                    <Progress.Track>
                                        <Progress.Range />
                                    </Progress.Track>
                                </Progress.Root>
                                <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                                    {convertProgress.message}
                                </Text>
                            </Box>
                        )}

                        {isError && (
                            <Text fontSize="sm" color="red.500" textAlign="center">
                                {convertProgress.message}
                            </Text>
                        )}
                    </Flex>
                </MotionBox>
            </Box>

            {/* Mobile Sticky Convert Button */}
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
                        onClick={convertToPDF}
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
                        {getButtonText()}
                    </Button>

                    {/* Mobile progress */}
                    {isConverting && (
                        <Box>
                            <Progress.Root value={convertProgress.progress} size="xs" colorPalette="purple">
                                <Progress.Track>
                                    <Progress.Range />
                                </Progress.Track>
                            </Progress.Root>
                            <Text fontSize="xs" color="gray.500" textAlign="center" mt={1}>
                                {convertProgress.message}
                            </Text>
                        </Box>
                    )}

                    {isError && (
                        <Text fontSize="xs" color="red.500" textAlign="center">
                            {convertProgress.message}
                        </Text>
                    )}
                </Flex>
            </Box>

            {/* Spacer for mobile sticky button */}
            <Box display={{ base: 'block', md: 'none' }} h="100px" />
        </Box>
    );
}
