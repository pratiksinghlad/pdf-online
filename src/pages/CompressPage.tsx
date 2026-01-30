import { Box, Heading, Text, VStack, Container, HStack, Flex, Icon } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CompressProvider, useCompress } from '../context/CompressContext';
import { CompressDropZone } from '../components/CompressDropZone';
import { CompressFileList } from '../components/CompressFileList';
import { CompressOptionsPanel } from '../components/CompressOptionsPanel';

const MotionBox = motion.create(Box);

function CompressPageContent() {
    const { files, addFiles } = useCompress();
    const hasFiles = files.length > 0;

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            addFiles(acceptedFiles);
        },
        [addFiles]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        multiple: true,
        noClick: true,
        noKeyboard: true,
    });

    return (
        <Box minH="100vh" bg="white" {...getRootProps()}>
            <input {...getInputProps()} />

            {/* Drag Overlay */}
            {isDragActive && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="rgba(59, 130, 246, 0.1)"
                    zIndex={1000}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backdropFilter="blur(4px)"
                >
                    <Box
                        bg="white"
                        p={8}
                        borderRadius="2xl"
                        shadow="2xl"
                        textAlign="center"
                        border="3px dashed"
                        borderColor="blue.400"
                    >
                        <Icon boxSize={16} color="blue.500" mb={4}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </Icon>
                        <Text fontSize="xl" fontWeight="700" color="blue.600">
                            Drop your PDF files here
                        </Text>
                    </Box>
                </Box>
            )}

            {/* Hero Section - Only show when no files */}
            {!hasFiles && (
                <Box
                    bg="linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)"
                    py={{ base: 8, md: 12 }}
                >
                    <Container maxW="900px" px={{ base: 4, md: 6 }}>
                        <VStack gap={{ base: 6, md: 8 }} textAlign="center">
                            <MotionBox
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Heading
                                    as="h1"
                                    fontSize={{ base: '2xl', md: '4xl', lg: '5xl' }}
                                    fontWeight="800"
                                    color="gray.800"
                                    lineHeight="1.2"
                                >
                                    Compress PDF
                                </Heading>
                            </MotionBox>

                            {/* Drop Zone */}
                            <Box w="100%" maxW="700px">
                                <CompressDropZone />
                            </Box>
                        </VStack>
                    </Container>
                </Box>
            )}

            {/* Working State Header - Show when files exist */}
            {hasFiles && (
                <Box
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    py={4}
                >
                    <Container maxW="1200px" px={{ base: 4, md: 6 }}>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <HStack
                                gap={2}
                                cursor="pointer"
                                w="fit-content"
                                transition="all 0.2s"
                                _hover={{
                                    '& > p': { color: 'brand.500' },
                                    '& svg': { color: 'brand.500' }
                                }}
                            >
                                <Icon color="gray.400">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </Icon>
                                <Text fontWeight="600" color="gray.800">
                                    Compress
                                </Text>
                            </HStack>
                        </Link>
                    </Container>
                </Box>
            )}

            {/* File List and Options Section */}
            {hasFiles && (
                <Container maxW="1200px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
                    <Flex
                        direction={{ base: 'column', lg: 'row' }}
                        gap={6}
                        align="flex-start"
                    >
                        {/* File List */}
                        <Box flex={1} minW={0}>
                            <CompressFileList />
                        </Box>

                        {/* Options Panel */}
                        <Box w={{ base: '100%', lg: '320px' }} flexShrink={0}>
                            <CompressOptionsPanel />
                        </Box>
                    </Flex>
                </Container>
            )}

            {/* Features Section - Only show when no files */}
            {!hasFiles && (
                <Box py={{ base: 8, md: 12 }}>
                    <Container maxW="900px" px={{ base: 4, md: 6 }}>
                        <Flex
                            direction={{ base: 'column', md: 'row' }}
                            gap={{ base: 6, md: 12 }}
                            align="flex-start"
                        >
                            {/* Left Column - Description */}
                            <Box flex={1}>
                                <Text fontSize="md" color="gray.600" lineHeight="1.8">
                                    Compress PDFs online for quick sharing, fast uploads, and optimal storage—quality
                                    intact. The compressor is free to use and works directly in your browser.
                                </Text>
                            </Box>

                            {/* Right Column - Features */}
                            <VStack align="start" gap={4} flex={1}>
                                <HStack gap={3}>
                                    <Box
                                        w={6}
                                        h={6}
                                        bg="green.500"
                                        borderRadius="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon color="white" boxSize={4}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </Icon>
                                    </Box>
                                    <Text fontSize="sm" color="gray.700" fontWeight="500">
                                        PDF size reduction up to 99%
                                    </Text>
                                </HStack>

                                <HStack gap={3}>
                                    <Box
                                        w={6}
                                        h={6}
                                        bg="green.500"
                                        borderRadius="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon color="white" boxSize={4}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </Icon>
                                    </Box>
                                    <Text fontSize="sm" color="gray.700" fontWeight="500">
                                        GDPR and ISO/IEC 27001 compliant
                                    </Text>
                                </HStack>

                                <HStack gap={3}>
                                    <Box
                                        w={6}
                                        h={6}
                                        bg="green.500"
                                        borderRadius="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Icon color="white" boxSize={4}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </Icon>
                                    </Box>
                                    <Text fontSize="sm" color="gray.700" fontWeight="500">
                                        Fully browser-based PDF compression
                                    </Text>
                                </HStack>
                            </VStack>
                        </Flex>
                    </Container>
                </Box>
            )}

            {/* Why Choose Section */}
            {!hasFiles && (
                <Box bg="gray.50" py={{ base: 10, md: 16 }} mt={6}>
                    <Container maxW="1000px" px={{ base: 4, md: 6 }}>
                        <VStack gap={8}>
                            <Heading
                                as="h2"
                                fontSize={{ base: 'xl', md: '2xl' }}
                                fontWeight="700"
                                color="gray.800"
                                textAlign="center"
                            >
                                Why Compress with PDF Online?
                            </Heading>

                            <Box
                                display="grid"
                                gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                                gap={6}
                                w="100%"
                            >
                                {/* Privacy */}
                                <MotionBox
                                    bg="white"
                                    p={6}
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    shadow="sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Box
                                        w={12}
                                        h={12}
                                        bg="green.100"
                                        borderRadius="xl"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mb={4}
                                    >
                                        <Text fontSize="2xl">🔒</Text>
                                    </Box>
                                    <Heading as="h3" fontSize="lg" fontWeight="600" color="gray.800" mb={2}>
                                        100% Private
                                    </Heading>
                                    <Text fontSize="sm" color="gray.600">
                                        All compression happens in your browser. Your files are never uploaded to any server.
                                    </Text>
                                </MotionBox>

                                {/* Quality */}
                                <MotionBox
                                    bg="white"
                                    p={6}
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    shadow="sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Box
                                        w={12}
                                        h={12}
                                        bg="blue.100"
                                        borderRadius="xl"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mb={4}
                                    >
                                        <Text fontSize="2xl">✨</Text>
                                    </Box>
                                    <Heading as="h3" fontSize="lg" fontWeight="600" color="gray.800" mb={2}>
                                        Quality Preserved
                                    </Heading>
                                    <Text fontSize="sm" color="gray.600">
                                        Smart compression maintains document quality while significantly reducing file size.
                                    </Text>
                                </MotionBox>

                                {/* Easy */}
                                <MotionBox
                                    bg="white"
                                    p={6}
                                    borderRadius="xl"
                                    border="1px solid"
                                    borderColor="gray.100"
                                    shadow="sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Box
                                        w={12}
                                        h={12}
                                        bg="purple.100"
                                        borderRadius="xl"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        mb={4}
                                    >
                                        <Text fontSize="2xl">⚡</Text>
                                    </Box>
                                    <Heading as="h3" fontSize="lg" fontWeight="600" color="gray.800" mb={2}>
                                        Lightning Fast
                                    </Heading>
                                    <Text fontSize="sm" color="gray.600">
                                        Compress multiple PDFs instantly. No waiting for uploads or downloads.
                                    </Text>
                                </MotionBox>
                            </Box>
                        </VStack>
                    </Container>
                </Box>
            )}
        </Box>
    );
}

export function CompressPage() {
    return (
        <CompressProvider>
            <CompressPageContent />
        </CompressProvider>
    );
}
