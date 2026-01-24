import { Box, Flex, Text, Button, IconButton, HStack, useDisclosure } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

// Navigation links
const navLinks = [
    { label: 'Merge PDF', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'How It Works', path: '/how-it-works' },
];

export function Navbar() {
    const location = useLocation();
    const { open: isOpen, onToggle } = useDisclosure();

    return (
        <Box
            as="nav"
            position="sticky"
            top={0}
            zIndex={100}
            bg="white"
            borderBottom="1px solid"
            borderColor="gray.100"
            shadow="sm"
        >
            <Flex
                maxW="1200px"
                mx="auto"
                px={{ base: 4, md: 6 }}
                py={3}
                align="center"
                justify="space-between"
            >
                {/* Logo */}
                <Link to="/">
                    <HStack gap={2} cursor="pointer">
                        <Box
                            w={8}
                            h={8}
                            bg="linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
                            borderRadius="lg"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text color="white" fontWeight="bold" fontSize="lg">
                                P
                            </Text>
                        </Box>
                        <Text
                            fontSize="xl"
                            fontWeight="bold"
                            bgGradient="to-r"
                            gradientFrom="brand.500"
                            gradientTo="brand.700"
                            bgClip="text"
                            display={{ base: 'none', sm: 'block' }}
                        >
                            PDF online
                        </Text>
                    </HStack>
                </Link>

                {/* Desktop Navigation */}
                <HStack gap={1} display={{ base: 'none', md: 'flex' }}>
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path}>
                            <Button
                                variant="ghost"
                                size="sm"
                                color={location.pathname === link.path ? 'brand.500' : 'gray.600'}
                                fontWeight={location.pathname === link.path ? '600' : '500'}
                                _hover={{ bg: 'gray.50', color: 'brand.500' }}
                                position="relative"
                            >
                                {link.label}
                                {location.pathname === link.path && (
                                    <MotionBox
                                        layoutId="nav-indicator"
                                        position="absolute"
                                        bottom={0}
                                        left={2}
                                        right={2}
                                        h="2px"
                                        bg="brand.500"
                                        borderRadius="full"
                                    />
                                )}
                            </Button>
                        </Link>
                    ))}
                </HStack>

                {/* Mobile Menu Button */}
                <IconButton
                    display={{ base: 'flex', md: 'none' }}
                    onClick={onToggle}
                    variant="ghost"
                    aria-label="Toggle navigation"
                    size="sm"
                >
                    <Box w={5} h={5} position="relative">
                        <Box
                            as="span"
                            position="absolute"
                            w="100%"
                            h="2px"
                            bg="gray.600"
                            borderRadius="full"
                            top={isOpen ? '50%' : '25%'}
                            transform={isOpen ? 'translateY(-50%) rotate(45deg)' : 'none'}
                            transition="all 0.2s"
                        />
                        <Box
                            as="span"
                            position="absolute"
                            w="100%"
                            h="2px"
                            bg="gray.600"
                            borderRadius="full"
                            top="50%"
                            transform="translateY(-50%)"
                            opacity={isOpen ? 0 : 1}
                            transition="all 0.2s"
                        />
                        <Box
                            as="span"
                            position="absolute"
                            w="100%"
                            h="2px"
                            bg="gray.600"
                            borderRadius="full"
                            top={isOpen ? '50%' : '75%'}
                            transform={isOpen ? 'translateY(-50%) rotate(-45deg)' : 'none'}
                            transition="all 0.2s"
                        />
                    </Box>
                </IconButton>
            </Flex>

            {/* Mobile Navigation */}
            <MotionBox
                initial={false}
                animate={{
                    height: isOpen ? 'auto' : 0,
                    opacity: isOpen ? 1 : 0,
                }}
                overflow="hidden"
                display={{ base: 'block', md: 'none' }}
                bg="white"
                borderTop={isOpen ? '1px solid' : 'none'}
                borderColor="gray.100"
            >
                <Flex direction="column" py={2} px={4}>
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path}>
                            <Box
                                py={3}
                                px={4}
                                borderRadius="md"
                                bg={location.pathname === link.path ? 'brand.50' : 'transparent'}
                                color={location.pathname === link.path ? 'brand.600' : 'gray.600'}
                                fontWeight={location.pathname === link.path ? '600' : '500'}
                                _hover={{ bg: 'gray.50' }}
                                onClick={onToggle}
                            >
                                {link.label}
                            </Box>
                        </Link>
                    ))}
                </Flex>
            </MotionBox>
        </Box>
    );
}
