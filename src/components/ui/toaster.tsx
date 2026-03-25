import { Portal, Toaster as ChakraToaster, Stack } from "@chakra-ui/react";
import { toaster } from "./toaster-instance";

export const Toaster = () => (
  <Portal>
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <Stack key={toast.id}>
          {/* Default toast rendering handled by Chakra v3 */}
        </Stack>
      )}
    </ChakraToaster>
  </Portal>
);
