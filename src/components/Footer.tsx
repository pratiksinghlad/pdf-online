import { Box, Flex, Text, Link, HStack, VStack, Icon } from '@chakra-ui/react';

export function Footer() {
    return (
        <Box
            as="footer"
            bg="gray.50"
            borderTop="1px solid"
            borderColor="gray.100"
            mt="auto"
        >
            <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align={{ base: 'center', md: 'flex-start' }}
                    gap={6}
                >
                    {/* Brand */}
                    <VStack align={{ base: 'center', md: 'flex-start' }} gap={2}>
                        <HStack gap={2}>
                            <Box
                                w={6}
                                h={6}
                                bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                                borderRadius="md"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Text color="white" fontWeight="bold" fontSize="sm">
                                    P
                                </Text>
                            </Box>
                            <Text fontWeight="bold" color="gray.700">
                                PDF Merge Pro
                            </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.500" textAlign={{ base: 'center', md: 'left' }}>
                            Free, fast, and private PDF merging
                        </Text>
                    </VStack>

                    {/* Privacy Badge */}
                    <VStack align="center" gap={2}>
                        <HStack
                            bg="green.50"
                            border="1px solid"
                            borderColor="green.200"
                            px={4}
                            py={2}
                            borderRadius="full"
                            gap={2}
                        >
                            <Icon color="green.500" w={5} h={5}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </Icon>
                            <Text fontSize="sm" fontWeight="600" color="green.700">
                                100% Client-Side Processing
                            </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                            Your files never leave your browser
                        </Text>
                    </VStack>

                    {/* Links */}
                    <VStack align={{ base: 'center', md: 'flex-end' }} gap={2}>
                        <HStack gap={4}>
                            <Link href="/about" color="gray.600" fontSize="sm" _hover={{ color: 'brand.500' }}>
                                About
                            </Link>
                            <Link href="/how-it-works" color="gray.600" fontSize="sm" _hover={{ color: 'brand.500' }}>
                                How It Works
                            </Link>
                        </HStack>
                        <Text fontSize="xs" color="gray.400">
                            © {new Date().getFullYear()} PDF Merge Pro. MIT License.
                        </Text>
                    </VStack>
                </Flex>
            </Box>
        </Box>
    );
}
