import { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiUpload, FiFileText, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const API_URL = 'http://localhost:8000';

const AnalyzerContainer = styled(motion.div)`
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0.5rem 0;
  flex: 1;
`;

const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: white;
  
  svg {
    font-size: 1.8rem;
    opacity: 0.9;
    color: white;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.05);
  
  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.7);
`;

const UploadText = styled.div`
  font-size: 1.1rem;
  text-align: center;
  color: white;
  
  p {
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
    opacity: 0.6;
    color: white;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadedFile = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  color: white;
`;

const FileIcon = styled.div`
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.8);
`;

const FileDetails = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 0.3rem;
    color: white;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.7;
    color: white;
  }
`;

const AnalyzeButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
  color: white;
`;

const ResultCard = styled.div`
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  color: white;
  
  h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0;
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
  }
  
  p {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: white;
  }
  
  ul {
    color: white;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.3rem;
    }
  }
`;

const KeyFindings = styled.div`
  margin-top: 1.5rem;
`;

const Finding = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin-bottom: 1rem;
  color: white;
  
  svg {
    margin-top: 0.2rem;
    font-size: 1.2rem;
    min-width: 1.2rem;
    color: ${props => props.$type === 'alert' ? '#ec4899' : '#22c55e'};
  }
  
  p {
    color: white;
  }
`;

const DocumentAnalyzer = ({ language = 'en' }) => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResults(null);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const analyzeDocument = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    
    // In a real implementation, we would upload the file and analyze it
    // For now, we'll simulate a response after a delay
    setTimeout(() => {
      // Mock analysis results
      setResults({
        documentType: language === 'en' ? 'Legal Contract' : 'Contrat Juridique',
        summary: language === 'en' 
          ? 'This document appears to be a standard employment contract under Cameroonian labor law. It outlines the terms of employment including salary, work hours, and termination conditions.'
          : 'Ce document semble être un contrat de travail standard selon le droit du travail camerounais. Il décrit les conditions d\'emploi, y compris le salaire, les heures de travail et les conditions de résiliation.',
        keyFindings: [
          {
            type: 'alert',
            text: language === 'en'
              ? 'Clause 5.2 may not comply with current labor regulations regarding overtime compensation.'
              : 'La clause 5.2 pourrait ne pas être conforme aux réglementations actuelles du travail concernant la rémunération des heures supplémentaires.'
          },
          {
            type: 'info',
            text: language === 'en'
              ? 'The probation period specified (6 months) exceeds the maximum allowed under Cameroonian labor code (3 months).'
              : 'La période d\'essai spécifiée (6 mois) dépasse le maximum autorisé par le code du travail camerounais (3 mois).'
          },
          {
            type: 'success',
            text: language === 'en'
              ? 'The contract includes all required legal mentions as per Article 23 of the Labor Code.'
              : 'Le contrat comprend toutes les mentions légales requises selon l\'article 23 du Code du Travail.'
          }
        ],
        relevantLaws: [
          'Cameroon Labor Code, Article 23',
          'Cameroon Labor Code, Article 80-82 (Overtime)',
          'Ministerial Order No. 016/MTPS/SG/CJ (Probation Period)'
        ]
      });
      
      setIsAnalyzing(false);
    }, 2000);
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <AnalyzerContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Title>
        <FiFileText />
        {language === 'en' ? 'Legal Document Analyzer' : 'Analyseur de Documents Juridiques'}
      </Title>
      
      <FileInput
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        ref={fileInputRef}
      />
      
      {!file ? (
        <UploadArea 
          onClick={handleUploadClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <UploadIcon>
            <FiUpload />
          </UploadIcon>
          <UploadText>
            {language === 'en' ? 'Upload a legal document' : 'Télécharger un document juridique'}
            <p>
              {language === 'en' 
                ? 'Drag and drop or click to browse' 
                : 'Glisser-déposer ou cliquer pour parcourir'}
            </p>
          </UploadText>
        </UploadArea>
      ) : (
        <>
          <UploadedFile>
            <FileIcon>
              <FiFileText />
            </FileIcon>
            <FileDetails>
              <h4>{file.name}</h4>
              <p>{formatFileSize(file.size)}</p>
            </FileDetails>
          </UploadedFile>
          
          <AnalyzeButton 
            onClick={analyzeDocument}
            disabled={isAnalyzing}
          >
            {isAnalyzing 
              ? (language === 'en' ? 'Analyzing...' : 'Analyse en cours...') 
              : (language === 'en' ? 'Analyze Document' : 'Analyser le Document')}
          </AnalyzeButton>
        </>
      )}
      
      {results && (
        <ResultsContainer>
          <ResultCard>
            <h4>{language === 'en' ? 'Document Type' : 'Type de Document'}: {results.documentType}</h4>
            <p>{results.summary}</p>
            
            <KeyFindings>
              <h4>{language === 'en' ? 'Key Findings' : 'Conclusions Principales'}</h4>
              
              {results.keyFindings.map((finding, index) => (
                <Finding key={index} $type={finding.type}>
                  {finding.type === 'alert' ? <FiAlertCircle /> : <FiCheckCircle />}
                  <p>{finding.text}</p>
                </Finding>
              ))}
            </KeyFindings>
            
            <div>
              <h4>{language === 'en' ? 'Relevant Laws' : 'Lois Pertinentes'}</h4>
              <ul>
                {results.relevantLaws.map((law, index) => (
                  <li key={index}>{law}</li>
                ))}
              </ul>
            </div>
          </ResultCard>
        </ResultsContainer>
      )}
    </AnalyzerContainer>
  );
};

export default DocumentAnalyzer;