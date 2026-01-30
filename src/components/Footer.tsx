import { Box, Flex, Text, Link as ChakraLink, HStack, VStack, Icon } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { GITHUB_PROFILE_ID, MY_NAME } from '../utils/constants';

export function Footer() {
    return (
        <Box
            as="footer"
            bg="gray.50"
            borderTop="1px solid"
            borderColor="gray.100"
            mt="auto"
            py={8}
        >
            <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align={{ base: 'center', md: 'center' }}
                    gap={8}
                >
                    {/* Brand & Developer */}
                    <VStack align={{ base: 'center', md: 'flex-start' }} gap={3}>
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
                                PDF online
                            </Text>
                        </HStack>

                        <HStack gap={2}>
                            <Text fontSize="sm" color="gray.500">
                                Built with ❤️ by
                            </Text>
                            <ChakraLink
                                href={`https://github.com/${GITHUB_PROFILE_ID}`}
                                target="_blank"
                                rel="noreferrer"
                                fontWeight="600"
                                color="brand.600"
                                _hover={{ color: 'brand.700', textDecoration: 'underline' }}
                            >
                                {MY_NAME}
                            </ChakraLink>
                        </HStack>
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
                            transition="all 0.2s"
                            _hover={{ transform: 'translateY(-1px)', shadow: 'sm' }}
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

                    {/* Links & Social */}
                    <VStack align={{ base: 'center', md: 'flex-end' }} gap={3}>
                        <HStack gap={6}>
                            <RouterLink to="/about">
                                <ChakraLink as="span" color="gray.600" fontSize="sm" fontWeight="500" cursor="pointer" _hover={{ color: 'brand.500' }}>
                                    About
                                </ChakraLink>
                            </RouterLink>
                            <RouterLink to="/how-it-works">
                                <ChakraLink as="span" color="gray.600" fontSize="sm" fontWeight="500" cursor="pointer" _hover={{ color: 'brand.500' }}>
                                    How It Works
                                </ChakraLink>
                            </RouterLink>
                            <ChakraLink
                                href={`https://github.com/${GITHUB_PROFILE_ID}/pdf-online`}
                                target="_blank"
                                rel="noreferrer"
                                color="gray.600"
                                _hover={{ color: 'black' }}
                                aria-label="GitHub Repository"
                            >
                                <Icon w={5} h={5}>
                                    <svg fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                </Icon>
                            </ChakraLink>
                        </HStack>
                        <Text fontSize="xs" color="gray.400">
                            © {new Date().getFullYear()} PDF online. MIT License.
                        </Text>
                    </VStack>
                </Flex>
            </Box>
        </Box>
    );
}
