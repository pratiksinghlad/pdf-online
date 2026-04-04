import { Box, Heading, Text, VStack, Container } from "@chakra-ui/react";
import { EncryptDropZone, EncryptFileList } from "../components";
import { MotionBox } from "../../../components";

export function EncryptPage() {
  return (
    <Box minH="100vh" bg="white">
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
                fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
                fontWeight="800"
                color="gray.800"
                lineHeight="1.2"
              >
                Password Protect PDF Files
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="gray.600"
                mt={3}
                maxW="600px"
                mx="auto"
              >
                Secure your PDF documents with a password and strong encryption.
                <Text as="span" color="red.600" fontWeight="600">
                  {" "}
                  100% free and private
                </Text>
                — your files never leave your browser.
              </Text>
            </MotionBox>

            <Box w="100%" maxW="600px">
              <EncryptDropZone />
            </Box>
          </VStack>
        </Container>
      </Box>

      <Container maxW="800px" px={{ base: 4, md: 6 }} py={{ base: 6, md: 10 }}>
        <VStack gap={{ base: 6, md: 10 }} align="stretch">
          <EncryptFileList />
        </VStack>
      </Container>
    </Box>
  );
}
