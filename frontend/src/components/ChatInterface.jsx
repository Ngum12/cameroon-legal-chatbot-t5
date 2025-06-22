import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiBookOpen, FiSearch, FiSend } from 'react-icons/fi';
import Markdown from 'react-markdown';

// Add the CameroonFlag component directly with inline SVG
const CameroonFlag = styled.div`
  width: 36px;
  height: 24px;
  margin-right: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  flex-shrink: 0;
`;

// Modified Container with Cameroon map background
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cpath fill='%23ffffff' d='M435.8,131.2c-4.1,3.2-8.6,5.9-12.6,9.2c-3.9,3.3-7.4,6.9-11.1,10.4c-1.7,1.6-3,3.2-4.7,4.5c1,3.1,4.7,10.8,5.7,13.9c-3.4,6.4-8.1,9.4-14.9,11.6c-6.3,2-11.7,3.9-17.5,7.1c-7.3,4-10.4,11.5-16,17.4c-1.7,1.7-2.9,3.8-3.9,6c-1.3,3-2.3,6.1-3.6,9.1c-2.1,5-4.8,9.6-6.8,14.5c-1.9,4.6-3.5,9.4-5.3,14c-0.5,1.3-1.4,2.4-2.1,3.6c-4.7,7.3-8.5,15.2-12.6,22.9c-2.6,4.9-1.2,5.1,1.5,9.5c-0.9,1.1-1.9,2.3-2.8,3.4c-4.4,4.8-10.4,7.6-16.8,8.2c-6.5,0.6-13.3-0.2-19.8-0.4c-1.5,0-3.2-0.2-4.6,0.1c-10.5,2.4-21,4.8-31.5,7.3c-2,0.5-3.9,1.8-5.7,2.8c-5.8,3-8.9,7.9-12.9,13c-2.5,3.1-5.4,3.6-8.9,5.6c-2,1.1-7.8,4.3-9.4,5.9c-2,2-3.5,4.6-4.7,7.2c-3.1,6.7-5.7,12.8-10,18.7c-5,6.8-11.3,13.1-17.6,18.8c-2.4,2.1-4.2,4.8-6.1,7.4c-1.6,2.1-3.6,3.1-5.9,3.9c-4.6,1.6-9.8,2.3-14.3,4.4c-2.4,1.1-4.2,2.6-6.3,4.5c-4.2,3.8-8.7,8.2-12.7,12.3c4,0.9,10.2,0.3,14.4,1c5.4,0.8,7.5,5.5,8.7,10.3c1.8,6.8,2.5,13.9,5.3,20.4c1.4,3.2,3.8,5.8,6,8.4c2.9,3.4,5.9,6.7,8.9,9.9c3.4,3.6,7.4,6.2,12.1,7.5c3,0.8,6.1,0.9,9.2,0.9c6.2,0.1,12.5-0.4,18.7-0.6c2.4,2.4,5,6,7.8,8c4.5,3.2,11.8,3.1,16.9,2.2c5.1-0.9,10.2-2.2,15.2-3.8c3.4-1.1,6.8-2.9,10.2-3.9c2.3-0.7,4.6-1.2,7-1.6c9.7-1.8,19.8-2.9,29.6-3.3c4.1-0.1,8.5-0.4,12.3,1.4c2.2,1,3.9,2.8,5.8,4.2c3.9,2.9,8.1,4.9,12.8,5.7c6.7,1.2,13.6,0.7,20.2-0.5c3.2-0.6,6.3-1.5,9.5-2.4c2.4-0.7,4.6-1.4,7.1-1.8c2.3-0.4,4.6-0.3,6.9-0.2c7.7,0.4,15.4,2,23,3c2.1,0.3,4.2,0.6,6.3,0.7c8.5,0.5,17.1-0.2,25.5,0.8c4.2,0.5,8.3,1.1,12.5,1.5c4.9,0.5,9.9,0.6,14.8,0.9c2.6,0.2,5,0.8,7.5,1.6c4.2,1.3,8.3,3,12.6,3.9c4.7,1,9.6,1.1,14.4,0.5c2.2-0.3,4.3-0.9,6.5-1.1c2-0.2,4.2,0.1,6.2,0.5c3.3,0.7,6.3,2.1,9.8,2c6-0.1,11.9-1.2,17.9-1.7c6.7-0.5,11.8-4.9,17.9-6.7c3.7-1.1,7.5-2.7,11.2-3.8c4.1-1.2,8.2-2.2,12.3-3.3c4.3-1.2,8.6-2.4,12.9-3.7c4.7-1.4,9.5-2.9,14.3-4.1c1.2-0.3,2.4-0.3,3.7-0.5c6.2-0.9,12.5-1.7,18.7-2.5c2.6-0.3,5.2-0.5,7.7-0.5c3.9,0,7.6-0.3,11.5-0.4c3.9,0,7.9-0.1,11.8,0c3.8,0.1,7.5,0.7,11.2,1.4c7.3,1.4,14.7,2.7,22,4.1c0.5,0.1,1,0.7,1.3,1.2c3.8,7,7.5,14,11.3,21c0.2,0.3,0.4,0.7,0.6,0.9c7.2,5.2,14.4,10.4,21.6,15.6c0.2,0.1,0.5,0.1,0.8,0.1c3.9,0,7.8,0.1,11.7,0c1-0.1,2.5-0.6,3-1.3c2-3,3.7-6.1,5.5-9.1c0.5-0.9,1.1-2,1-3c-0.7-10.9-1.5-21.7-2.4-32.6c-0.1-0.8-0.5-1.6-0.7-2.4c-2-5.7-1.9-11.7-2.3-17.6c-0.3-4.7-0.8-9.5-1.1-14.2c-0.2-3.6-0.2-7.3-0.3-10.9c-0.1-10.9-0.2-21.7-0.4-32.6c0-1.8-0.4-3.5-0.5-5.3c-0.9-19.3-1.9-38.6-2.8-57.9c-0.4-8.9-0.8-17.7-1.2-26.6c-0.2-5.9-0.4-11.7-0.8-17.6c-0.1-1.8-0.7-3.6-1-5.4c-1.3-9-2.5-18-4-26.9c-0.8-4.7-1.9-9.4-3.1-14c-0.3-1.1-1.5-1.9-2.2-2.8c-0.7-0.9-1.9-1.8-2-2.7c-0.5-4.9-0.9-9.8-1-14.7c-0.1-3.3,0.5-6.6,0.6-9.9c0.1-3.3-0.1-6.7-0.2-10.1c0.1-0.4,0.2-0.8,0.3-1.2c2.2-8.7,8-15.6,12.8-23c2.2-3.3,4.4-6.7,6.3-10.2c1.5-2.8,2.2-6,3.2-8.9c0.7-2.1,1.3-4.3,2.1-6.4c2-5.3,6-9.6,9.7-13.9c1.3-1.5,3-2.6,4.4-4c2.5-2.6,4.8-5.5,7.4-8c3.2-3.1,6.6-6,9.9-9c0.3-0.3,0.7-0.6,0.8-0.9c1.3-3.4,2.7-6.9,3.8-10.4c1-3.1,1.7-6.4,2.6-9.6c0.2-0.8,0.7-1.7,1.3-2.2c2.9-2.5,5.9-5,8.9-7.4c1.7-1.4,3.6-2.6,5.3-3.9c1.1-0.8,2.5-1.5,3.1-2.6c2-3.4,3.9-6.9,5.8-10.4c0.3-0.5,0.4-1.1,0.6-1.7c1.9-5.7,3.7-11.3,5.6-17c0.2-0.7,0.6-1.3,0.9-1.9c2.3-4.9,4.6-9.9,6.9-14.8c1.1-2.5,1.8-5.2,3.2-7.4c2.2-3.4,4.8-6.4,7.4-9.6c1-1.2,2.2-2.1,3.3-3.2c2.3-2.1,4.5-4.3,6.8-6.3c2.1-1.8,4.2-3.6,6.5-5.1c1-0.6,2.7-0.6,3.9-0.4c2.6,0.5,5.2,1.5,7.8,2c1.1,0.2,2.7-0.5,3.3-1.4c1.2-1.7,2.1-3.6,2.8-5.6c1.5-4.3,2.8-8.7,4-13.1c0.8-2.6,1.3-5.4,2-8.1c0.2-0.9,0.7-1.8,0.9-2.7c1.6-8.3,3.1-16.6,4.7-24.9c0.1-0.5,0.3-1.1,0.6-1.5c2.1-2.7,4.2-5.3,6.3-8c1.5-1.9,2.7-4.1,4.3-6c2.1-2.6,4.4-5,6.6-7.4c0.4-0.4,0.9-0.8,1.1-1.3c3.3-6.8,6.5-13.6,9.8-20.5c0.3-0.7,0.8-1.3,1.2-2c0.6,3.7,1.3,7.4,1.7,11.2c0.5,4.6,0.6,9.2,1,13.8c0.4,4.4,1.1,8.7,1.4,13.1c0.4,6.1,0.6,12.3,0.8,18.4c0.3,5.9,0.6,11.8,0.8,17.8c0.1,2.8,0,5.7-0.1,8.5c0,0.5-0.2,0.9-0.3,1.6c-2.4,0.3-5.2,0.3-7.4,1.2c-4.3,1.7-8.5,3.8-12.5,6c-6,3.3-10.1,8.7-15.4,12.8c-2.7,2-5,4.6-6.8,7.3c-2.7,3.8-5,7.9-7.3,12c-1.7,3-3,6.2-4.5,9.2c-0.7,1.5-1.7,2.7-2.6,4.1c-10.5-2.3-20.9-4.6-31.4-6.8c-3.6-0.8-7.3-1.2-10.9-1.9c-12.6-2.5-22.4,4-31.6,11.2c-1.9,1.5-3.9,2.9-5.8,4.5c-1.7,1.5-3.1,3.1-4.6,4.8c-3.3,3.8-6.4,7.7-9.7,11.5c-1.2,1.4-2.6,2.6-3.9,3.9c-1,0.9-2,1.7-3,2.5c-5.5-2.7-10.8-5.3-16.3-8c-2.7-1.3-5.8-2.4-8.7-2.5c-2.8-0.1-5.6,1-8.4,1.7c-5.6,1.3-11.2,2.8-16.8,4.1c-2.2,0.5-4.4,1-6.6,1.2c-8.1,0.8-16.1,1.4-24.2,2.1c-2.1,0.2-4.3,0.4-6.4,0.6c-5.5,0.5-11,1.1-16.6,1.3c-3.9,0.1-7.8-0.6-11.8-0.8c-4.1-0.3-8.2-0.8-12.3-0.5c-7.3,0.7-14.6,1.9-21.9,3c-4,0.6-7.9,1.7-11.9,2.6c-1.7,0.4-3.5,1.1-5.2,1c-5.2-0.3-10.3-0.8-15.5-1.3c-2.1-0.2-4.2-0.2-6.3-0.3c-3.9-0.1-7.7-0.1-11.6-0.2c-0.8,0-1.6-0.1-2.4-0.3c-1.6-0.4-3.1-0.9-4.7-1.2c-2.8-0.5-5.7-0.9-8.5-1.3c-0.6-0.1-1.2-0.1-1.8,0c-4.4,0.8-8.8,1.8-13.3,2.4c-4.1,0.5-8.3,0.6-12.4,0.9c-0.5,0-0.9,0.1-1.4,0c-5.3-0.4-10.7-0.7-16-1.3c-4.4-0.5-8.8-1.5-13.1-2.2c-3.2-0.5-6.2-1.6-9.2-0.8c-1.5,0.4-3,0.9-4.4,1.4c-10.5,3.8-21,7.5-31.4,11.3c-2.2,0.8-4.4,1.7-6.4,2.8c-3.8,2-5.7,4.2-5.6,9.9C435.5,129.7,435.7,130.4,435.8,131.2z'/%3E%3C/svg%3E");
    background-size: 70%;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
  }
`;

// Update your Header component
const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
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

// Updated MessagesContainer to work with the background
const MessagesContainer = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  position: relative;
  z-index: 1;
  
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
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    axios.post(`${apiUrl}/ask`, {
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
          <CameroonFlag>
            {/* Inline Cameroon Flag SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="100%" height="100%">
              <rect fill="#007a5e" width="300" height="600"/>
              <rect fill="#ce1126" x="300" width="300" height="600"/>
              <rect fill="#fcd116" x="600" width="300" height="600"/>
              <path fill="#fcd116" d="M450,300 l-95.1,69.1 36.3,-112.3 -95,-69.2 117.4,-0.1 36.4,-112.2 36.4,112.2 117.4,0.1 -95,69.2 36.3,112.3z"/>
            </svg>
          </CameroonFlag>
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