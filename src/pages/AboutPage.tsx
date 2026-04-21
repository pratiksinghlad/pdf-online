import {
  Box,
  Container,
  Heading,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { GITHUB_PROFILE_ID } from "../utils/constants";
import { openExternalLink } from "../utils";

const MotionBox = motion.create(Box);

const tools = [
  {
    title: "Merge PDF",
    description:
      "Combine PDFs, images, and text files into one PDF with drag-and-drop reordering.",
  },
  {
    title: "Compress PDF",
    description:
      "Reduce file size locally in the browser with smart fallback processing.",
  },
  {
    title: "Image to PDF",
    description:
      "Turn JPG, PNG, GIF, WebP, and BMP images into a single PDF document.",
  },
  {
    title: "Protect PDF",
    description:
      "Add password protection to PDFs with client-side encryption.",
  },
  {
    title: "Unlock PDF",
    description:
      "Remove password protection when you know the correct password.",
  },
];

const highlights = [
  "All processing happens on your device",
  "No file uploads, analytics, or account required",
  "Browser and desktop support",
  "Responsive interface for desktop and mobile",
  "Worker-based processing to keep the UI responsive",
];

const technologies = [
  "React + TypeScript",
  "Vite",
  "Chakra UI",
  "Framer Motion",
  "pdf-lib",
  "pdfjs-dist",
  "QPDF WASM",
  "Tauri",
];

export function AboutPage() {
  return (
    <Box minH="100vh" bg="white" py={{ base: 8, md: 16 }}>
      <Container maxW="900px" px={{ base: 4, md: 6 }}>
        <VStack gap={10} align="stretch">
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            textAlign="center"
          >
            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="800"
              color="gray.800"
              mb={4}
            >
              About PDF Online
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="gray.600">
              A free, privacy-first PDF toolkit for merging, compressing,
              converting, protecting, and unlocking documents on web and
              desktop.
            </Text>
          </MotionBox>

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
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </Icon>
              <Heading as="h2" fontSize="xl" fontWeight="700" color="green.800">
                Privacy First
              </Heading>
            </HStack>
            <VStack align="start" gap={3}>
              <Text color="green.700">
                <strong>Your files never leave your device.</strong> PDF Online
                performs its core processing locally in the browser or desktop
                app.
              </Text>
              {highlights.map((item) => (
                <Text key={item} color="green.700" fontSize="sm">
                  - {item}
                </Text>
              ))}
            </VStack>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Heading
              as="h2"
              fontSize="xl"
              fontWeight="700"
              color="gray.800"
              mb={4}
            >
              Included Tools
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {tools.map((tool) => (
                <Box
                  key={tool.title}
                  p={5}
                  bg="gray.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.100"
                >
                  <Text fontWeight="700" color="gray.800" mb={2}>
                    {tool.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {tool.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Heading
              as="h2"
              fontSize="xl"
              fontWeight="700"
              color="gray.800"
              mb={4}
            >
              How It Works
            </Heading>
            <VStack align="stretch" gap={4}>
              <Box p={4} bg="gray.50" borderRadius="lg">
                <Text fontWeight="600" color="gray.800">
                  1. Add your files
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Use drag and drop, the file picker, or clipboard paste in the
                  supported tools.
                </Text>
              </Box>
              <Box p={4} bg="gray.50" borderRadius="lg">
                <Text fontWeight="600" color="gray.800">
                  2. Choose the output
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Reorder files, pick compression settings, or provide a
                  password depending on the tool you are using.
                </Text>
              </Box>
              <Box p={4} bg="gray.50" borderRadius="lg">
                <Text fontWeight="600" color="gray.800">
                  3. Download the result
                </Text>
                <Text fontSize="sm" color="gray.600">
                  The processed file is generated locally and downloaded without
                  sending your documents to a server.
                </Text>
              </Box>
            </VStack>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Heading
              as="h2"
              fontSize="xl"
              fontWeight="700"
              color="gray.800"
              mb={4}
            >
              Technology
            </Heading>
            <Box p={4} bg="gray.50" borderRadius="lg">
              <VStack align="start" gap={2}>
                {technologies.map((item) => (
                  <Text key={item} fontSize="sm" color="gray.700">
                    - {item}
                  </Text>
                ))}
              </VStack>
            </Box>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            textAlign="center"
            py={8}
          >
            <Text fontSize="sm" color="gray.500">
              PDF Online is open source software released under the MIT License.
              <br />
              <Link
                color="brand.500"
                onClick={() =>
                  openExternalLink(
                    `https://github.com/${GITHUB_PROFILE_ID}/pdf-online`
                  )
                }
                cursor="pointer"
              >
                View on GitHub
              </Link>
            </Text>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
}
