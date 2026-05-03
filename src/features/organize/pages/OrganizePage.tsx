import { Box, Heading, Text, VStack, Container, HStack, Badge, Button, Link as ChakraLink } from '@chakra-ui/react';
import { Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrganizeDropZone, PageGrid, OrganizeToolbar } from '../components';
import { OrganizeProvider, useOrganize } from '../context/OrganizeContext';

/* eslint-disable @typescript-eslint/no-explicit-any */
const MotionBox: any = (motion as any)(Box);

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const FEATURES = [
    {
        emoji: '🔄',
        bg: 'purple.100',
        title: 'Drag & Drop Reorder',
        description:
            'Rearrange pages visually by dragging them to new positions. See your changes in real-time with live thumbnails.',
    },
    {
        emoji: '🔒',
        bg: 'green.100',
        title: '100% Private',
        description:
            'All processing happens in your browser using a Web Worker. Your PDF is never uploaded to any server.',
    },
    {
        emoji: '⚡',
        bg: 'blue.100',
        title: 'Fast & Efficient',
        description:
            'Powered by pdf-lib running in a background thread. The UI stays responsive even for large documents.',
    },
] as const;

const RELATED_TOOLS = [
    {
        label: 'Merge PDF',
        description: 'Combine multiple PDFs into one document.',
        href: '/merge',
        emoji: '🔀',
        color: '#e53e3e',
        isInternal: true,
    },
    {
        label: 'Split PDF',
        description: 'Extract page ranges into separate files.',
        href: '/split-pdf',
        emoji: '✂️',
        color: '#dd6b20',
        isInternal: true,
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
    isInternal,
    delay,
}: {
    label: string;
    description: string;
    href: string;
    emoji: string;
    color: string;
    isInternal: boolean;
    delay: number;
}) {
    const linkProps = isInternal
        ? { href }
        : { href, target: '_blank', rel: 'noopener noreferrer' };

    return (
        <ChakraLink
            {...linkProps}
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
                _hover={{ borderColor: color, shadow: 'md' }}
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
// File info card — shows loaded PDF details
// ---------------------------------------------------------------------------

function LoadedFileCard() {
    const { file, removeFile, pages } = useOrganize();
    if (!file || file.isLoading) return null;

    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            bg="#fff5f5"
            border="1px solid"
            borderColor="#feb2b2"
            borderRadius="xl"
            p={4}
        >
            <HStack justify="space-between" align="center" gap={3} flexWrap="wrap">
                <HStack gap={3} minW={0}>
                    <Box
                        w={10}
                        h={10}
                        bg="#fed7d7"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <Text fontSize="lg">📄</Text>
                    </Box>
                    <Box minW={0}>
                        <Text
                            fontWeight="700"
                            color="gray.800"
                            fontSize="sm"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                            maxW={{ base: '180px', md: '360px' }}
                        >
                            {file.name}
                        </Text>
                        <HStack gap={2} mt={0.5}>
                            <Badge colorPalette="red" fontSize="xs" borderRadius="md">
                                {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}
                            </Badge>
                            {pages.length !== file.pageCount && (
                                <Badge colorPalette="orange" fontSize="xs" borderRadius="md">
                                    {pages.length} remaining
                                </Badge>
                            )}
                            <Text fontSize="xs" color="gray.500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                        </HStack>
                    </Box>
                </HStack>

                <Box
                    as="button"
                    onClick={removeFile}
                    fontSize="xs"
                    color="gray.500"
                    fontWeight="600"
                    _hover={{ color: 'red.500' }}
                    style={{ transition: 'color 0.2s', background: 'none', border: 'none', cursor: 'pointer' }}
                    aria-label="Remove PDF"
                >
                    ✕ Remove
                </Box>
            </HStack>

            {file.error && (
                <Text fontSize="xs" color="red.500" mt={2}>
                    {file.error}
                </Text>
            )}
        </MotionBox>
    );
}

// ---------------------------------------------------------------------------
// Download button with progress
// ---------------------------------------------------------------------------

function DownloadButton() {
    const { file, pages, progress, downloadOrganized } = useOrganize();

    if (!file || pages.length === 0) return null;

    const isProcessing = progress.status === 'loading' || progress.status === 'processing';
    const isComplete = progress.status === 'complete';
    const isError = progress.status === 'error';

    return (
        <VStack gap={3} w="100%">
            <Button
                w="100%"
                h="56px"
                bg={
                    isComplete
                        ? 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)'
                        : isError
                            ? 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
                            : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
                }
                color="white"
                borderRadius="xl"
                fontSize="md"
                fontWeight="800"
                shadow="lg"
                _hover={{
                    transform: isProcessing ? 'none' : 'translateY(-2px)',
                    shadow: isProcessing ? 'lg' : 'xl',
                }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
                onClick={downloadOrganized}
                disabled={isProcessing}
                gap={2}
            >
                {isProcessing ? (
                    <>
                        <Loader2 size={20} className="animate-spin" />
                        {progress.message}
                    </>
                ) : isComplete ? (
                    <>
                        ✓ {progress.message}
                    </>
                ) : (
                    <>
                        <Download size={20} />
                        Download Organized PDF
                    </>
                )}
            </Button>

            {/* Progress bar */}
            {isProcessing && (
                <Box w="100%" h="4px" bg="gray.200" borderRadius="full" overflow="hidden">
                    <Box
                        h="100%"
                        w={`${progress.progress}%`}
                        bg="brand.500"
                        borderRadius="full"
                        transition="width 0.3s ease"
                    />
                </Box>
            )}

            {isError && (
                <Text fontSize="sm" color="red.500" fontWeight="600">
                    {progress.message}
                </Text>
            )}
        </VStack>
    );
}

// ---------------------------------------------------------------------------
// Page content
// ---------------------------------------------------------------------------

function OrganizePageContent() {
    const { file, thumbnailsLoading } = useOrganize();

    return (
        <Box minH="100vh" bg="white">
            {/* Hero Section */}
            <Box bg="linear-gradient(180deg, #fff5f5 0%, #ffffff 100%)" py={{ base: 8, md: 16 }}>
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
                                Organize & Rotate PDF
                            </Heading>
                            <Text
                                fontSize={{ base: 'md', md: 'lg' }}
                                color="gray.600"
                                mt={3}
                                maxW="600px"
                                mx="auto"
                            >
                                Reorder, rotate, and delete pages from your PDF.{' '}
                                <Text as="span" color="red.600" fontWeight="600">
                                    100% free and private
                                </Text>{' '}
                                — your file never leaves your browser.
                            </Text>
                        </MotionBox>

                        {/* Drop Zone */}
                        <Box w="100%" maxW="600px">
                            <OrganizeDropZone />
                        </Box>
                    </VStack>
                </Container>
            </Box>

            {/* Organize workspace */}
            {file && (
                <Container maxW="1200px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
                    <VStack gap={{ base: 4, md: 6 }} align="stretch">
                        <LoadedFileCard />

                        {/* Toolbar bar with file info */}
                        {file.pageCount > 0 && !file.isLoading && (
                            <Box
                                bg="gray.700"
                                color="white"
                                borderRadius="xl"
                                px={5}
                                py={3}
                                textAlign="center"
                            >
                                <Text fontWeight="700" fontSize="sm">
                                    Total Pages: {file.pageCount} │ Document: {file.name}
                                    {thumbnailsLoading && (
                                        <Text as="span" ml={3} fontSize="xs" opacity={0.7}>
                                            Loading thumbnails…
                                        </Text>
                                    )}
                                </Text>
                            </Box>
                        )}

                        <OrganizeToolbar />
                        <PageGrid />
                        <DownloadButton />
                    </VStack>
                </Container>
            )}

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
                            Why Use Our PDF Organizer?
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

            {/* Related Tools */}
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
                        <Text fontSize="sm" color="gray.500" textAlign="center" mt={-3}>
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

export function OrganizePage() {
    return (
        <OrganizeProvider>
            <OrganizePageContent />
        </OrganizeProvider>
    );
}
