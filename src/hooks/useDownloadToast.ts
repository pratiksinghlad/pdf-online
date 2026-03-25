import { toaster } from "../components/ui/toaster-instance";
import { useCallback } from "react";

/**
 * Hook to show a consistent "Download Successful" toast message
 * Using Chakra UI v3 toaster
 */
export function useDownloadToast() {
  const showDownloadToast = useCallback(
    (filename?: string) => {
      toaster.create({
        title: "Download Successful!",
        description: filename 
          ? `Your file "${filename}" has been downloaded successfully.`
          : "Your file has been downloaded successfully.",
        type: "success",
        duration: 3000,
      });
    },
    []
  );

  return { showDownloadToast };
}
