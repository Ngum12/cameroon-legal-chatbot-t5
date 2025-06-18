import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    primary: '#1e3a8a',
    secondary: '#4f46e5',
    accent: '#10b981',
    background: '#f8fafc',
    text: '#334155',
    lightText: '#94a3b8',
    darkText: '#0f172a',
    white: '#ffffff',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#22c55e',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    secondary: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
  },
  shadows: {
    small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  fonts: {
    body: '"Roboto", sans-serif',
    heading: '"Poppins", sans-serif',
  },
};

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: ${({ theme }) => theme.fonts.body};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.background};
    line-height: 1.5;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    color: ${({ theme }) => theme.colors.darkText};
    margin-bottom: 0.5rem;
  }
`;