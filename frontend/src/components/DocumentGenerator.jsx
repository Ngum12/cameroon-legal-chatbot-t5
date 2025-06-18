import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiFilePlus, FiDownload, FiChevronDown, FiCheck, FiMapPin } from 'react-icons/fi';
// New imports for enhanced functionality
import SignatureCanvas from 'react-signature-canvas'; // npm install react-signature-canvas
import jsPDF from 'jspdf'; // npm install jspdf

// Constants for legal references
const legalReferences = {
  'property': {
    en: 'Per Land Ordinance 1974, Section 8(1)(d)',
    fr: 'Selon l\'Ordonnance Foncière 1974, Section 8(1)(d)'
  },
  'inheritance': {
    en: 'Civil Status Registration Ordinance No. 81-02 of June 29, 1981',
    fr: 'Ordonnance n° 81-02 du 29 juin 1981 portant organisation de l\'état civil'
  },
  'labor': {
    en: 'Labour Code, Law No. 92/007 of August 14, 1992',
    fr: 'Code du Travail, Loi n° 92/007 du 14 août 1992'
  },
  'divorce': {
    en: 'Civil Status Registration Ordinance No. 81-02 of June 29, 1981, Section 64',
    fr: 'Ordonnance n° 81-02 du 29 juin 1981 portant organisation de l\'état civil, Section 64'
  },
  'commercial': {
    en: 'OHADA Uniform Act on Commercial Companies and Economic Interest Groups',
    fr: 'Acte uniforme OHADA relatif au droit des sociétés commerciales et du groupement d\'intérêt économique'
  }
};

// Constants for Cameroonian courts by region
const cameroonianCourts = {
  'northwest': {
    name: {
      en: 'High Court of Northwest Region',
      fr: 'Haute Cour de la Région du Nord-Ouest'
    },
    format: 'common_law',
    address: 'P.O. Box 130, Bamenda'
  },
  'southwest': {
    name: {
      en: 'High Court of Southwest Region',
      fr: 'Haute Cour de la Région du Sud-Ouest'
    },
    format: 'common_law',
    address: 'P.O. Box 121, Buea'
  },
  'center': {
    name: {
      en: 'Tribunal of Grande Instance of Center Region',
      fr: 'Tribunal de Grande Instance de la Région du Centre'
    },
    format: 'civil_law',
    address: 'Centre-ville, Yaoundé'
  },
  'littoral': {
    name: {
      en: 'Tribunal of Grande Instance of Littoral Region',
      fr: 'Tribunal de Grande Instance de la Région du Littoral'
    },
    format: 'civil_law',
    address: 'Downtown, Douala'
  },
  'west': {
    name: {
      en: 'Tribunal of Grande Instance of West Region',
      fr: 'Tribunal de Grande Instance de la Région de l\'Ouest'
    },
    format: 'civil_law',
    address: 'Bafoussam'
  }
};

// Helper function for automatic reference suggestions
const suggestReferences = (text, language) => {
  if (!text) return [];
  const references = [];
  
  // Simple keyword matching
  if (text.match(/property|land|plot|house|terrain|propriété|parcelle|maison/i)) {
    references.push(legalReferences.property[language]);
  }
  if (text.match(/inherit|will|testament|estate|hériter|héritage|testament/i)) {
    references.push(legalReferences.inheritance[language]);
  }
  if (text.match(/employ|work|job|travail|emploi|employé|salarié/i)) {
    references.push(legalReferences.labor[language]);
  }
  if (text.match(/divorce|separation|séparation/i)) {
    references.push(legalReferences.divorce[language]);
  }
  if (text.match(/business|company|contract|entreprise|société|contrat/i)) {
    references.push(legalReferences.commercial[language]);
  }
  
  return references;
};

const GeneratorContainer = styled(motion.div)`
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
  overflow: hidden; /* Prevent overall container from scrolling */
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

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const Select = styled.select`
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  
  option {
    background: #1e3a8a;
    color: white;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const GenerateButton = styled.button`
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    font-size: 1.3rem;
  }
`;

const Result = styled(motion.div)`
  margin-top: 2rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const DownloadButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

const DocumentPreview = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Times New Roman', serif;
  line-height: 1.6;
  max-height: 500px; /* Limit height for preview */
  overflow-y: auto; /* Make the preview scrollable */
  
  /* Custom scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const InfoCard = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  
  svg {
    font-size: 1.2rem;
    color: #3b82f6;
    margin-top: 0.2rem;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const ReferenceCard = styled.div`
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  
  h4 {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    color: white;
  }
  
  ul {
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
    }
  }
`;

const SignatureBox = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: white;
  border-radius: 8px;
  height: 200px;
  width: 100%;
  overflow: hidden;
  
  canvas {
    width: 100%;
    height: 100%;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const SmallButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  
  /* Custom scrollbar for Webkit browsers */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
  
  /* Add padding to prevent content from being cut off */
  padding-right: 8px;
`;

const DocumentGenerator = ({ language = 'en' }) => {
  // Enhanced form data with additional fields
  const [formData, setFormData] = useState({
    documentType: 'complaint',
    fullName: '',
    address: '',
    phoneNumber: '',
    email: '',
    description: '',
    // New fields for expanded templates
    courtRegion: '',
    executorName: '',
    assets: '',
    beneficiaries: '',
    employerName: '',
    employeeRole: '',
    startDate: '',
    salary: ''
  });
  
  // Add state for references and signature
  const [references, setReferences] = useState([]);
  const [signature, setSignature] = useState(null);
  const sigCanvas = useRef(null);
  
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Auto-detect relevant legal references
  useEffect(() => {
    if (formData.description) {
      const suggestedRefs = suggestReferences(formData.description, language);
      setReferences(suggestedRefs);
    }
  }, [formData.description, language]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setGenerating(true);
    
    // Simulate document generation with delay
    setTimeout(() => {
      setGenerated(true);
      setGenerating(false);
    }, 1500);
  };
  
  // Signature functions
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setSignature(null);
    }
  };
  
  const saveSignature = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      setSignature(dataUrl);
    }
  };
  
  // Enhanced document types
  const documentTypes = [
    { id: 'complaint', label: language === 'en' ? 'Legal Complaint' : 'Plainte Juridique' },
    { id: 'contract', label: language === 'en' ? 'Employment Contract' : 'Contrat de Travail' },
    { id: 'will', label: language === 'en' ? 'Last Will & Testament' : 'Testament' },
    { id: 'lease', label: language === 'en' ? 'Lease Agreement' : 'Contrat de Bail' },
    { id: 'appeal', label: language === 'en' ? 'Appeal Letter' : 'Lettre d\'Appel' },
    { id: 'affidavit', label: language === 'en' ? 'Affidavit' : 'Déclaration Sous Serment' }
  ];
  
  // Render form fields based on document type
  const renderFormFields = () => {
    // Common fields for all document types
    const commonFields = (
      <>
        <FormGroup>
          <Label>{language === 'en' ? 'Full Name' : 'Nom Complet'}</Label>
          <Input 
            type="text" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleChange}
            placeholder={language === 'en' ? 'Enter your full name' : 'Entrez votre nom complet'}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>{language === 'en' ? 'Address' : 'Adresse'}</Label>
          <Input 
            type="text" 
            name="address" 
            value={formData.address} 
            onChange={handleChange}
            placeholder={language === 'en' ? 'Enter your address' : 'Entrez votre adresse'}
          />
        </FormGroup>
        
        <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <FormGroup style={{ flex: 1 }}>
            <Label>{language === 'en' ? 'Phone Number' : 'Numéro de Téléphone'}</Label>
            <Input 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange}
              placeholder={language === 'en' ? 'Enter your phone number' : 'Entrez votre numéro de téléphone'}
            />
          </FormGroup>
          
          <FormGroup style={{ flex: 1 }}>
            <Label>{language === 'en' ? 'Email' : 'Email'}</Label>
            <Input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              placeholder={language === 'en' ? 'Enter your email' : 'Entrez votre email'}
            />
          </FormGroup>
        </div>
      </>
    );
    
    // Court selection
    const courtSelection = (
      <FormGroup>
        <Label>
          <FiMapPin />
          {language === 'en' ? 'Court Jurisdiction' : 'Juridiction'}
        </Label>
        <SelectWrapper>
          <Select 
            name="courtRegion" 
            value={formData.courtRegion} 
            onChange={handleChange}
          >
            <option value="">--{language === 'en' ? 'Select Region' : 'Sélectionner Région'}--</option>
            {Object.keys(cameroonianCourts).map(region => (
              <option key={region} value={region}>
                {cameroonianCourts[region].name[language]}
              </option>
            ))}
          </Select>
          <FiChevronDown />
        </SelectWrapper>
      </FormGroup>
    );
    
    // Type-specific fields
    switch(formData.documentType) {
      case 'will':
        return (
          <>
            {commonFields}
            <FormGroup>
              <Label>{language === 'en' ? 'Executor Name' : 'Nom de l\'Exécuteur Testamentaire'}</Label>
              <Input 
                type="text"
                name="executorName"
                value={formData.executorName}
                onChange={handleChange}
                placeholder={language === 'en' ? 'Name of executor' : 'Nom de l\'exécuteur'}
              />
            </FormGroup>
            <FormGroup>
              <Label>{language === 'en' ? 'Assets' : 'Biens'}</Label>
              <TextArea 
                name="assets"
                value={formData.assets}
                onChange={handleChange}
                placeholder={language === 'en' ? 'List major assets to be distributed' : 'Listez les biens importants à distribuer'}
              />
            </FormGroup>
            <FormGroup>
              <Label>{language === 'en' ? 'Beneficiaries' : 'Bénéficiaires'}</Label>
              <TextArea 
                name="beneficiaries"
                value={formData.beneficiaries}
                onChange={handleChange}
                placeholder={language === 'en' ? 'List beneficiaries and what they receive' : 'Listez les bénéficiaires et ce qu\'ils reçoivent'}
              />
            </FormGroup>
          </>
        );
      
      case 'contract':
        return (
          <>
            {commonFields}
            <FormGroup>
              <Label>{language === 'en' ? 'Employer Name' : 'Nom de l\'Employeur'}</Label>
              <Input 
                type="text"
                name="employerName"
                value={formData.employerName}
                onChange={handleChange}
                placeholder={language === 'en' ? 'Name of employer/company' : 'Nom de l\'employeur/société'}
              />
            </FormGroup>
            <FormGroup>
              <Label>{language === 'en' ? 'Position/Role' : 'Poste/Rôle'}</Label>
              <Input 
                type="text"
                name="employeeRole"
                value={formData.employeeRole}
                onChange={handleChange}
                placeholder={language === 'en' ? 'Job title/position' : 'Titre du poste/fonction'}
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <FormGroup style={{ flex: 1 }}>
                <Label>{language === 'en' ? 'Start Date' : 'Date de Début'}</Label>
                <Input 
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup style={{ flex: 1 }}>
                <Label>{language === 'en' ? 'Monthly Salary (FCFA)' : 'Salaire Mensuel (FCFA)'}</Label>
                <Input 
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="FCFA"
                />
              </FormGroup>
            </div>
          </>
        );
        
      case 'complaint':
      default:
        return (
          <>
            {commonFields}
            {courtSelection}
            <FormGroup>
              <Label>{language === 'en' ? 'Description of Complaint' : 'Description de la Plainte'}</Label>
              <TextArea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                placeholder={language === 'en' 
                  ? 'Provide details for your complaint...' 
                  : 'Fournissez des détails pour votre plainte...'}
              />
            </FormGroup>
          </>
        );
    }
  };
  
  // Download as HTML
  const downloadDocument = () => {
    // Get the document content
    const documentContent = renderDocumentPreviewForDownload();
    
    // Create a blob with HTML content
    const blob = new Blob([documentContent], { type: 'text/html' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.documentType}_${formData.fullName.replace(/\s+/g, '_')}.html`;
    
    // Append to body, trigger download, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Download as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Set font size and add content
    doc.setFontSize(12);
    
    // Add date
    doc.text(new Date().toLocaleDateString(), 170, 20, { align: 'right' });
    
    // Add court header if applicable
    if (formData.courtRegion) {
      const court = cameroonianCourts[formData.courtRegion];
      doc.setFontSize(14);
      doc.text(court.name[language], 105, 40, { align: 'center' });
      doc.text(court.address, 105, 50, { align: 'center' });
      doc.setFontSize(12);
    } else {
      // Default header
      doc.setFontSize(14);
      doc.text(language === 'en' ? 'COURT OF FIRST INSTANCE' : 'TRIBUNAL DE PREMIÈRE INSTANCE', 105, 40, { align: 'center' });
      doc.text(language === 'en' ? 'REPUBLIC OF CAMEROON' : 'RÉPUBLIQUE DU CAMEROUN', 105, 50, { align: 'center' });
      doc.setFontSize(12);
    }
    
    // Add document-specific content
    switch(formData.documentType) {
      case 'will':
        // Will-specific formatting
        doc.text(`${language === 'en' ? 'LAST WILL AND TESTAMENT OF' : 'TESTAMENT DE'}`, 105, 70, { align: 'center' });
        doc.setFontSize(16);
        doc.text(formData.fullName.toUpperCase(), 105, 80, { align: 'center' });
        doc.setFontSize(12);
        
        // Personal details
        doc.text(`${language === 'en' ? 'I, ' : 'Je, soussigné(e) '}${formData.fullName}, ${language === 'en' ? 'residing at ' : 'domicilié(e) à '}${formData.address}...`, 20, 100);
        
        // Assets
        if (formData.assets) {
          doc.text(language === 'en' ? 'DISTRIBUTION OF ASSETS:' : 'DISTRIBUTION DES BIENS:', 20, 120);
          const assetsText = doc.splitTextToSize(formData.assets, 170);
          doc.text(assetsText, 20, 130);
        }
        
        // Beneficiaries
        if (formData.beneficiaries) {
          doc.text(language === 'en' ? 'BENEFICIARIES:' : 'BÉNÉFICIAIRES:', 20, 160);
          const benefText = doc.splitTextToSize(formData.beneficiaries, 170);
          doc.text(benefText, 20, 170);
        }
        
        // Executor
        if (formData.executorName) {
          doc.text(`${language === 'en' ? 'I appoint ' : 'Je nomme '}${formData.executorName}${language === 'en' ? ' as the executor of my will.' : ' comme exécuteur testamentaire.'}`, 20, 200);
        }
        break;
        
      case 'contract':
        // Employment contract
        doc.setFontSize(16);
        doc.text(language === 'en' ? 'EMPLOYMENT CONTRACT' : 'CONTRAT DE TRAVAIL', 105, 70, { align: 'center' });
        doc.setFontSize(12);
        
        // Parties
        doc.text(`${language === 'en' ? 'BETWEEN:' : 'ENTRE:'}`, 20, 90);
        doc.text(`${formData.employerName}${language === 'en' ? ', hereinafter referred to as "the Employer"' : ', ci-après dénommé "l\'Employeur"'}`, 30, 100);
        
        doc.text(`${language === 'en' ? 'AND:' : 'ET:'}`, 20, 120);
        doc.text(`${formData.fullName}${language === 'en' ? ', hereinafter referred to as "the Employee"' : ', ci-après dénommé "l\'Employé"'}`, 30, 130);
        
        // Terms
        doc.text(language === 'en' ? 'TERMS OF EMPLOYMENT:' : 'CONDITIONS D\'EMPLOI:', 20, 150);
        doc.text(`${language === 'en' ? 'Position: ' : 'Poste: '}${formData.employeeRole}`, 30, 160);
        if (formData.startDate) {
          doc.text(`${language === 'en' ? 'Start Date: ' : 'Date de début: '}${new Date(formData.startDate).toLocaleDateString()}`, 30, 170);
        }
        if (formData.salary) {
          doc.text(`${language === 'en' ? 'Salary: ' : 'Salaire: '}${formData.salary} FCFA ${language === 'en' ? 'per month' : 'par mois'}`, 30, 180);
        }
        break;
        
      case 'complaint':
      default:
        // Complaint formatting (existing functionality)
        doc.text(`${language === 'en' ? 'PLAINTIFF:' : 'PLAIGNANT:'} ${formData.fullName}`, 20, 70);
        doc.text(`${language === 'en' ? 'ADDRESS:' : 'ADRESSE:'} ${formData.address}`, 20, 80);
        doc.text(`${language === 'en' ? 'CONTACT:' : 'CONTACT:'} ${formData.phoneNumber}, ${formData.email}`, 20, 90);
        
        doc.text(`${language === 'en' ? 'DEFENDANT:' : 'DÉFENDEUR:'} [Defendant Name]`, 20, 110);
        doc.text(`${language === 'en' ? 'ADDRESS:' : 'ADRESSE:'} [Defendant Address]`, 20, 120);
        
        // Title
        doc.setFontSize(16);
        doc.text(language === 'en' ? 'COMPLAINT' : 'PLAINTE', 105, 140, { align: 'center' });
        
        // Content
        doc.setFontSize(12);
        const content = formData.description || (language === 'en' 
          ? 'The plaintiff, by and through the undersigned counsel, hereby files this Complaint against the Defendant and alleges as follows...'
          : 'Le plaignant, par l\'intermédiaire du conseil soussigné, dépose par la présente cette plainte contre le défendeur et allègue ce qui suit...');
        
        // Handle multi-line text
        const splitContent = doc.splitTextToSize(content, 170);
        doc.text(splitContent, 20, 160);
        
        // Add legal references if any
        if (references.length > 0) {
          doc.text(language === 'en' ? 'LEGAL REFERENCES:' : 'RÉFÉRENCES JURIDIQUES:', 20, 200);
          references.forEach((ref, idx) => {
            doc.text(`- ${ref}`, 25, 210 + (idx * 10));
          });
        }
    }
    
    // Common footer for all document types
    doc.text(language === 'en' ? 'Respectfully submitted,' : 'Respectueusement soumis,', 20, 240);
    
    // Add signature if provided
    if (signature) {
      doc.addImage(signature, 'PNG', 20, 250, 50, 20);
    } else {
      doc.text('____________________________', 20, 260);
    }
    
    doc.text(formData.fullName, 20, 270);
    
    // Add date at bottom
    doc.text(new Date().toLocaleDateString(), 20, 280);
    
    // Save PDF
    doc.save(`${formData.documentType}_${formData.fullName.replace(/\s+/g, '_')}.pdf`);
  };
  
  // Format HTML for download
  const renderDocumentPreviewForDownload = () => {
    const title = (() => {
      switch(formData.documentType) {
        case 'will': return language === 'en' ? 'Last Will and Testament' : 'Testament';
        case 'contract': return language === 'en' ? 'Employment Contract' : 'Contrat de Travail';
        case 'lease': return language === 'en' ? 'Lease Agreement' : 'Contrat de Bail';
        case 'complaint': default: return language === 'en' ? 'Legal Complaint' : 'Plainte Juridique';
      }
    })();
    
    // Court header
    const courtHeader = formData.courtRegion ? 
      `<strong>${cameroonianCourts[formData.courtRegion].name[language]}</strong><br/>${cameroonianCourts[formData.courtRegion].address}` :
      `<strong>${language === 'en' ? 'TO THE COURT OF FIRST INSTANCE' : 'AU TRIBUNAL DE PREMIÈRE INSTANCE'}</strong><br/>${language === 'en' ? 'IN AND FOR THE JUDICIAL DISTRICT OF CAMEROON' : 'DANS ET POUR LE DISTRICT JUDICIAIRE DU CAMEROUN'}`;
    
    // Build HTML based on document type
    let documentHtml = '';
    switch(formData.documentType) {
      case 'will':
        documentHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${title} - ${formData.fullName}</title>
            <style>
              body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1, h2, h3 { text-align: center; }
              .date { text-align: right; margin-bottom: 30px; }
              .header { margin-bottom: 30px; }
              .footer { margin-top: 50px; }
              .signature { margin-top: 30px; }
              .signature-line { margin-top: 30px; border-top: 1px solid #000; display: inline-block; width: 200px; }
            </style>
          </head>
          <body>
            <div class="date">${new Date().toLocaleDateString()}</div>
            
            <h2>${language === 'en' ? 'LAST WILL AND TESTAMENT OF' : 'TESTAMENT DE'}</h2>
            <h1>${formData.fullName.toUpperCase()}</h1>
            
            <p>
              ${language === 'en' ? 
                `I, <strong>${formData.fullName}</strong>, a resident of <strong>${formData.address}</strong>, being of sound mind, hereby revoke all previous wills and codicils and declare this to be my Last Will and Testament.` : 
                `Je, soussigné(e) <strong>${formData.fullName}</strong>, domicilié(e) à <strong>${formData.address}</strong>, sain(e) d'esprit, révoque par la présente tous testaments et codicilles antérieurs et déclare que ceci est mon Testament.`}
            </p>
            
            ${formData.assets ? `
            <h3>${language === 'en' ? 'DISTRIBUTION OF ASSETS' : 'DISTRIBUTION DES BIENS'}</h3>
            <p>${formData.assets.replace(/\n/g, '<br/>')}</p>
            ` : ''}
            
            ${formData.beneficiaries ? `
            <h3>${language === 'en' ? 'BENEFICIARIES' : 'BÉNÉFICIAIRES'}</h3>
            <p>${formData.beneficiaries.replace(/\n/g, '<br/>')}</p>
            ` : ''}
            
            ${formData.executorName ? `
            <h3>${language === 'en' ? 'EXECUTOR' : 'EXÉCUTEUR TESTAMENTAIRE'}</h3>
            <p>${language === 'en' ? 
              `I hereby nominate, constitute and appoint <strong>${formData.executorName}</strong> as Executor of this my Last Will and Testament.` : 
              `Je nomme, constitue et désigne par la présente <strong>${formData.executorName}</strong> comme Exécuteur Testamentaire de mon Testament.`}</p>
            ` : ''}
            
            <div class="footer">
              <p>${language === 'en' ? 'IN WITNESS WHEREOF, I hereby set my hand to this my Last Will and Testament.' : 'EN FOI DE QUOI, j\'appose ma signature sur mon Testament.'}</p>
              
              <div class="signature">
                ${signature ? `<img src="${signature}" alt="Signature" style="width: 200px;"/>` : `<div class="signature-line"></div>`}
                <br/>
                <strong>${formData.fullName}</strong><br/>
                ${language === 'en' ? 'Testator' : 'Testateur'}
              </div>
              
              <p style="margin-top: 40px;">${language === 'en' ? 'Signed on:' : 'Signé le:'} ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
          </html>
        `;
        break;
        
      case 'contract':
        documentHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${title} - ${formData.fullName}</title>
            <style>
              body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1, h2 { text-align: center; }
              .date { text-align: right; margin-bottom: 30px; }
              .header { margin-bottom: 30px; }
              .footer { margin-top: 50px; }
              .party { margin: 20px 0; }
              .section { margin: 25px 0; }
              .signature { margin-top: 30px; }
              .signature-line { margin-top: 30px; border-top: 1px solid #000; display: inline-block; width: 200px; }
              .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
            </style>
          </head>
          <body>
            <div class="date">${new Date().toLocaleDateString()}</div>
            
            <h1>${language === 'en' ? 'EMPLOYMENT CONTRACT' : 'CONTRAT DE TRAVAIL'}</h1>
            
            <section class="section">
              <p><strong>${language === 'en' ? 'BETWEEN:' : 'ENTRE:'}</strong></p>
              <div class="party">
                <strong>${formData.employerName}</strong>, ${language === 'en' ? 'hereinafter referred to as "the Employer"' : 'ci-après dénommé "l\'Employeur"'}
              </div>
              
              <p><strong>${language === 'en' ? 'AND:' : 'ET:'}</strong></p>
              <div class="party">
                <strong>${formData.fullName}</strong>, ${language === 'en' ? 'hereinafter referred to as "the Employee"' : 'ci-après dénommé "l\'Employé"'}
              </div>
            </section>
            
            <section class="section">
              <h2>${language === 'en' ? 'TERMS OF EMPLOYMENT' : 'CONDITIONS D\'EMPLOI'}</h2>
              <p>
                <strong>${language === 'en' ? 'Position:' : 'Poste:'}</strong> ${formData.employeeRole || '_______________'}<br/>
                ${formData.startDate ? `<strong>${language === 'en' ? 'Start Date:' : 'Date de début:'}</strong> ${new Date(formData.startDate).toLocaleDateString()}<br/>` : ''}
                ${formData.salary ? `<strong>${language === 'en' ? 'Salary:' : 'Salaire:'}</strong> ${formData.salary} FCFA ${language === 'en' ? 'per month' : 'par mois'}<br/>` : ''}
              </p>
              
              <p>${language === 'en' ? 
                'The Employee agrees to work diligently and faithfully perform the duties assigned by the Employer in accordance with Cameroon Labor Law.' : 
                'L\'Employé s\'engage à travailler avec diligence et à remplir fidèlement les fonctions assignées par l\'Employeur conformément au Code du Travail camerounais.'}</p>
              
              <p>${language === 'en' ? 
                'This contract is governed by the Labor Code, Law No. 92/007 of August 14, 1992.' : 
                'Ce contrat est régi par le Code du Travail, Loi n° 92/007 du 14 août 1992.'}</p>
            </section>
            
            <div class="signatures">
              <div class="signature">
                ${language === 'en' ? 'The Employer:' : 'L\'Employeur:'}<br/>
                <div class="signature-line"></div><br/>
                ${formData.employerName}<br/>
                ${language === 'en' ? 'Date:' : 'Date:'} ${new Date().toLocaleDateString()}
              </div>
              
              <div class="signature">
                ${language === 'en' ? 'The Employee:' : 'L\'Employé:'}<br/>
                ${signature ? `<img src="${signature}" alt="Signature" style="width: 200px;"/>` : `<div class="signature-line"></div>`}<br/>
                ${formData.fullName}<br/>
                ${language === 'en' ? 'Date:' : 'Date:'} ${new Date().toLocaleDateString()}
              </div>
            </div>
          </body>
          </html>
        `;
        break;
        
      case 'complaint':
      default:
        // Original complaint document template
        documentHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>${title} - ${formData.fullName}</title>
            <style>
              body { font-family: 'Times New Roman', serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1, h2, h3 { text-align: center; }
              .date { text-align: right; margin-bottom: 30px; }
              .header { margin-bottom: 30px; text-align: center; }
              .footer { margin-top: 50px; }
              .signature-line { margin-top: 30px; border-top: 1px solid #000; display: inline-block; width: 200px; }
              .references { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="date">${new Date().toLocaleDateString()}</div>
            
            <div class="header">
              ${courtHeader}
            </div>
            
            <p>
              <strong>${language === 'en' ? 'PLAINTIFF:' : 'PLAIGNANT:'}</strong> ${formData.fullName}<br />
              <strong>${language === 'en' ? 'ADDRESS:' : 'ADRESSE:'}</strong> ${formData.address}<br />
              <strong>${language === 'en' ? 'CONTACT:' : 'CONTACT:'}</strong> ${formData.phoneNumber}, ${formData.email}
            </p>
            
            <p>
              <strong>${language === 'en' ? 'DEFENDANT:' : 'DÉFENDEUR:'}</strong> [Defendant Name]<br />
              <strong>${language === 'en' ? 'ADDRESS:' : 'ADRESSE:'}</strong> [Defendant Address]
            </p>
            
            <h3>${language === 'en' ? 'COMPLAINT' : 'PLAINTE'}</h3>
            
            <p style="text-indent: 2rem;">
              ${formData.description || (language === 'en' 
                ? 'The plaintiff, by and through the undersigned counsel, hereby files this Complaint against the Defendant and alleges as follows...'
                : 'Le plaignant, par l\'intermédiaire du conseil soussigné, dépose par la présente cette plainte contre le défendeur et allègue ce qui suit...')}
            </p>
            
            ${references.length > 0 ? `
            <div class="references">
              <h4>${language === 'en' ? 'LEGAL REFERENCES:' : 'RÉFÉRENCES JURIDIQUES:'}</h4>
              <ul>
                ${references.map(ref => `<li>${ref}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            <div class="footer">
              <p>${language === 'en' ? 'Respectfully submitted,' : 'Respectueusement soumis,'}</p>
              
              <p>
                ${signature ? `<img src="${signature}" alt="Signature" style="width: 200px;"/>` : `<div class="signature-line"></div>`}<br />
                ${formData.fullName}<br />
                ${language === 'en' ? 'Plaintiff' : 'Plaignant'}
              </p>
            </div>
          </body>
          </html>
        `;
    }
    
    return documentHtml;
  };
  
  // Preview the document in the UI
  const renderDocumentPreview = () => {
    switch(formData.documentType) {
      case 'will':
        return (
          <>
            <p style={{ textAlign: 'right', marginBottom: '2rem' }}>
              {new Date().toLocaleDateString()}
            </p>
            <h3 style={{ textAlign: 'center' }}>
              {language === 'en' ? 'LAST WILL AND TESTAMENT OF' : 'TESTAMENT DE'}
            </h3>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {formData.fullName.toUpperCase() || '[YOUR NAME]'}
            </h2>
            <p>
              {language === 'en' 
                ? `I, ${formData.fullName || '[Name]'}, a resident of ${formData.address || '[Address]'}, being of sound mind, hereby revoke all previous wills and codicils and declare this to be my Last Will and Testament.` 
                : `Je, soussigné(e) ${formData.fullName || '[Nom]'}, domicilié(e) à ${formData.address || '[Adresse]'}, sain(e) d'esprit, révoque par la présente tous testaments et codicilles antérieurs et déclare que ceci est mon Testament.`}
            </p>
            
            {formData.assets && (
              <>
                <h4 style={{ marginTop: '1.5rem' }}>
                  {language === 'en' ? 'DISTRIBUTION OF ASSETS' : 'DISTRIBUTION DES BIENS'}
                </h4>
                <p style={{ whiteSpace: 'pre-line' }}>{formData.assets}</p>
              </>
            )}
            
            {formData.executorName && (
              <p style={{ marginTop: '1.5rem' }}>
                {language === 'en'
                  ? `I hereby nominate and appoint ${formData.executorName} as Executor of this my Last Will and Testament.`
                  : `Je nomme et désigne par la présente ${formData.executorName} comme Exécuteur Testamentaire de mon Testament.`}
              </p>
            )}
            
            <p style={{ marginTop: '3rem' }}>
              {language === 'en' ? 'IN WITNESS WHEREOF, I have signed this Will.' : 'EN FOI DE QUOI, j\'ai signé ce Testament.'}
            </p>
            
            <p style={{ marginTop: '2rem' }}>
              ____________________________<br />
              {formData.fullName || '[Signature]'}<br />
              {language === 'en' ? 'Testator' : 'Testateur'}
            </p>
          </>
        );
        
      case 'contract':
        return (
          <>
            <p style={{ textAlign: 'right', marginBottom: '1rem' }}>
              {new Date().toLocaleDateString()}
            </p>
            
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
              {language === 'en' ? 'EMPLOYMENT CONTRACT' : 'CONTRAT DE TRAVAIL'}
            </h2>
            
            <p><strong>{language === 'en' ? 'BETWEEN:' : 'ENTRE:'}</strong></p>
            <p style={{ marginLeft: '2rem' }}>
              <strong>{formData.employerName || '[Employer]'}</strong>, {language === 'en' ? 'hereinafter referred to as "the Employer"' : 'ci-après dénommé "l\'Employeur"'}
            </p>
            
            <p><strong>{language === 'en' ? 'AND:' : 'ET:'}</strong></p>
            <p style={{ marginLeft: '2rem' }}>
              <strong>{formData.fullName || '[Employee]'}</strong>, {language === 'en' ? 'hereinafter referred to as "the Employee"' : 'ci-après dénommé "l\'Employé"'}
            </p>
            
            <h3 style={{ marginTop: '2rem' }}>
              {language === 'en' ? 'TERMS OF EMPLOYMENT' : 'CONDITIONS D\'EMPLOI'}
            </h3>
            
            <p>
              <strong>{language === 'en' ? 'Position:' : 'Poste:'}</strong> {formData.employeeRole || '_______________'}<br/>
              {formData.startDate && (
                <><strong>{language === 'en' ? 'Start Date:' : 'Date de début:'}</strong> {new Date(formData.startDate).toLocaleDateString()}<br/></>
              )}
              {formData.salary && (
                <><strong>{language === 'en' ? 'Salary:' : 'Salaire:'}</strong> {formData.salary} FCFA {language === 'en' ? 'per month' : 'par mois'}<br/></>
              )}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
              <div>
                {language === 'en' ? 'The Employer:' : 'L\'Employeur:'}<br/>
                ____________________________<br/>
                {formData.employerName || '[Employer name]'}<br/>
                {language === 'en' ? 'Date:' : 'Date:'} {new Date().toLocaleDateString()}
              </div>
              
              <div>
                {language === 'en' ? 'The Employee:' : 'L\'Employé:'}<br/>
                ____________________________<br/>
                {formData.fullName || '[Your name]'}<br/>
                {language === 'en' ? 'Date:' : 'Date:'} {new Date().toLocaleDateString()}
              </div>
            </div>
          </>
        );
        
      case 'complaint':
      default:
        // Use original complaint preview with court added
        const courtText = formData.courtRegion ? 
          `${cameroonianCourts[formData.courtRegion].name[language]}\n${cameroonianCourts[formData.courtRegion].address}` :
          `${language === 'en' ? 'TO THE COURT OF FIRST INSTANCE' : 'AU TRIBUNAL DE PREMIÈRE INSTANCE'}\n${language === 'en' ? 'IN AND FOR THE JUDICIAL DISTRICT OF CAMEROON' : 'DANS ET POUR LE DISTRICT JUDICIAIRE DU CAMEROUN'}`;
        
        return (
          <>
            <p style={{ textAlign: 'right', marginBottom: '2rem' }}>
              {new Date().toLocaleDateString()}
            </p>
            <p style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <strong>{courtText.split('\n')[0]}</strong><br />
              {courtText.split('\n')[1]}
            </p>
            <p style={{ marginBottom: '1rem' }}>
              <strong>{language === 'en' ? 'PLAINTIFF:' : 'PLAIGNANT:'}</strong> {formData.fullName}<br />
              <strong>{language === 'en' ? 'ADDRESS:' : 'ADRESSE:'}</strong> {formData.address}<br />
              <strong>{language === 'en' ? 'CONTACT:' : 'CONTACT:'}</strong> {formData.phoneNumber}, {formData.email}
            </p>
            <p style={{ marginBottom: '2rem' }}>
              <strong>{language === 'en' ? 'DEFENDANT:' : 'DÉFENDEUR:'}</strong> [Defendant Name]<br />
              <strong>{language === 'en' ? 'ADDRESS:' : 'ADRESSE:'}</strong> [Defendant Address]
            </p>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {language === 'en' ? 'COMPLAINT' : 'PLAINTE'}
            </h3>
            <p style={{ textIndent: '2rem', marginBottom: '1rem' }}>
              {formData.description || (language === 'en' 
                ? 'The plaintiff, by and through the undersigned counsel, hereby files this Complaint against the Defendant and alleges as follows...'
                : 'Le plaignant, par l\'intermédiaire du conseil soussigné, dépose par la présente cette plainte contre le défendeur et allègue ce qui suit...')}
            </p>
            
            {references.length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', margin: '1.5rem 0' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>{language === 'en' ? 'Legal References:' : 'Références Juridiques:'}</h4>
                <ul>
                  {references.map((ref, idx) => (
                    <li key={idx}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <p style={{ marginTop: '3rem', marginBottom: '1rem' }}>
              {language === 'en' ? 'Respectfully submitted,' : 'Respectueusement soumis,'}
            </p>
            <p style={{ marginTop: '2rem' }}>
              ____________________________<br />
              {formData.fullName}<br />
              {language === 'en' ? 'Plaintiff' : 'Plaignant'}
            </p>
          </>
        );
    }
  };
  
  return (
    <GeneratorContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Title>
        <FiFilePlus />
        {language === 'en' ? 'Legal Document Generator' : 'Générateur de Documents Juridiques'}
      </Title>
      
      <ScrollContainer>
        <form onSubmit={handleSubmit}>
          <FormContainer>
            <FormGroup>
              <Label>{language === 'en' ? 'Document Type' : 'Type de Document'}</Label>
              <SelectWrapper>
                <Select 
                  name="documentType" 
                  value={formData.documentType} 
                  onChange={handleChange}
                >
                  {documentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </Select>
                <FiChevronDown />
              </SelectWrapper>
            </FormGroup>
            
            {renderFormFields()}
            
            {/* Digital Signature Section */}
            <FormGroup>
              <Label>{language === 'en' ? 'Your Signature' : 'Votre Signature'}</Label>
              <SignatureBox>
                <SignatureCanvas 
                  ref={sigCanvas}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas'
                  }}
                  backgroundColor='rgba(255, 255, 255)'
                />
              </SignatureBox>
              <ButtonRow>
                <SmallButton type="button" onClick={clearSignature}>
                  {language === 'en' ? 'Clear' : 'Effacer'}
                </SmallButton>
                <SmallButton type="button" onClick={saveSignature}>
                  {language === 'en' ? 'Save Signature' : 'Enregistrer la Signature'}
                </SmallButton>
              </ButtonRow>
            </FormGroup>
            
            <GenerateButton type="submit" disabled={generating}>
              {generating 
                ? (language === 'en' ? 'Generating...' : 'Génération en cours...')
                : (
                  <>
                    {language === 'en' ? 'Generate Document' : 'Générer le Document'}
                    <FiFilePlus />
                  </>
                )}
            </GenerateButton>
          </FormContainer>
        </form>
        
        {generated && (
          <Result
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ResultHeader>
              <h3>
                <FiCheck style={{ color: '#10b981' }} />
                {language === 'en' ? 'Document Generated' : 'Document Généré'}
              </h3>
              
              {/* Enhanced download options */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <DownloadButton onClick={downloadDocument}>
                  <FiDownload />
                  HTML
                </DownloadButton>
                <DownloadButton onClick={downloadPDF} style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
                  <FiDownload />
                  PDF
                </DownloadButton>
              </div>
            </ResultHeader>
            
            <DocumentPreview>
              {renderDocumentPreview()}
            </DocumentPreview>
          </Result>
        )}
      </ScrollContainer>
    </GeneratorContainer>
  );
};

export default DocumentGenerator;