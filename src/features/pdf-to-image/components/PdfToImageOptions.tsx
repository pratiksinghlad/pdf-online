import { Box, HStack, VStack, Text, Button } from '@chakra-ui/react';
import { usePdfToImage, type ImageFormat, type ScaleOption } from '../context/PdfToImageContext';

const FORMAT_OPTIONS: { value: ImageFormat; label: string }[] = [
    { value: 'png', label: 'PNG' },
    { value: 'jpeg', label: 'JPG' },
];

const SCALE_OPTIONS: { value: ScaleOption; label: string; description: string }[] = [
    { value: 1, label: '1×', description: 'Normal' },
    { value: 2, label: '2×', description: 'High' },
    { value: 3, label: '3×', description: 'Ultra' },
];

export function PdfToImageOptions() {
    const { options, setOptions, isRendering } = usePdfToImage();

    return (
        <Box
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="xl"
            p={5}
            shadow="sm"
        >
            <Text fontWeight="800" color="gray.700" fontSize="sm" mb={4}>
                Conversion Settings
            </Text>

            {/* Format selector */}
            <Box mb={4}>
                <Text fontSize="xs" fontWeight="700" color="gray.500" mb={2} textTransform="uppercase" letterSpacing="0.5px">
                    Image Format
                </Text>
                <HStack gap={2}>
                    {FORMAT_OPTIONS.map((opt) => (
                        <Button
                            key={opt.value}
                            flex="1"
                            size="sm"
                            variant={options.format === opt.value ? 'solid' : 'outline'}
                            colorScheme={options.format === opt.value ? 'gray' : 'gray'}
                            bg={options.format === opt.value ? 'gray.800' : 'white'}
                            color={options.format === opt.value ? 'white' : 'gray.600'}
                            onClick={() => setOptions({ format: opt.value })}
                            disabled={isRendering}
                            fontSize="xs"
                            fontWeight="800"
                            h="40px"
                            borderRadius="lg"
                        >
                            {opt.label}
                        </Button>
                    ))}
                </HStack>
            </Box>

            {/* JPEG Quality – only visible when format is jpeg */}
            {options.format === 'jpeg' && (
                <Box mb={5}>
                    <Text fontSize="xs" fontWeight="800" color="gray.500" mb={2} textTransform="uppercase">
                        Quality: {Math.round(options.jpegQuality * 100)}%
                    </Text>
                    <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={options.jpegQuality}
                        onChange={(e) => setOptions({ jpegQuality: parseFloat(e.target.value) })}
                        disabled={isRendering}
                        style={{ width: '100%', accentColor: '#e53e3e' }}
                    />
                </Box>
            )}

            {/* Scale selector */}
            <Box>
                <Text fontSize="xs" fontWeight="800" color="gray.500" mb={3} textTransform="uppercase">
                    Resolution Scale
                </Text>
                <VStack gap={2} align="stretch">
                    {SCALE_OPTIONS.map((opt) => (
                        <Button
                            key={opt.value}
                            size="sm"
                            variant={options.scale === opt.value ? 'solid' : 'outline'}
                            bg={options.scale === opt.value ? 'gray.800' : 'white'}
                            color={options.scale === opt.value ? 'white' : 'gray.600'}
                            onClick={() => setOptions({ scale: opt.value })}
                            disabled={isRendering}
                            justifyContent="flex-start"
                            px={4}
                            h="40px"
                            fontSize="xs"
                            fontWeight="700"
                            borderRadius="lg"
                        >
                            <HStack justify="space-between" w="100%">
                                <Text>{opt.label}</Text>
                                <Text fontSize="10px" opacity={0.6}>{opt.description}</Text>
                            </HStack>
                        </Button>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
}
