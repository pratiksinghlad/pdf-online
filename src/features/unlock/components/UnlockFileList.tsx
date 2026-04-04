import {
  VStack,
  HStack,
  Button,
  Text,
  Container,
  Box,
} from "@chakra-ui/react";
import { Download, Trash2, Unlock } from "lucide-react";
import { useUnlock } from "../../../context/UnlockContext";
import { UnlockFileCard } from "./UnlockFileCard";
import { PasswordInput } from "../../../components/PasswordInput";
import { AnimatePresence, motion } from "framer-motion";

const MotionBox = motion.create(Box);

export function UnlockFileList() {
  const {
    files,
    isProcessing,
    globalPassword,
    setGlobalPassword,
    processFiles,
    clearFiles,
    downloadAllProcessed,
  } = useUnlock();

  if (files.length === 0) return null;

  const allSuccess = files.every((f) => f.status === "success" || f.status === "not-protected");
  const hasSuccess = files.some((f) => f.status === "success");

  return (
    <Container maxW="800px" p={0}>
      <VStack gap={6} align="stretch">
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          p={6}
          bg="white"
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.200"
          shadow="sm"
        >
          <VStack gap={4} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="700" fontSize="lg" color="gray.800">
                Unlock Settings
              </Text>
              <Button
                variant="ghost"
                size="sm"
                colorPalette="gray"
                onClick={clearFiles}
                disabled={isProcessing}
              >
                <HStack gap={2}>
                  <Trash2 size={16} />
                  <Text>Clear All</Text>
                </HStack>
              </Button>
            </HStack>

            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.600" mb={1}>
                Batch Password (Optional)
              </Text>
              <Text fontSize="xs" color="gray.500" mb={3}>
                Set a global password for all files in this batch.
              </Text>
              <PasswordInput
                value={globalPassword || ""}
                onChange={setGlobalPassword}
                placeholder="Global batch password"
              />
            </Box>

            <HStack gap={4} pt={2}>
              <Button
                flex={1}
                colorPalette="red"
                size="lg"
                height="56px"
                borderRadius="xl"
                fontSize="md"
                fontWeight="700"
                onClick={processFiles}
                loading={isProcessing}
                loadingText="Unlocking PDFs..."
                disabled={allSuccess}
                shadow="md"
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
              >
                {!isProcessing && (
                  <HStack gap={2}>
                    <Unlock size={20} />
                    <Text>Unlock PDFs</Text>
                  </HStack>
                )}
              </Button>

              {hasSuccess && (
                <Button
                  colorPalette="green"
                  variant="outline"
                  size="lg"
                  height="56px"
                  borderRadius="xl"
                  onClick={downloadAllProcessed}
                  disabled={isProcessing}
                >
                  <HStack gap={2}>
                    <Download size={20} />
                    <Text>Download All</Text>
                  </HStack>
                </Button>
              )}
            </HStack>
          </VStack>
        </MotionBox>

        <VStack gap={3} align="stretch">
          <AnimatePresence>
            {files.map((file) => (
              <UnlockFileCard key={file.id} fileId={file.id} />
            ))}
          </AnimatePresence>
        </VStack>
      </VStack>
    </Container>
  );
}
