import { Box, Heading, Text, VStack, Container } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { DropZone, FileList, MergeButton } from '../components';

const MotionBox = motion.create(Box);

export function HomePage() {
    return (
        <Box minH="100vh" bg="white">
            {/* Hero Section */}
            <Box
                bg="linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)"
                py={{ base: 8, md: 16 }}
            >
                <Container maxW="800px" px={{ base: 4, md: 6 }}>
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
                                Merge PDF Files
                            </Heading>
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                color="gray.600"
                                mt={3}
                                maxW="600px"
                                mx="auto"
                            >
                                Combine PDFs in the order you want with the easiest PDF merger available.
                                <Text as="span" color="green.600" fontWeight="600">
                                    {' '}100% free and private
                                </Text>
                                — your files never leave your browser.
                            </Text>
                        </MotionBox>

                        {/* Drop Zone */}
                        <Box w="100%" maxW="600px">
                            <DropZone />
                        </Box>
                    </VStack>
                </Container>
            </Box>

            {/* File List Section */}
            <Container maxW="800px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
                <VStack gap={{ base: 6, md: 10 }} align="stretch">
                    <FileList />
                    <MergeButton />
                </VStack>
            </Container>

            {/* Features Section */}
            <Box bg="gray.50" py={{ base: 10, md: 16 }} mt={10}>
                <Container maxW="1000px" px={{ base: 4, md: 6 }}>
                    <VStack gap={8}>
                        <Heading
                            as="h2"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="700"
                            color="gray.800"
                            textAlign="center"
                        >
                            Why Choose PDF Merge Pro?
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
                                    All processing happens in your browser. Your files are never uploaded to any server.
                                </Text>
                            </MotionBox>

                            {/* Fast */}
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
                                    <Text fontSize="2xl">⚡</Text>
                                </Box>
                                <Heading as="h3" fontSize="lg" fontWeight="600" color="gray.800" mb={2}>
                                    Lightning Fast
                                </Heading>
                                <Text fontSize="sm" color="gray.600">
                                    Uses Web Workers for background processing. No upload waiting time.
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
                                    <Text fontSize="2xl">✨</Text>
                                </Box>
                                <Heading as="h3" fontSize="lg" fontWeight="600" color="gray.800" mb={2}>
                                    Simple to Use
                                </Heading>
                                <Text fontSize="sm" color="gray.600">
                                    Drag, drop, reorder, and merge. Works on desktop and mobile devices.
                                </Text>
                            </MotionBox>
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </Box>
    );
}
