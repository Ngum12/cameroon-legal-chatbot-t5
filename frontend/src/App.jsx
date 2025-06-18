import { useState } from 'react';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import ChatInterface from './components/ChatInterface';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import DocumentGenerator from './components/DocumentGenerator';
import LegalTimelineCalculator from './components/LegalTimelineCalculator';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { GlobalStyle, theme } from './theme';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
import '@fontsource/poppins/600.css';
import { FiMessageSquare, FiFileText, FiFilePlus, FiCalendar } from 'react-icons/fi';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #1a2a6c, #003366);
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 1rem;
  overflow: hidden;
`;

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [language, setLanguage] = useState('en');

  // Map tools to their titles and components
  const tools = {
    chat: {
      title: language === 'en' ? 'Legal Assistant' : 'Assistant Juridique',
      icon: <FiMessageSquare />,
      component: <ChatInterface language={language} />
    },
    documents: {
      title: language === 'en' ? 'Document Analyzer' : 'Analyseur de Documents',
      icon: <FiFileText />,
      component: <DocumentAnalyzer language={language} />
    },
    generator: {
      title: language === 'en' ? 'Document Generator' : 'Générateur de Documents',
      icon: <FiFilePlus />,
      component: <DocumentGenerator language={language} />
    },
    timeline: {
      title: language === 'en' ? 'Legal Timeline' : 'Calendrier Juridique',
      icon: <FiCalendar />,
      component: <LegalTimelineCalculator language={language} />
    }
  };

  const renderContent = () => {
    // Check if the active tab is one of our tools
    if (tools[activeTab]) {
      return tools[activeTab].component;
    }
    
    // Handle other tabs
    switch (activeTab) {
      case 'about':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              color: 'white', 
              padding: '2rem', 
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              margin: '0.5rem 0',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h2>About Cameroon Legal Assistant</h2>
            <p style={{ marginTop: '1rem' }}>
              This AI-powered legal assistant provides information about Cameroonian law and legal procedures.
              Designed to improve access to legal information for all Cameroonians.
            </p>
            <p style={{ marginTop: '1rem' }}>
              While this tool provides legal information, it is not a substitute for professional legal advice.
            </p>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              color: 'white', 
              padding: '2rem', 
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              margin: '0.5rem 0',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h2>Settings</h2>
            <div style={{ marginTop: '2rem' }}>
              <h3>Language</h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => setLanguage('en')}
                  style={{
                    background: language === 'en' ? '#1e40af' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('fr')}
                  style={{
                    background: language === 'fr' ? '#1e40af' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.7rem 1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Français
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return tools.chat.component;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Header />
        <ContentWrapper>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <MainContent>
            {renderContent()}
          </MainContent>
        </ContentWrapper>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
