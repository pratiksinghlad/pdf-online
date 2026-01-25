import { Box, Flex, Text, Button, IconButton, HStack, useDisclosure } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

// Navigation links
const navLinks = [
    { label: 'Merge PDF', path: '/merge' },
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
            top={2}
            mx="auto"
            maxW="1200px"
            left={0}
            right={0}
            zIndex={100}
            bg="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            border="1px solid"
            borderColor="whiteAlpha.300"
            shadow="0 8px 32px 0 rgba(31, 38, 135, 0.07)"
            mt={2}
        >
            <Flex
                px={{ base: 4, md: 8 }}
                py={3}
                align="center"
                justify="space-between"
            >
                {/* Logo */}
                <Link to="/">
                    <HStack gap={3} cursor="pointer">
                        <MotionBox
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            w={10}
                            h={10}
                            bg="linear-gradient(135deg, #ff4d4d 0%, #c53030 100%)"
                            borderRadius="12px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            shadow="0 4px 12px rgba(229, 62, 62, 0.3)"
                        >
                            <Text color="white" fontWeight="800" fontSize="xl">
                                P
                            </Text>
                        </MotionBox>
                        <Text
                            fontSize="22px"
                            fontWeight="800"
                            bgGradient="to-r"
                            gradientFrom="brand.600"
                            gradientTo="brand.800"
                            bgClip="text"
                            display={{ base: 'none', sm: 'block' }}
                            letterSpacing="-0.5px"
                        >
                            PDF online
                        </Text>
                    </HStack>
                </Link>

                {/* Desktop Navigation */}
                <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path}>
                            <Button
                                variant="ghost"
                                size="md"
                                h="48px"
                                px={6}
                                borderRadius="xl"
                                color={location.pathname === link.path ? 'brand.600' : 'gray.600'}
                                fontWeight={location.pathname === link.path ? '700' : '500'}
                                fontSize="16px"
                                _hover={{
                                    bg: 'brand.50',
                                    color: 'brand.600',
                                    transform: 'translateY(-1px)'
                                }}
                                _active={{ transform: 'translateY(0)' }}
                                transition="all 0.2s cubic-bezier(.4,0,.2,1)"
                                position="relative"
                            >
                                {link.label}
                                {location.pathname === link.path && (
                                    <MotionBox
                                        layoutId="nav-indicator"
                                        position="absolute"
                                        bottom="4px"
                                        left="6"
                                        right="6"
                                        h="3px"
                                        bg="brand.500"
                                        borderRadius="full"
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 380,
                                            damping: 30
                                        }}
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
                <Flex direction="column" py={4} px={4} gap={2}>
                    {navLinks.map((link) => (
                        <Link key={link.path} to={link.path}>
                            <Box
                                py={4}
                                px={6}
                                borderRadius="xl"
                                bg={location.pathname === link.path ? 'brand.50' : 'transparent'}
                                color={location.pathname === link.path ? 'brand.600' : 'gray.600'}
                                fontWeight={location.pathname === link.path ? '700' : '500'}
                                fontSize="16px"
                                _hover={{ bg: 'gray.50' }}
                                onClick={onToggle}
                                transition="all 0.2s"
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
