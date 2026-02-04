import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { system } from './theme';
import { PDFProvider } from './context/PDFContext';
import { ImageToPDFProvider } from './context/ImageToPDFContext';
import { Navbar, Footer } from './components';
import { MergePage, AboutPage, HowItWorksPage, CompressPage, ImageToPDFPage } from './pages';

function App() {
  return (
    <ChakraProvider value={system}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
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
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
