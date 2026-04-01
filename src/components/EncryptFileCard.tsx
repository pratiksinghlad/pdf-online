import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { CheckCircle, Download, Trash2, XCircle } from "lucide-react";
import { useEncrypt } from "../context/EncryptContext";
import type { EncryptFileInfo } from "../types";
import { formatFileSize } from "../utils";
import { PasswordInput } from "./PasswordInput";

const MotionBox = motion.create(Box);

export function EncryptFileCard({ file }: { file: EncryptFileInfo }) {
  const { removeFile, updateFile, downloadProcessedFile } = useEncrypt();

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor={
          file.status === "error"
            ? "red.200"
            : file.status === "success"
              ? "green.200"
              : "gray.100"
        }
        overflow="hidden"
        p={4}
        shadow="sm"
      >
        <Flex direction={{ base: "column", md: "row" }} align="center" gap={4}>
          <Flex flex={1} direction="column" minW={0} w="100%">
            <Text
              fontWeight="600"
              fontSize="md"
              color="gray.800"
              truncate
              title={file.name}
            >
              {file.name}
            </Text>
            <HStack gap={2} mt={1}>
              <Badge
                colorPalette="gray"
                variant="subtle"
                fontSize="xs"
                borderRadius="full"
              >
                {formatFileSize(file.size)}
              </Badge>
              {file.status === "success" && (
                <Badge
                  colorPalette="green"
                  variant="subtle"
                  fontSize="xs"
                  borderRadius="full"
                >
                  Encrypted
                </Badge>
              )}
            </HStack>
          </Flex>

          {file.status === "idle" && (
            <Box flex={1} w="100%">
              <PasswordInput
                value={file.password || ""}
                onChange={(val) => updateFile(file.id, { password: val })}
                placeholder="File password"
              />
            </Box>
          )}

          <Flex align="center" gap={2}>
            {file.status === "processing" && (
              <Spinner size="sm" color="red.500" />
            )}
            {file.status === "success" && <CheckCircle color="green" size={20} />}
            {file.status === "error" && (
              <XCircle color="red" size={20} aria-label={file.error} />
            )}

            {file.status === "success" && (
              <IconButton
                aria-label="Download"
                variant="ghost"
                size="sm"
                color="brand.500"
                onClick={() => downloadProcessedFile(file.id)}
              >
                <Download size={18} />
              </IconButton>
            )}

            <IconButton
              aria-label="Remove file"
              variant="ghost"
              size="sm"
              color="red.500"
              onClick={() => removeFile(file.id)}
              disabled={file.status === "processing"}
            >
              <Trash2 size={18} />
            </IconButton>
          </Flex>
        </Flex>

        {file.error && (
          <Text fontSize="xs" color="red.500" mt={2}>
            Warning: {file.error}
          </Text>
        )}
      </Box>
    </MotionBox>
  );
}
