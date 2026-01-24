import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { system } from './theme';
import { PDFProvider } from './context/PDFContext';
import { Navbar, Footer } from './components';
import { HomePage, AboutPage, HowItWorksPage } from './pages';

function App() {
  return (
    <ChakraProvider value={system}>
      <BrowserRouter>
        <PDFProvider>
          <Box minH="100vh" display="flex" flexDirection="column">
            <Navbar />
            <Box flex="1">
              <Routes>
                <Route path="/" element={<HomePage />} />
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
