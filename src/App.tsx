import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider, Box, Center, Spinner } from "@chakra-ui/react";
import { Suspense, lazy } from "react";
import { system } from "./theme";

import { Navbar, Footer } from "./components";

import { isTauri } from '@tauri-apps/api/core';

// Lazy load feature pages
const MergePage = lazy(() => import("./features/merge").then(m => ({ default: m.MergePage })));
const CompressPage = lazy(() => import("./features/compress").then(m => ({ default: m.CompressPage })));
const ImageToPDFPage = lazy(() => import("./features/image-to-pdf").then(m => ({ default: m.ImageToPDFPage })));
const EncryptPage = lazy(() => import("./features/encrypt").then(m => ({ default: m.EncryptPage })));
const UnlockPage = lazy(() => import("./features/unlock").then(m => ({ default: m.UnlockPage })));
const SplitPDFPage = lazy(() => import("./features/split").then(m => ({ default: m.SplitPDFPage })));

// Lazy load static pages
const AboutPage = lazy(() => import("./pages/AboutPage").then(m => ({ default: m.AboutPage })));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage").then(m => ({ default: m.HowItWorksPage })));

const LoadingFallback = () => (
    <Center h="50vh">
        <Spinner size="xl" color="red.500" />
    </Center>
);

function App() {
  const isDesktop = isTauri();
  const Router = isDesktop ? HashRouter : BrowserRouter;

  // Vite sets import.meta.env.BASE_URL to './' for Tauri Desktop builds
  // React Router doesn't like './' as a basename, it expects '/' or ''
  const viteBaseUrl = import.meta.env.BASE_URL;
  const basename = isDesktop || viteBaseUrl === "./" ? undefined : viteBaseUrl;

  return (
    <ChakraProvider value={system}>
      <Router basename={basename}>
                <Box minH="100vh" display="flex" flexDirection="column">
                  <Navbar />
                  <Box as="main" flex="1" pt={{ base: "80px", md: "100px" }}>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<MergePage />} />
                        <Route path="/merge" element={<MergePage />} />
                        <Route path="/compress" element={<CompressPage />} />
                        <Route path="/image-to-pdf" element={<ImageToPDFPage />} />
                        <Route path="/encrypt" element={<EncryptPage />} />
                        <Route path="/unlock-pdf" element={<UnlockPage />} />
                        <Route path="/split-pdf" element={<SplitPDFPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/how-it-works" element={<HowItWorksPage />} />
                      </Routes>
                    </Suspense>
                  </Box>
                  <Footer />
                </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;

