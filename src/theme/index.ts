import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

// Custom theme based on the ilovepdf design
const customConfig = defineConfig({
    theme: {
        tokens: {
            colors: {
                // Primary brand color (red from ilovepdf)
                brand: {
                    50: { value: '#fff5f5' },
                    100: { value: '#fed7d7' },
                    200: { value: '#feb2b2' },
                    300: { value: '#fc8181' },
                    400: { value: '#f56565' },
                    500: { value: '#e53e3e' },
                    600: { value: '#c53030' },
                    700: { value: '#9b2c2c' },
                    800: { value: '#822727' },
                    900: { value: '#63171b' },
                },
                // Accent color (coral/orange)
                accent: {
                    50: { value: '#fff5f0' },
                    100: { value: '#ffeee5' },
                    200: { value: '#ffccb3' },
                    300: { value: '#ff9966' },
                    400: { value: '#ff7043' },
                    500: { value: '#e85a3a' },
                    600: { value: '#d04b2d' },
                    700: { value: '#b83d22' },
                    800: { value: '#9c3119' },
                    900: { value: '#7a2412' },
                },
                // Background colors
                bg: {
                    light: { value: '#ffffff' },
                    muted: { value: '#f7fafc' },
                    dark: { value: '#1a202c' },
                    card: { value: '#ffffff' },
                },
                // Text colors
                text: {
                    primary: { value: '#1a202c' },
                    secondary: { value: '#4a5568' },
                    muted: { value: '#718096' },
                    light: { value: '#a0aec0' },
                },
            },
            fonts: {
                heading: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
                body: { value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
            },
            fontSizes: {
                xs: { value: '0.75rem' },
                sm: { value: '0.875rem' },
                md: { value: '1rem' },
                lg: { value: '1.125rem' },
                xl: { value: '1.25rem' },
                '2xl': { value: '1.5rem' },
                '3xl': { value: '1.875rem' },
                '4xl': { value: '2.25rem' },
                '5xl': { value: '3rem' },
            },
            radii: {
                none: { value: '0' },
                sm: { value: '0.25rem' },
                md: { value: '0.5rem' },
                lg: { value: '0.75rem' },
                xl: { value: '1rem' },
                '2xl': { value: '1.5rem' },
                full: { value: '9999px' },
            },
            shadows: {
                sm: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
                md: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
                lg: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
                xl: { value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
                card: { value: '0 2px 8px rgba(0, 0, 0, 0.08)' },
                cardHover: { value: '0 8px 24px rgba(0, 0, 0, 0.12)' },
            },
        },
        semanticTokens: {
            colors: {
                primary: {
                    value: { base: '{colors.brand.500}', _dark: '{colors.brand.400}' },
                },
                'primary.hover': {
                    value: { base: '{colors.brand.600}', _dark: '{colors.brand.500}' },
                },
                background: {
                    value: { base: '{colors.bg.light}', _dark: '{colors.bg.dark}' },
                },
                'background.muted': {
                    value: { base: '{colors.bg.muted}', _dark: '#2d3748' },
                },
                foreground: {
                    value: { base: '{colors.text.primary}', _dark: '#f7fafc' },
                },
                'foreground.muted': {
                    value: { base: '{colors.text.muted}', _dark: '#a0aec0' },
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, customConfig);
