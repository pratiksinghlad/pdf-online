import { useCallback } from "react";
import { Box, Text, VStack, Icon } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { useUnlock } from "../../../context/UnlockContext";

/* eslint-disable @typescript-eslint/no-explicit-any */
const MotionBox: any = (motion as any)(Box);

export function UnlockDropZone() {
  const { addFiles, files } = useUnlock();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      addFiles(acceptedFiles);
    },
    [addFiles],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  const getBorderColor = () => {
    if (isDragReject) return "red.400";
    if (isDragAccept) return "green.400";
    if (isDragActive) return "red.400";
    return "gray.200";
  };

  const getBgColor = () => {
    if (isDragReject) return "red.50";
    if (isDragAccept) return "green.50";
    if (isDragActive) return "red.50";
    return "gray.50";
  };

  const hasFiles = files.length > 0;

  return (
    <MotionBox
      {...getRootProps()}
      tabIndex={0}
      role="button"
      aria-label="Drop PDFs here or click to select"
      cursor="pointer"
      border="2px dashed"
      borderColor={getBorderColor()}
      borderRadius="xl"
      bg={getBgColor()}
      p={{ base: 6, md: hasFiles ? 6 : 12 }}
      textAlign="center"
      style={{ transition: "all 0.2s" }}
      _hover={{
        borderColor: "red.400",
        bg: "red.50",
      }}
      _focus={{
        outline: "2px solid",
        outlineColor: "red.500",
        outlineOffset: "2px",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input {...getInputProps()} aria-label="Upload PDF files for unlocking" />

      <VStack gap={3}>
        <MotionBox
          animate={{
            y: isDragActive ? [-5, 5, -5] : 0,
          }}
          transition={{
            repeat: isDragActive ? Infinity : 0,
            duration: 1,
          }}
        >
          <Icon
            w={{ base: 10, md: hasFiles ? 8 : 16 }}
            h={{ base: 10, md: hasFiles ? 8 : 16 }}
            color={isDragActive ? "red.500" : "gray.400"}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
          </Icon>
        </MotionBox>

        <VStack gap={1}>
          <Text
            fontSize={{ base: "md", md: hasFiles ? "md" : "xl" }}
            fontWeight="600"
            color={isDragActive ? "red.600" : "gray.700"}
          >
            {isDragActive
              ? isDragReject
                ? "Only PDF files are accepted"
                : "Drop your PDFs here"
              : hasFiles
                ? "Drop more PDFs or click to add"
                : "Drag & drop PDF files here"}
          </Text>
        </VStack>

        <Box
          as="span"
          bg="linear-gradient(135deg, #f56565 0%, #e53e3e 100%)"
          color="white"
          px={{ base: 6, md: hasFiles ? 4 : 8 }}
          py={{ base: 2, md: hasFiles ? 2 : 3 }}
          borderRadius="full"
          fontWeight="600"
          fontSize={{ base: "sm", md: hasFiles ? "sm" : "md" }}
          shadow="lg"
          style={{ transition: "all 0.2s" }}
          _hover={{
            transform: "translateY(-2px)",
            shadow: "xl",
          }}
        >
          {hasFiles ? "+ Add More PDFs" : "Select PDFs"}
        </Box>
      </VStack>
    </MotionBox>
  );
}
