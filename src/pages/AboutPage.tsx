import { Box, Container, Heading, Text, VStack, HStack, Icon, Link } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

export function AboutPage() {
    return (
        <Box minH="100vh" bg="white" py={{ base: 8, md: 16 }}>
            <Container maxW="800px" px={{ base: 4, md: 6 }}>
                <VStack gap={10} align="stretch">
                    {/* Header */}
                    <MotionBox
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        textAlign="center"
                    >
                        <Heading
                            as="h1"
                            fontSize={{ base: '2xl', md: '4xl' }}
                            fontWeight="800"
                            color="gray.800"
                            mb={4}
                        >
                            About PDF Merge Pro
                        </Heading>
                        <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
                            A free, open-source tool for merging PDFs with complete privacy.
                        </Text>
                    </MotionBox>

                    {/* Privacy Section */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        bg="green.50"
                        p={6}
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="green.200"
                    >
                        <HStack gap={3} mb={4}>
                            <Icon color="green.500" w={6} h={6}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </Icon>
                            <Heading as="h2" fontSize="xl" fontWeight="700" color="green.800">
                                Privacy Statement
                            </Heading>
                        </HStack>
                        <VStack align="start" gap={3}>
                            <Text color="green.700">
                                <strong>Your files never leave your browser.</strong> PDF Merge Pro processes all
                                files entirely on your device using modern web technologies.
                            </Text>
                            <Text color="green.700" fontSize="sm">
                                • No file uploads to any server<br />
                                • No tracking or analytics<br />
                                • No data collection whatsoever<br />
                                • Works offline after initial load
                            </Text>
                        </VStack>
                    </MotionBox>

                    {/* How It Works */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Heading as="h2" fontSize="xl" fontWeight="700" color="gray.800" mb={4}>
                            How It Works
                        </Heading>
                        <VStack align="stretch" gap={4}>
                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <HStack gap={3}>
                                    <Box
                                        w={8}
                                        h={8}
                                        bg="brand.500"
                                        color="white"
                                        borderRadius="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontWeight="bold"
                                        fontSize="sm"
                                    >
                                        1
                                    </Box>
                                    <Box>
                                        <Text fontWeight="600" color="gray.800">
                                            Select Your PDFs
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Drag and drop, paste from clipboard, or use the file picker
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>

                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <HStack gap={3}>
                                    <Box
                                        w={8}
                                        h={8}
                                        bg="brand.500"
                                        color="white"
                                        borderRadius="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontWeight="bold"
                                        fontSize="sm"
                                    >
                                        2
                                    </Box>
                                    <Box>
                                        <Text fontWeight="600" color="gray.800">
                                            Arrange the Order
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Drag files to reorder, or use keyboard shortcuts (↑↓, Home, End)
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>

                            <Box p={4} bg="gray.50" borderRadius="lg">
                                <HStack gap={3}>
                                    <Box
                                        w={8}
                                        h={8}
                                        bg="brand.500"
                                        color="white"
                                        borderRadius="full"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        fontWeight="bold"
                                        fontSize="sm"
                                    >
                                        3
                                    </Box>
                                    <Box>
                                        <Text fontWeight="600" color="gray.800">
                                            Merge & Download
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Click merge and your combined PDF downloads automatically
                                        </Text>
                                    </Box>
                                </HStack>
                            </Box>
                        </VStack>
                    </MotionBox>

                    {/* Tech Stack */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Heading as="h2" fontSize="xl" fontWeight="700" color="gray.800" mb={4}>
                            Technology
                        </Heading>
                        <Box p={4} bg="gray.50" borderRadius="lg">
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                    Built with modern web technologies for maximum performance and reliability:
                                </Text>
                                <Text fontSize="sm" color="gray.700">
                                    • <strong>React + TypeScript</strong> - Type-safe UI components<br />
                                    • <strong>Vite</strong> - Fast build and development<br />
                                    • <strong>pdf-lib</strong> - PDF manipulation (MIT License)<br />
                                    • <strong>pdfjs-dist</strong> - PDF rendering for thumbnails (Apache 2.0)<br />
                                    • <strong>Web Workers</strong> - Background processing for smooth UI<br />
                                    • <strong>Chakra UI</strong> - Accessible component library
                                </Text>
                            </VStack>
                        </Box>
                    </MotionBox>

                    {/* Limitations */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Heading as="h2" fontSize="xl" fontWeight="700" color="gray.800" mb={4}>
                            Known Limitations
                        </Heading>
                        <Box p={4} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" color="orange.800">
                                    • <strong>Large files:</strong> Files over 50MB may be slow to process<br />
                                    • <strong>Encrypted PDFs:</strong> Password-protected PDFs cannot be merged<br />
                                    • <strong>Memory:</strong> Very large merges (100+ pages) may require more memory<br />
                                    • <strong>Browser support:</strong> Modern browsers (Chrome, Firefox, Safari, Edge) recommended
                                </Text>
                            </VStack>
                        </Box>
                    </MotionBox>

                    {/* Open Source */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        textAlign="center"
                        py={8}
                    >
                        <Text fontSize="sm" color="gray.500">
                            PDF Merge Pro is open source software released under the MIT License.
                            <br />
                            <Link color="brand.500" href="https://github.com" target="_blank" rel="noopener">
                                View on GitHub →
                            </Link>
                        </Text>
                    </MotionBox>
                </VStack>
            </Container>
        </Box>
    );
}
