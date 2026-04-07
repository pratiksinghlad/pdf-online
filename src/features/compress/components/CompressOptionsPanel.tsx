import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  IconButton,
  Progress,
  Slider,
  Input,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useCompress } from "../../../context/CompressContext";
import type { CompressionLevel } from "../../../types/compress";
import { COMPRESSION_PROFILES } from "../../../services/compressionConfig";
import { formatFileSize } from "../../../utils";

const MotionBox = motion.create(Box);

interface CompressionOption {
  level: CompressionLevel;
  title: string;
  description: string;
}

const compressionOptions: CompressionOption[] = [
  {
    level: "best",
    title: COMPRESSION_PROFILES.best.name,
    description: COMPRESSION_PROFILES.best.description,
  },
  {
    level: "basic",
    title: COMPRESSION_PROFILES.basic.name,
    description: COMPRESSION_PROFILES.basic.description,
  },
  {
    level: "custom",
    title: COMPRESSION_PROFILES.custom.name,
    description: COMPRESSION_PROFILES.custom.description,
  },
];

export function CompressOptionsPanel() {
  const {
    files,
    compressionOptions: options,
    compressionProgress,
    engine,
    setCompressionLevel,
    setCustomDpi,
    compressPDFs,
    cancelCompression,
  } = useCompress();

  const hasFiles = files.length > 0;
  const isCompressing =
    compressionProgress.status === "compressing" ||
    compressionProgress.status === "loading";
  const hasCompressedFiles = files.some((f) => f.isCompressed);

  // Calculate totals
  const totalOriginalSize = files.reduce((sum, f) => sum + f.originalSize, 0);
  const totalCompressedSize = files
    .filter((f) => f.isCompressed && f.compressedSize)
    .reduce((sum, f) => sum + (f.compressedSize || 0), 0);
  const overallReduction =
    totalOriginalSize > 0 && totalCompressedSize > 0 && totalCompressedSize < totalOriginalSize
      ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
      : 0;

  if (!hasFiles) {
    return null;
  }

  return (
    <MotionBox
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Box
        bg="white"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.100"
        shadow="sm"
        overflow="hidden"
      >
        {/* Header */}
        <HStack px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
          <Box
            w={8}
            h={8}
            bg="red.50"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon color="red.500" boxSize={5}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M16,11V18.1L13.9,16L11.1,18.8L8.3,16L11.1,13.2L8.9,11H16Z" />
              </svg>
            </Icon>
          </Box>
          <Text fontWeight="700" fontSize="lg" color="gray.800">
            Compress
          </Text>
        </HStack>

        {/* Compression Options */}
        <VStack px={5} py={4} gap={3} align="stretch">
          {compressionOptions.map((opt) => (
            <Box
              key={opt.level}
              as="button"
              onClick={() => !isCompressing && setCompressionLevel(opt.level)}
              bg={options.level === opt.level ? "blue.50" : "white"}
              border="1px solid"
              borderColor={
                options.level === opt.level ? "blue.200" : "gray.200"
              }
              borderRadius="lg"
              p={4}
              textAlign="left"
              transition="all 0.2s"
              cursor={isCompressing ? "not-allowed" : "pointer"}
              opacity={isCompressing ? 0.7 : 1}
              _hover={{
                borderColor: isCompressing ? undefined : "blue.300",
                bg: isCompressing
                  ? undefined
                  : options.level === opt.level
                    ? "blue.50"
                    : "gray.50",
              }}
            >
              <VStack align="stretch" gap={3}>
                <HStack gap={3}>
                  {/* Radio Button */}
                  <Box
                    w={5}
                    h={5}
                    borderRadius="full"
                    border="2px solid"
                    borderColor={
                      options.level === opt.level ? "blue.500" : "gray.300"
                    }
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    {options.level === opt.level && (
                      <Box w={2.5} h={2.5} bg="blue.500" borderRadius="full" />
                    )}
                  </Box>

                  <VStack align="start" gap={0}>
                    <Text fontWeight="600" fontSize="sm" color="gray.800">
                      {opt.title}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {opt.description}
                    </Text>
                  </VStack>
                </HStack>

                {/* Custom DPI Slider */}
                {opt.level === "custom" && options.level === "custom" && (
                  <Box
                    pt={2}
                    pl={8}
                    onClick={(e) => e.stopPropagation()} // Prevent setting level again
                  >
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="xs" fontWeight="500" color="gray.600">
                        Resolution (75-200 DPI)
                      </Text>
                      <HStack gap={1}>
                        <Input
                          size="xs"
                          w="50px"
                          textAlign="center"
                          type="number"
                          value={options.customDpi || 150}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) setCustomDpi(val);
                          }}
                          onBlur={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) val = 150;
                            if (val < 75) val = 75;
                            if (val > 200) val = 200;
                            setCustomDpi(val);
                          }}
                        />
                        <Text fontSize="xs" fontWeight="700" color="blue.600">
                          DPI
                        </Text>
                        <IconButton
                          aria-label="Re-compress"
                          size="xs"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            compressPDFs(true);
                          }}
                          colorPalette="blue"
                          title="Apply & Re-compress"
                        >
                          <Icon boxSize={4}>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </Icon>
                        </IconButton>
                      </HStack>
                    </HStack>
                    <Slider.Root
                      min={75}
                      max={200}
                      step={1}
                      value={[options.customDpi || 150]}
                      onValueChange={(details) =>
                        setCustomDpi(details.value[0])
                      }
                      colorPalette="blue"
                    >
                      <Slider.Track>
                        <Slider.Range />
                      </Slider.Track>
                      <Slider.Thumb index={0} />
                    </Slider.Root>
                  </Box>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>

        {/* Progress */}
        {isCompressing && (
          <Box px={5} pb={4}>
            <Progress.Root
              value={compressionProgress.progress}
              colorPalette="blue"
              size="sm"
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
              {compressionProgress.message}
            </Text>
          </Box>
        )}

        {/* Results Summary */}
        {hasCompressedFiles && !isCompressing && (
          <Box px={5} pb={4}>
            <Box bg="green.50" p={3} borderRadius="lg">
              <HStack justify="space-between">
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color="gray.500">
                    {overallReduction > 0 ? "Reduced by" : "Result"}
                  </Text>
                  <Text fontWeight="700" fontSize="lg" color={overallReduction > 0 ? "green.600" : "blue.600"}>
                    {overallReduction > 0 ? `${overallReduction.toFixed(1)}%` : "Already Optimized"}
                  </Text>
                </VStack>
                <VStack align="end" gap={0}>
                  <Text fontSize="xs" color="gray.500">
                    {formatFileSize(totalOriginalSize)} →{" "}
                    {formatFileSize(totalCompressedSize)}
                  </Text>
                  <Text fontSize="xs" color={overallReduction > 0 ? "green.600" : "blue.600"} fontWeight="600">
                    {overallReduction > 0 
                      ? `Saved ${formatFileSize(totalOriginalSize - totalCompressedSize)}`
                      : "Files are already at their smallest size"}
                  </Text>
                </VStack>
              </HStack>
            </Box>
            {/* Engine indicator */}
            {engine !== "unknown" && (
              <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
                Engine:{" "}
                {engine === "ghostscript" ? "⚡ Ghostscript WASM" : "🖼️ Canvas"}
              </Text>
            )}
          </Box>
        )}

        {/* Action Button */}
        <Box px={5} pb={5}>
          {isCompressing ? (
            <Button
              w="100%"
              colorPalette="gray"
              variant="outline"
              size="lg"
              onClick={cancelCompression}
            >
              Cancel
            </Button>
          ) : hasCompressedFiles ? (
            <Button
              w="100%"
              bg={
                compressionProgress.status === "complete"
                  ? "green.500"
                  : "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)"
              }
              color="white"
              size="lg"
              onClick={
                compressionProgress.status === "complete" ||
                compressionProgress.status === "compressing" ||
                compressionProgress.status === "loading"
                  ? undefined
                  : () => compressPDFs()
              }
              _hover={{
                bg:
                  compressionProgress.status === "complete"
                    ? "green.600"
                    : "linear-gradient(135deg, #c53030 0%, #9b2c2c 100%)",
                transform:
                  compressionProgress.status === "complete"
                    ? "none"
                    : "translateY(-2px)",
                shadow: "lg",
              }}
            >
              <HStack>
                <Icon>
                  {compressionProgress.status === "complete" ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  )}
                </Icon>
                <span>
                  {compressionProgress.status === "complete"
                    ? "✓ Downloaded!"
                    : compressionProgress.status === "compressing" ||
                        compressionProgress.status === "loading"
                      ? "Compressing..."
                      : "Compress PDF"}
                </span>
              </HStack>
            </Button>
          ) : (
            <Button
              w="100%"
              bg="linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)"
              color="white"
              size="lg"
              onClick={() => compressPDFs()}
              disabled={files.some((f) => f.isLoading)}
              _hover={{
                bg: "linear-gradient(135deg, #2b6cb0 0%, #2c5282 100%)",
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              _disabled={{
                opacity: 0.6,
                cursor: "not-allowed",
              }}
            >
              <HStack>
                <span>Compress</span>
                <Icon>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Icon>
              </HStack>
            </Button>
          )}
        </Box>
      </Box>
    </MotionBox>
  );
}
