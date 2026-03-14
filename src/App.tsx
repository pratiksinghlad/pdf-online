import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { system } from "./theme";
import { PDFProvider } from "./context/PDFContext";
import { ImageToPDFProvider } from "./context/ImageToPDFContext";
import { Navbar, Footer } from "./components";
import {
  MergePage,
  AboutPage,
  HowItWorksPage,
  CompressPage,
  ImageToPDFPage,
} from "./pages";

import { isTauri } from '@tauri-apps/api/core';

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
        <PDFProvider>
          <ImageToPDFProvider>
            <Box minH="100vh" display="flex" flexDirection="column">
              <Navbar />
              <Box flex="1">
                <Routes>
                  <Route path="/" element={<MergePage />} />
                  <Route path="/merge" element={<MergePage />} />
                  <Route path="/compress" element={<CompressPage />} />
                  <Route path="/image-to-pdf" element={<ImageToPDFPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                </Routes>
              </Box>
              <Footer />
            </Box>
          </ImageToPDFProvider>
        </PDFProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
