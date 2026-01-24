import { Box, Container, Heading, Text, VStack, HStack, Icon, Code } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

export function HowItWorksPage() {
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
                            How It Works
                        </Heading>
                        <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
                            Understanding the technology behind PDF online
                        </Text>
                    </MotionBox>

                    {/* Architecture Overview */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Heading as="h2" fontSize="xl" fontWeight="700" color="gray.800" mb={4}>
                            Architecture Overview
                        </Heading>
                        <Box p={6} bg="gray.50" borderRadius="xl">
                            <VStack align="stretch" gap={4}>
                                <HStack gap={4} align="start">
                                    <Box
                                        w={10}
                                        h={10}
                                        bg="blue.100"
                                        borderRadius="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                    >
                                        <Icon color="blue.600" w={5} h={5}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <line x1="9" y1="3" x2="9" y2="21" />
                                            </svg>
                                        </Icon>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="600" color="gray.800">Main Thread (UI)</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Handles user interactions, file selection, drag-and-drop reordering,
                                            and displays thumbnails and progress.
                                        </Text>
                                    </Box>
                                </HStack>

                                <Box w="1px" h={6} bg="gray.300" ml={5} />

                                <HStack gap={4} align="start">
                                    <Box
                                        w={10}
                                        h={10}
                                        bg="purple.100"
                                        borderRadius="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                    >
                                        <Icon color="purple.600" w={5} h={5}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12,6 12,12 16,14" />
                                            </svg>
                                        </Icon>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="600" color="gray.800">Web Worker (Background)</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Performs heavy PDF operations (merging, page counting) without
                                            blocking the UI. Uses pdf-lib for manipulation.
                                        </Text>
                                    </Box>
                                </HStack>

                                <Box w="1px" h={6} bg="gray.300" ml={5} />

                                <HStack gap={4} align="start">
                                    <Box
                                        w={10}
                                        h={10}
                                        bg="green.100"
                                        borderRadius="lg"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                    >
                                        <Icon color="green.600" w={5} h={5}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </Icon>
                                    </Box>
                                    <Box>
                                        <Text fontWeight="600" color="gray.800">Thumbnail Generation</Text>
                                        <Text fontSize="sm" color="gray.600">
                                            Uses pdfjs-dist to render low-resolution previews (96px height)
                                            of the first page of each PDF.
                                        </Text>
                                    </Box>
                                </HStack>
                            </VStack>
                        </Box>
                    </MotionBox>

                    {/* Transferable Objects */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Heading as="h2" fontSize="xl" fontWeight="700" color="gray.800" mb={4}>
                            Memory Optimization
                        </Heading>
                        <Box p={6} bg="blue.50" borderRadius="xl" border="1px solid" borderColor="blue.200">
                            <VStack align="start" gap={3}>
                                <Text color="blue.800" fontWeight="600">
                                    Transferable Objects
                                </Text>
                                <Text fontSize="sm" color="blue.700">
                                    When sending PDF data to the Web Worker, we use transferable ArrayBuffers
                                    instead of copying. This means:
                                </Text>
                                <Box as="ul" pl={5} fontSize="sm" color="blue.700">
                                    <li>Zero-copy transfer of large files</li>
                                    <li>Reduced memory usage during merging</li>
                                    <li>Faster processing times</li>
                                </Box>
                                <Code fontSize="xs" p={3} borderRadius="md" bg="blue.100" color="blue.900" w="100%">
                                    {`worker.postMessage({ files }, { transfer: buffers })`}
                                </Code>
                            </VStack>
                        </Box>
                    </MotionBox>

                    {/* Lazy Loading */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Heading as="h2" fontSize="xl" fontWeight="700" color="gray.800" mb={4}>
                            Lazy Loading
                        </Heading>
                        <Box p={6} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.200">
                            <VStack align="start" gap={3}>
                                <Text fontSize="sm" color="purple.800">
                                    Heavy libraries are only loaded when needed:
                                </Text>
                                <Box as="ul" pl={5} fontSize="sm" color="purple.700">
                                    <li><strong>pdfjs-dist</strong> - Loaded when first PDF is added (for thumbnails)</li>
                                    <li><strong>pdf-lib</strong> - Loaded when merging starts (via Web Worker)</li>
                                </Box>
                                <Text fontSize="sm" color="purple.700">
                                    This keeps the initial bundle small and page load fast.
                                </Text>
                            </VStack>
                        </Box>
                    </MotionBox>

                    {/* Developer Guide */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Heading as="h2" fontSize="xl" fontWeight="700" color="gray.800" mb={4}>
                            Developer Guide
                        </Heading>
                        <Box p={6} bg="gray.50" borderRadius="xl">
                            <VStack align="start" gap={4}>
                                <Box>
                                    <Text fontWeight="600" color="gray.800" mb={1}>
                                        Project Structure
                                    </Text>
                                    <Code fontSize="xs" p={3} borderRadius="md" bg="gray.100" w="100%" whiteSpace="pre">
                                        {`src/
├── components/    # UI components
├── context/       # PDFContext (state management)
├── hooks/         # Custom React hooks
├── pages/         # Route pages
├── theme/         # Chakra UI theme
├── types/         # TypeScript interfaces
├── utils/         # Helper functions
└── workers/       # Web Worker (pdfWorker.ts)`}
                                    </Code>
                                </Box>

                                <Box>
                                    <Text fontWeight="600" color="gray.800" mb={1}>
                                        Key Files
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        • <Code fontSize="xs">context/PDFContext.tsx</Code> - Main state and merge logic<br />
                                        • <Code fontSize="xs">workers/pdfWorker.ts</Code> - PDF merging in background thread<br />
                                        • <Code fontSize="xs">components/FileList.tsx</Code> - Drag-and-drop sorting
                                    </Text>
                                </Box>
                            </VStack>
                        </Box>
                    </MotionBox>

                    {/* Accessibility */}
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Heading as="h2" fontSize="xl" fontWeight="700" color="gray.800" mb={4}>
                            Accessibility
                        </Heading>
                        <Box p={6} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                            <VStack align="start" gap={3}>
                                <Text fontSize="sm" color="green.800">
                                    PDF online is built with accessibility in mind:
                                </Text>
                                <Box as="ul" pl={5} fontSize="sm" color="green.700">
                                    <li>Full keyboard navigation (Tab, Arrow keys, Enter, Delete)</li>
                                    <li>ARIA labels on all interactive elements</li>
                                    <li>Focus states and indicators</li>
                                    <li>Screen reader announcements for status changes</li>
                                    <li>High contrast color scheme</li>
                                </Box>
                            </VStack>
                        </Box>
                    </MotionBox>
                </VStack>
            </Container>
        </Box>
    );
}
