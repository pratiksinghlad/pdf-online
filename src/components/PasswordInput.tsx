import { useState, useId } from "react";
import {
  Input,
  IconButton,
  Group,
  VStack,
  Text,
  Progress,
} from "@chakra-ui/react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showStrengthIndicator?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Enter password",
  label,
  showStrengthIndicator = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const reactId = useId();
  const inputId = `password-input-${reactId}`;

  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length > 5) score += 25;
    if (pass.length > 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
    return score;
  };

  const strength = getStrength(value);
  const color =
    strength < 50 ? "red" : strength < 75 ? "orange" : "green";

  return (
    <VStack align="stretch" gap={1} w="100%">
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: "14px", fontWeight: "600", color: "#4A5568", marginBottom: "4px" }}
        >
          {label}
        </label>
      )}
      <Group
        w="100%"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        px={3}
        _hover={{ borderColor: "gray.300" }}
        _focusWithin={{ borderColor: "red.600", ring: "1px", ringColor: "red.600" }}
        transition="all 0.2s"
        bg="white"
        h="44px"
        alignItems="center"
        gap={1}
      >
        <Lock size={18} color="#718096" aria-hidden="true" style={{ flexShrink: 0 }} />
        <Input
          id={inputId}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={!label ? placeholder : undefined}
          autoComplete="current-password"
          data-lpignore="true"
          spellCheck={false}
          px={2}
          flex={1}
          height="100%"
          fontSize="md"
          border="none"
          outline="none"
          _placeholder={{ color: "gray.400" }}
          _focus={{ boxShadow: "none", border: "none", outline: "none" }}
        />
        <IconButton
          aria-label={show ? "Hide password" : "Show password"}
          variant="ghost"
          size="sm"
          onClick={() => setShow(!show)}
          color="gray.500"
          _hover={{ bg: "transparent", color: "red.600" }}
          _active={{ bg: "transparent" }}
          flexShrink={0}
        >
          {show ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
        </IconButton>
      </Group>

      {showStrengthIndicator && value && (
        <VStack align="stretch" gap={0}>
          <Progress.Root value={strength} colorPalette={color} size="sm">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="gray.600" mt={1}>
            Password Strength: 
            <Text as="span" fontWeight="700" ml={1}>
              {strength < 50
                ? "Weak"
                : strength < 75
                ? "Moderate"
                : "Strong"}
            </Text>
          </Text>
        </VStack>
      )}
    </VStack>
  );
}
