import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { system } from './theme';
import { PDFProvider } from './context/PDFContext';
import { Navbar, Footer } from './components';
import { MergePage, AboutPage, HowItWorksPage, CompressPage } from './pages';

function App() {
  return (
    <ChakraProvider value={system}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <PDFProvider>
          <Box minH="100vh" display="flex" flexDirection="column">
            <Navbar />
            <Box flex="1">
              <Routes>
                <Route path="/" element={<MergePage />} />
                <Route path="/merge" element={<MergePage />} />
                <Route path="/compress" element={<CompressPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </PDFProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
