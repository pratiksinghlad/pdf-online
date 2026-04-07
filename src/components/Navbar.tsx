import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  IconButton, 
  HStack, 
  VStack,
  useDisclosure, 
  Container,
  Portal,
  Center
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { 
  Menu as MenuIcon, 
  X, 
  ChevronDown, 
  Layers, 
  Minimize2, 
  Image as ImageIcon, 
  Lock, 
  Unlock, 
  Info, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Grid
} from 'lucide-react';
import React from 'react';

import { MotionBox } from './ui/MotionBox';

// Primary Tools - Visible directly on desktop
const mainTools = [
  { 
    label: 'Merge PDF', 
    path: '/merge', 
    icon: Layers,
    color: '#e53e3e' 
  },
  { 
    label: 'Image to PDF', 
    path: '/image-to-pdf', 
    icon: ImageIcon,
    color: '#38a169' 
  },
  { 
    label: 'Compress PDF', 
    path: '/compress', 
    icon: Minimize2,
    color: '#3182ce' 
  },
];

// Secondary Tools - Grouped under "More Tools" dropdown
const otherTools = [
  { 
    label: 'Protect PDF', 
    description: 'Secure files with strong encryption',
    path: '/encrypt', 
    icon: Lock,
    color: '#d69e2e' 
  },
  { 
    label: 'Unlock PDF', 
    description: 'Remove password and restrictions',
    path: '/unlock-pdf', 
    icon: Unlock,
    color: '#ed64a6' 
  },
];

// Static page links
const resourcesLinks = [
  { label: 'About', path: '/about', icon: Info },
  { label: 'How It Works', path: '/how-it-works', icon: HelpCircle },
];

export function Navbar() {
  const location = useLocation();
  const { open: isMobileOpen, onToggle: toggleMobile } = useDisclosure();
  const { open: isMoreOpen, onOpen: onMoreOpen, onClose: onMoreClose } = useDisclosure();
  
  const [isSticky, setIsSticky] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      transition="all 0.3s ease"
      py={isSticky ? 2 : 4}
      bg={isSticky ? "rgba(255, 255, 255, 0.85)" : "transparent"}
      backdropFilter={isSticky ? "blur(12px) saturate(180%)" : "none"}
      borderBottom="1px solid"
      borderColor={isSticky ? "rgba(230, 230, 230, 0.4)" : "transparent"}
      shadow={isSticky ? "sm" : "none"}
    >
      <Container maxW="1440px" px={{ base: 4, md: 8 }}>
        <Flex align="center" justify="space-between" h="60px">
          {/* Logo Section */}
          <Link to="/">
            <HStack gap={3} cursor="pointer" userSelect="none">
              <MotionBox
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                w="42px"
                h="42px"
                bg="linear-gradient(135deg, #FF4B4B 0%, #D82B2B 100%)"
                borderRadius="14px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="0 6px 15px rgba(216, 43, 43, 0.3)"
              >
                <Text color="white" fontWeight="900" fontSize="22px">P</Text>
              </MotionBox>
              <VStack align="start" gap={0} display={{ base: 'none', sm: 'flex' }}>
                <Text fontSize="20px" fontWeight="900" color="gray.800" lineHeight="1" letterSpacing="-0.8px">PDF</Text>
                <Text fontSize="14px" fontWeight="700" color="brand.500" lineHeight="1" letterSpacing="0.8px" textTransform="uppercase">online</Text>
              </VStack>
            </HStack>
          </Link>

          {/* Desktop Navigation */}
          <HStack gap={1} display={{ base: 'none', lg: 'flex' }}>
            {/* Main Tools (Direct Access) */}
            {mainTools.map((tool) => (
              <Link key={tool.path} to={tool.path}>
                <Button
                  variant="ghost"
                  h="44px"
                  px={5}
                  borderRadius="xl"
                  color={isActive(tool.path) ? 'brand.600' : 'gray.800'}
                  bg={isActive(tool.path) ? 'brand.50' : 'transparent'}
                  fontWeight={isActive(tool.path) ? '800' : '700'}
                  fontSize="15px"
                  _hover={{ bg: 'brand.50', color: 'brand.600', transform: 'translateY(-1px)' }}
                  _active={{ transform: 'translateY(0)' }}
                  gap={2.5}
                >
                  {/* Colorful Icon */}
                  <tool.icon size={20} color={tool.color} />
                  {tool.label}
                </Button>
              </Link>
            ))}

            {/* "More Tools" Dropdown */}
            <Box position="relative" onMouseEnter={onMoreOpen} onMouseLeave={onMoreClose} h="60px" display="flex" alignItems="center" px={1}>
              <Button
                variant="ghost"
                h="44px"
                px={5}
                color="gray.800"
                fontWeight="800"
                fontSize="15px"
                borderRadius="xl"
                bg={isMoreOpen ? 'gray.100' : 'transparent'}
                _hover={{ bg: 'gray.100', color: 'gray.900' }}
                gap={2.5}
              >
                <Grid size={20} color="#718096" />
                More Tools
                <Box as="span" transition="transform 0.2s" transform={isMoreOpen ? 'rotate(180deg)' : 'none'}>
                  <ChevronDown size={16} />
                </Box>
              </Button>

              <AnimatePresence>
                {isMoreOpen && (
                  <Portal>
                    <MotionBox
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      position="fixed"
                      top="70px"
                      left="50%"
                      marginLeft="-200px" 
                      zIndex={1100}
                      bg="white"
                      w="400px"
                      p={3}
                      borderRadius="24px"
                      shadow="2xl"
                      onMouseEnter={onMoreOpen}
                      onMouseLeave={onMoreClose}
                      border="1px solid"
                      borderColor="gray.100"
                    >
                      <VStack align="stretch" gap={1}>
                        <Text px={4} py={2} fontWeight="800" color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="1px">Additional PDF Features</Text>
                        {otherTools.map((tool) => (
                          <Link key={tool.path} to={tool.path} onClick={onMoreClose}>
                            <HStack
                              p={4}
                              borderRadius="18px"
                              _hover={{ bg: 'gray.50', transform: 'translateX(4px)' }}
                              transition="all 0.2s"
                              cursor="pointer"
                            >
                              <Center w="44px" h="44px" bg={`${tool.color}10`} color={tool.color} borderRadius="14px">
                                <tool.icon size={22} />
                              </Center>
                              <VStack align="start" gap={0}>
                                <Text fontWeight="800" color="gray.800" fontSize="15px">{tool.label}</Text>
                                <Text fontSize="12px" color="gray.500" fontWeight="500">{tool.description}</Text>
                              </VStack>
                            </HStack>
                          </Link>
                        ))}
                        <Box p={4} borderRadius="18px" bg="brand.50" border="1px dashed" borderColor="brand.200">
                          <HStack gap={3}>
                            <Sparkles size={18} color="#e53e3e" />
                            <Text fontSize="13px" fontWeight="700" color="brand.700">More tools joining soon!</Text>
                          </HStack>
                        </Box>
                      </VStack>
                    </MotionBox>
                  </Portal>
                )}
              </AnimatePresence>
            </Box>

            {/* Separator */}
            <Box w="1px" h="24px" bg="gray.200" mx={2} />

            {/* Resources Links */}
            {resourcesLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant="ghost"
                  h="44px"
                  px={5}
                  borderRadius="xl"
                  color={isActive(link.path) ? 'gray.900' : 'gray.800'}
                  fontWeight={isActive(link.path) ? '800' : '700'}
                  fontSize="15px"
                  _hover={{ bg: 'gray.50', color: 'gray.900' }}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </HStack>

          {/* Action Buttons */}
          <HStack gap={3}>
            <Box
              as="a"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...({ href: "https://github.com/pratiksinghlad/pdf-online", target: "_blank" } as any)}
              display={{ base: 'none', md: 'flex' }}
              alignItems="center"
              justifyContent="center"
              h="44px"
              px={6}
              borderRadius="xl"
              bg="gray.900"
              color="white"
              fontWeight="700"
              fontSize="14px"
              transition="all 0.2s"
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg', textDecoration: 'none' }}
              textDecoration="none"
              gap={2}
            >
              <ExternalLink size={16} />
              GitHub
            </Box>
            
            {/* Mobile Toggle */}
            <IconButton
              display={{ base: 'flex', lg: 'none' }}
              onClick={toggleMobile}
              variant="ghost"
              aria-label="Toggle menu"
              size="lg"
              borderRadius="xl"
              _hover={{ bg: 'brand.50', color: 'brand.600' }}
            >
              {isMobileOpen ? <X size={26} /> : <MenuIcon size={26} />}
            </IconButton>
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="rgba(0,0,0,0.4)"
              backdropFilter="blur(5px)"
              zIndex={1400}
              onClick={toggleMobile}
            />
            <MotionBox
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              position="fixed"
              top={0}
              right={0}
              bottom={0}
              w={{ base: '100%', sm: '380px' }}
              bg="white"
              zIndex={1500}
              shadow="2xl"
              p={6}
              overflowY="auto"
            >
              <VStack align="stretch" gap={8}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="24px" fontWeight="900" color="gray.800">Menu</Text>
                  <IconButton variant="ghost" onClick={toggleMobile} aria-label="Close menu" borderRadius="full">
                    <X size={26} />
                  </IconButton>
                </Flex>

                <Box>
                  <Text px={2} pb={4} fontWeight="800" color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="1px">Main Tools</Text>
                  <VStack align="stretch" gap={2}>
                    {[...mainTools, ...otherTools].map((tool) => (
                      <Link key={tool.path} to={tool.path} onClick={toggleMobile} style={{ textDecoration: 'none' }}>
                        <HStack p={4} borderRadius="20px" bg={isActive(tool.path) ? 'brand.50' : 'transparent'} _hover={{ bg: 'gray.50' }}>
                          <Center w="44px" h="44px" bg={`${tool.color}10`} color={tool.color} borderRadius="14px">
                            <tool.icon size={22} />
                          </Center>
                          <Text fontWeight="800" color="gray.800" fontSize="16px" flex={1}>{tool.label}</Text>
                          <ChevronRight size={18} color="#CBD5E0" />
                        </HStack>
                      </Link>
                    ))}
                  </VStack>
                </Box>

                <Box borderTop="1px solid" borderColor="gray.100" pt={6}>
                  <Text px={2} pb={4} fontWeight="800" color="gray.400" fontSize="xs" textTransform="uppercase" letterSpacing="1px">Resources</Text>
                  <VStack align="stretch" gap={2}>
                    {resourcesLinks.map((link) => (
                      <Link key={link.path} to={link.path} onClick={toggleMobile} style={{ textDecoration: 'none' }}>
                        <HStack p={4} borderRadius="20px" _hover={{ bg: 'gray.50' }}>
                          <Center w="40px" h="40px" bg="gray.100" color="gray.600" borderRadius="12px">
                            <link.icon size={20} />
                          </Center>
                          <Text fontWeight="700" color="gray.700" fontSize="16px">{link.label}</Text>
                        </HStack>
                      </Link>
                    ))}
                  </VStack>
                </Box>
                
                <Box
                  as="a"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  {...({ href: "https://github.com/pratiksinghlad/pdf-online", target: "_blank", textDecoration: "none" } as any)}
                  mt="auto"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="gray.900"
                  color="white"
                  borderRadius="20px"
                  h="60px"
                  fontWeight="800"
                  fontSize="lg"
                  transition="all 0.2s"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                >
                    <HStack gap={2}><ExternalLink size={20} /><Text>Star on GitHub</Text></HStack>
                </Box>
              </VStack>
            </MotionBox>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
}
