import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { X, FileText, Download, CheckCircle, AlertCircle, Unlock } from "lucide-react";
import { motion } from "framer-motion";
import { useUnlock } from "../../../context/UnlockContext";
import { formatFileSize } from "../../../utils";
import { PasswordInput } from "../../../components/PasswordInput";

const MotionBox = motion.create(Box);

interface UnlockFileCardProps {
  fileId: string;
}

export function UnlockFileCard({ fileId }: UnlockFileCardProps) {
  const { files, removeFile, updateFile, downloadProcessedFile } = useUnlock();
  const fileInfo = files.find((f) => f.id === fileId);

  if (!fileInfo) return null;

  const { name, size, status, error, password } = fileInfo;

  return (
    <MotionBox
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Box
        bg="white"
        p={4}
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.200"
        shadow="sm"
        _hover={{ shadow: "md", borderColor: "red.200" }}
        transition="all 0.2s"
      >
        <HStack gap={4} align="start">
          <Box
            p={3}
            bg="red.50"
            borderRadius="lg"
            color="red.500"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FileText size={24} />
          </Box>

          <VStack align="stretch" flex={1} gap={1} minW={0}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0} minW={0} flex={1}>
                <Text fontWeight="600" color="gray.800" truncate title={name} w="100%">
                  {name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {formatFileSize(size)}
                </Text>
              </VStack>

              <HStack gap={2}>
                {status === "success" && (
                  <Badge colorPalette="green" variant="subtle" borderRadius="full" px={2}>
                    <HStack gap={1}>
                      <CheckCircle size={12} />
                      <Text fontSize="xs">Unlocked</Text>
                    </HStack>
                  </Badge>
                )}
                {status === "not-protected" && (
                  <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={2}>
                    <HStack gap={1}>
                      <Unlock size={12} />
                      <Text fontSize="xs">file is not password protected</Text>
                    </HStack>
                  </Badge>
                )}
                {status === "error" && (
                  <Badge colorPalette="red" variant="subtle" borderRadius="full" px={2}>
                    <HStack gap={1}>
                      <AlertCircle size={12} />
                      <Text fontSize="xs">Error</Text>
                    </HStack>
                  </Badge>
                )}
                {status === "processing" && (
                  <HStack gap={2}>
                    <Spinner size="xs" color="red.500" />
                    <Text fontSize="xs" color="gray.500">Processing...</Text>
                  </HStack>
                )}
                
                <IconButton
                  aria-label="Remove file"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileId)}
                  color="gray.400"
                  _hover={{ color: "red.500", bg: "red.50" }}
                >
                  <X size={18} />
                </IconButton>
              </HStack>
            </HStack>

            {status === "idle" && (
              <Box mt={2}>
                <PasswordInput 
                  value={password || ""} 
                  onChange={(val) => updateFile(fileId, { password: val })}
                  placeholder="Enter PDF password to unlock"
                />
              </Box>
            )}

            {error && (
              <Text fontSize="xs" color="red.500" mt={1}>
                {error}
              </Text>
            )}

            {status === "success" && (
              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={() => downloadProcessedFile(fileId)}
                mt={2}
                alignSelf="start"
              >
                <HStack gap={2}>
                  <Download size={16} />
                  <Text>Download Unlocked PDF</Text>
                </HStack>
              </Button>
            )}
          </VStack>
        </HStack>
      </Box>
    </MotionBox>
  );
}
