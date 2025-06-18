import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiBookOpen, FiSearch, FiSend } from 'react-icons/fi';
import Markdown from 'react-markdown';

// Define ALL styled components outside of your component function
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  color: white;
  margin: 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #10b981;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center; // Center messages horizontally
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const UserMessage = styled.div`
  display: flex;
  margin-bottom: 16px;
  gap: 12px;
  width: 90%;
  max-width: 900px;
  justify-content: center;
`;

const BotMessage = styled.div`
  display: flex;
  margin-bottom: 16px;
  gap: 12px;
  width: 90%;
  max-width: 900px;
  justify-content: center;
  
  &.error-message {
    .message-text {
      color: #f87171;
      background: rgba(248, 113, 113, 0.1);
    }
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  flex-shrink: 0;
`;

const BotAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  
  @media (max-width: 768px) {
    width: 95%;
  }
`;

const MessageText = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.6;
  width: 100%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  
  p {
    margin: 0 0 0.75rem 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  code {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.75rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0.75rem 0;
    
    code {
      background: transparent;
      padding: 0;
    }
  }
`;

const UserMessageText = styled(MessageText)`
  background: rgba(59, 130, 246, 0.2);
  color: white;
  border-radius: 16px;
  text-align: center;
`;

const BotMessageText = styled(MessageText)`
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  text-align: left;
  
  h3 {
    font-size: 1rem;
    color: #60a5fa;
    margin-top: 0.8rem;
    margin-bottom: 0.3rem;
    border-bottom: 1px solid rgba(96, 165, 250, 0.2);
    padding-bottom: 0.3rem;
  }
  
  h3:first-of-type {
    margin-top: 0;
  }
`;

const MessageTime = styled.div`
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  
  .source-tag {
    background: rgba(255, 255, 255, 0.1);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.65rem;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const Input = styled.textarea`
  width: 100%;
  padding: 12px;
  padding-right: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  overflow: hidden;
  height: 48px;
  max-height: 120px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const SendButton = styled.button`
  background: rgba(59, 130, 246, 0.2);
  border: none;
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(59, 130, 246, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SourceIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 4px;
  padding: 2px 6px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  width: fit-content;
  margin: 0 auto 8px auto;
`;

const SearchSourceIndicator = styled(SourceIndicator)`
  background: rgba(99, 102, 241, 0.15);
  border-radius: 12px;
  padding: 4px 10px;
  
  svg {
    color: #6366f1;
    margin-right: 6px;
  }
`;

const BotTypingIndicator = styled(motion.div)`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  width: 100%;
  justify-content: center;

  .dots {
    display: flex;
    align-items: center;
  }
  
  .dot {
    background-color: #8a9aa8;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    margin: 0 2px;
  }
`;

// ChatInterface component
const ChatInterface = ({ language = 'en' }) => {
  // Define all state variables consistently
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Define refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // API URL
  const API_URL = "http://localhost:8000";

  // Auto-scroll when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Adjust textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: language === 'en' 
          ? "Hello! I'm your Cameroonian Legal Assistant. Ask me any question about Cameroonian law and governance."
          : "Bonjour! Je suis votre Assistant Juridique Camerounais. Posez-moi n'importe quelle question sur le droit et la gouvernance du Cameroun.",
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [language]);

  // Fixed handleSend function - no parameter to avoid preventDefault issues
  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    // Add user message
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Add loading indicator
    const loadingId = `loading-${Date.now()}`;
    setMessages(prevMessages => [
      ...prevMessages, 
      {
        id: loadingId,
        sender: 'bot',
        isLoading: true,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    
    // Save the current input before clearing
    const currentInput = input;
    
    // Clear input
    setInput('');
    setIsLoading(true);

    // Make API call
    axios.post(`${API_URL}/ask`, {
      question: currentInput,
      language
    })
      .then(response => {
        // Only proceed if response and response.data exist
        if (response && response.data) {
          setMessages(prevMessages => {
            return prevMessages
              .filter(msg => !msg.isLoading)
              .concat({
                id: `bot-${Date.now()}`,
                text: response.data.answer || "I couldn't process that question.",
                sender: 'bot',
                source: response.data.source || 'AI',
                timestamp: new Date().toLocaleTimeString()
              });
          });
        } else {
          throw new Error("Invalid response format");
        }
      })
      .catch(error => {
        console.error('API Error:', error);
        
        setMessages(prevMessages => {
          return prevMessages
            .filter(msg => !msg.isLoading)
            .concat({
              id: `error-${Date.now()}`,
              text: language === 'en' 
                ? "I'm having trouble connecting to the database. Please try again in a moment." 
                : "J'ai des difficultés à me connecter à la base de données. Veuillez réessayer dans un instant.",
              sender: 'bot',
              isError: true,
              timestamp: new Date().toLocaleTimeString()
            });
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <FiBookOpen />
          {language === 'en' ? 'Cameroonian Legal Assistant' : 'Assistant Juridique Camerounais'}
        </Title>
      </Header>
      
      <MessagesContainer>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              layout
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              {message.sender === 'user' ? (
                <UserMessage>
                  <MessageContent>
                    <UserMessageText>{message.text}</UserMessageText>
                    <MessageTime>{message.timestamp}</MessageTime>
                  </MessageContent>
                  <UserAvatar>
                    <FiUser />
                  </UserAvatar>
                </UserMessage>
              ) : message.isLoading ? (
                <BotMessage>
                  <BotAvatar>
                    <FiBookOpen />
                  </BotAvatar>
                  <BotTypingIndicator
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="dots">
                      <motion.div 
                        className="dot" 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, repeatDelay: 0.2, delay: 0 }}
                      />
                      <motion.div 
                        className="dot" 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, repeatDelay: 0.2, delay: 0.2 }}
                      />
                      <motion.div 
                        className="dot" 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, repeatDelay: 0.2, delay: 0.4 }}
                      />
                    </div>
                  </BotTypingIndicator>
                </BotMessage>
              ) : (
                <BotMessage className={message.isError ? 'error-message' : ''}>
                  <BotAvatar>
                    {message.source && message.source.includes("DuckDuckGo") ? (
                      <FiSearch />
                    ) : (
                      <FiBookOpen />
                    )}
                  </BotAvatar>
                  <MessageContent>
                    {message.source && message.source.includes("DuckDuckGo") ? (
                      <SearchSourceIndicator>
                        <FiSearch size={14} />
                        <span>Search Results</span>
                      </SearchSourceIndicator>
                    ) : message.source === "Government" ? (
                      <SearchSourceIndicator style={{ background: "rgba(16, 185, 129, 0.15)" }}>
                        <FiBookOpen size={14} />
                        <span>Government</span>
                      </SearchSourceIndicator>
                    ) : message.source === "Judiciary" || message.source === "Legal System" ? (
                      <SearchSourceIndicator style={{ background: "rgba(59, 130, 246, 0.15)" }}>
                        <FiBookOpen size={14} />
                        <span>{message.source}</span>
                      </SearchSourceIndicator>
                    ) : null}
                    <BotMessageText className="message-text">
                      <Markdown>{typeof message.text === 'string' ? message.text : ''}</Markdown>
                    </BotMessageText>
                    <MessageTime>
                      {message.timestamp}
                      {message.source && !message.source.includes("DuckDuckGo") && (
                        <span className="source-tag">
                          {message.source === "out_of_scope" 
                            ? (language === 'en' ? 'Information' : 'Information')
                            : message.source}
                        </span>
                      )}
                    </MessageTime>
                  </MessageContent>
                </BotMessage>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </MessagesContainer>
      
      <InputContainer>
        <InputWrapper>
          <Input
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'en' ? 'Type your question here...' : 'Tapez votre question ici...'}
            rows={1}
          />
        </InputWrapper>
        <SendButton onClick={handleSend} disabled={isLoading || !input.trim()}>
          <FiSend />
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default ChatInterface;