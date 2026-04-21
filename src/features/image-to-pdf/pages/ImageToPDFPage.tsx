import { Box, Heading, Text, VStack, Container, Link as ChakraLink } from '@chakra-ui/react';
import { ImageDropZone, ImageFileList, ConvertButton } from '../components';
import { MotionBox } from '../../../components';
import { ImageToPDFProvider } from '../../../context/ImageToPDFContext';

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const FEATURES = [
    {
        emoji: '🖼️',
        bg: 'purple.100',
        title: 'All Formats Supported',
        description:
            'Supports JPG, PNG, WebP, GIF, BMP, HEIC (iPhone), HEIF, TIFF, AVIF, SVG and more. Convert any image to PDF instantly.',
    },
    {
        emoji: '🔀',
        bg: 'blue.100',
        title: 'Easy Reordering',
        description:
            'Drag and drop to arrange images in your preferred order before converting.',
    },
    {
        emoji: '🔒',
        bg: 'green.100',
        title: '100% Private',
        description:
            'All conversion happens in your browser. Your images are never uploaded to any server.',
    },
] as const;

const RELATED_TOOLS = [
    {
        label: 'JSON to Anything',
        description: 'Convert JSON to YAML, TOML, CSV, XML and more.',
        href: 'https://pratiksinghlad.github.io/json-to-anything/',
        emoji: '🔄',
        color: '#6366f1',
    },
] as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FeatureCard({
    emoji,
    bg,
    title,
    description,
    delay,
}: {
    emoji: string;
    bg: string;
    title: string;
    description: string;
    delay: number;
}) {
    return (
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
            transition={{ delay }}
        >
            <Box
                w={12}
                h={12}
                bg={bg}
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
            >
                <Text fontSize="2xl">{emoji}</Text>
            </Box>
            <Heading as="h3" fontSize="lg" fontWeight="600" color="gray.800" mb={2}>
                {title}
            </Heading>
            <Text fontSize="sm" color="gray.600">
                {description}
            </Text>
        </MotionBox>
    );
}

function RelatedToolCard({
    label,
    description,
    href,
    emoji,
    color,
    delay,
}: {
    label: string;
    description: string;
    href: string;
    emoji: string;
    color: string;
    delay: number;
}) {
    return (
        <ChakraLink
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            textDecoration="none"
            display="block"
            _hover={{ textDecoration: 'none' }}
        >
            <MotionBox
                display="flex"
                alignItems="flex-start"
                gap={4}
                bg="white"
                p={5}
                borderRadius="xl"
                border="1px solid"
                borderColor="gray.100"
                shadow="sm"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay }}
                _hover={{
                    borderColor: color,
                    shadow: 'md',
                }}
                style={{ transition: 'all 0.2s' }}
            >
            <Box
                w={10}
                h={10}
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xl"
                flexShrink={0}
                style={{ background: color + '20' }}
            >
                {emoji}
            </Box>
            <Box>
                <Text fontWeight="700" color="gray.800" fontSize="sm" mb={0.5}>
                    {label} ↗
                </Text>
                <Text fontSize="xs" color="gray.500">
                    {description}
                </Text>
            </Box>
        </MotionBox>
        </ChakraLink>
    );
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

function ImageToPDFPageContent() {
    return (
        <Box minH="100vh" bg="white">
            {/* Hero Section */}
            <Box bg="linear-gradient(180deg, #f3e8ff 0%, #ffffff 100%)" py={{ base: 8, md: 16 }}>
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
                                Images to PDF
                            </Heading>
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                color="gray.600"
                                mt={3}
                                maxW="600px"
                                mx="auto"
                            >
                                Convert any image — JPG, PNG, HEIC, TIFF, AVIF and more — to a
                                single PDF in seconds. Drag to reorder pages.{' '}
                                <Text as="span" color="purple.600" fontWeight="600">
                                    100% free and private
                                </Text>{' '}
                                — your files never leave your browser.
                            </Text>
                        </MotionBox>

                        {/* Drop Zone */}
                        <Box w="100%" maxW="600px">
                            <ImageDropZone />
                        </Box>
                    </VStack>
                </Container>
            </Box>

            {/* File List + Convert Button */}
            <Container maxW="800px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
                <VStack gap={{ base: 6, md: 10 }} align="stretch">
                    <ImageFileList />
                    <ConvertButton />
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
                            Why Choose Our Image to PDF Converter?
                        </Heading>

                        <Box
                            display="grid"
                            gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                            gap={6}
                            w="100%"
                        >
                            {FEATURES.map((f, i) => (
                                <FeatureCard key={f.title} {...f} delay={(i + 1) * 0.1} />
                            ))}
                        </Box>
                    </VStack>
                </Container>
            </Box>

            {/* Related Tools Section */}
            <Box py={{ base: 10, md: 16 }}>
                <Container maxW="800px" px={{ base: 4, md: 6 }}>
                    <VStack gap={6} align="stretch">
                        <Heading
                            as="h2"
                            fontSize={{ base: 'lg', md: 'xl' }}
                            fontWeight="700"
                            color="gray.800"
                            textAlign="center"
                        >
                            🔗 More Free Tools
                        </Heading>
                        <Text
                            fontSize="sm"
                            color="gray.500"
                            textAlign="center"
                            mt={-3}
                        >
                            Other privacy-first utilities built by the same author.
                        </Text>

                        <Box
                            display="grid"
                            gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
                            gap={4}
                        >
                            {RELATED_TOOLS.map((tool, i) => (
                                <RelatedToolCard key={tool.href} {...tool} delay={i * 0.1} />
                            ))}
                        </Box>
                    </VStack>
                </Container>
            </Box>
        </Box>
    );
}

// ---------------------------------------------------------------------------
// Exported page (with provider wrapper)
// ---------------------------------------------------------------------------

export function ImageToPDFPage() {
    return (
        <ImageToPDFProvider>
            <ImageToPDFPageContent />
        </ImageToPDFProvider>
    );
}
