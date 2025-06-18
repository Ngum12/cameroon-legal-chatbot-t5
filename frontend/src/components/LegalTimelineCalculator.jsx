import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiAlertCircle, FiPlus, FiMinus } from 'react-icons/fi';

const TimelineContainer = styled(motion.div)`
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

const Select = styled.select`
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
  
  option {
    background: #1e3a8a;
    color: white;
  }
`;

const Button = styled.button`
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
`;

const Timeline = styled.div`
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
`;

const TimelineEvent = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
  display: flex;
  
  &::before {
    content: '';
    position: absolute;
    top: 1.5rem;
    left: 1rem;
    width: 2px;
    height: calc(100% + 1.5rem);
    background: rgba(255, 255, 255, 0.1);
    z-index: 0;
  }
  
  &:last-child::before {
    display: none;
  }
`;

const EventMarker = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${props => props.$color || '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.3);
  
  svg {
    color: white;
    font-size: 1rem;
  }
`;

const EventContent = styled.div`
  flex: 1;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid ${props => props.$color || '#3b82f6'};
`;

const EventDate = styled.div`
  font-weight: bold;
  color: white;
  margin-bottom: 0.3rem;
  font-size: 1.1rem;
`;

const EventDescription = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const InfoCard = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border-left: 4px solid #3b82f6;
  padding: 1rem;
  margin: 1rem 0;
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

const DeadlinesList = styled.div`
  margin-top: 2rem;
`;

const DeadlinesHeader = styled.div`
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

const DeadlineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  
  button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    svg {
      font-size: 1rem;
    }
  }
`;

const LegalTimelineCalculator = ({ language = 'en' }) => {
  const [caseType, setCaseType] = useState('civil');
  const [startDate, setStartDate] = useState('');
  const [deadlines, setDeadlines] = useState([
    { id: 1, name: language === 'en' ? 'File Response' : 'Dépôt de Réponse', days: 30 }
  ]);
  const [timelineGenerated, setTimelineGenerated] = useState(false);
  
  const handleAddDeadline = () => {
    const newDeadline = {
      id: Date.now(),
      name: '',
      days: 14
    };
    setDeadlines([...deadlines, newDeadline]);
  };
  
  const handleRemoveDeadline = (id) => {
    setDeadlines(deadlines.filter(deadline => deadline.id !== id));
  };
  
  const handleDeadlineChange = (id, field, value) => {
    setDeadlines(deadlines.map(deadline => 
      deadline.id === id ? { ...deadline, [field]: value } : deadline
    ));
  };
  
  const generateTimeline = () => {
    if (!startDate) return;
    setTimelineGenerated(true);
  };
  
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      language === 'en' ? 'en-US' : 'fr-FR', 
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };
  
  const events = startDate ? [
    {
      date: startDate,
      description: language === 'en' ? 'Case Initiation Date' : 'Date d\'Initiation du Cas',
      icon: <FiCalendar />,
      color: '#3b82f6'
    },
    ...deadlines.map((deadline, index) => ({
      date: addDays(new Date(startDate), deadline.days),
      description: deadline.name || (language === 'en' ? 'Deadline' : 'Échéance'),
      icon: <FiClock />,
      color: index % 2 === 0 ? '#8b5cf6' : '#ec4899'
    }))
  ] : [];
  
  const caseTypes = [
    { id: 'civil', label: language === 'en' ? 'Civil Case' : 'Affaire Civile' },
    { id: 'criminal', label: language === 'en' ? 'Criminal Case' : 'Affaire Pénale' },
    { id: 'commercial', label: language === 'en' ? 'Commercial Dispute' : 'Litige Commercial' },
    { id: 'administrative', label: language === 'en' ? 'Administrative Case' : 'Affaire Administrative' }
  ];
  
  return (
    <TimelineContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Title>
        <FiCalendar />
        {language === 'en' ? 'Legal Timeline Calculator' : 'Calculateur de Délais Juridiques'}
      </Title>
      
      <FormContainer>
        <FormGroup>
          <Label>{language === 'en' ? 'Case Type' : 'Type d\'Affaire'}</Label>
          <Select 
            value={caseType} 
            onChange={(e) => setCaseType(e.target.value)}
          >
            {caseTypes.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>
            <FiCalendar />
            {language === 'en' ? 'Start Date' : 'Date de Début'}
          </Label>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormGroup>
        
        <InfoCard>
          <FiAlertCircle />
          <p>
            {language === 'en' 
              ? 'The following deadlines are automatically calculated based on Cameroonian legal time frames. Adjust as needed for your specific case.'
              : 'Les délais suivants sont calculés automatiquement selon les délais légaux camerounais. Ajustez-les selon les besoins de votre cas spécifique.'}
          </p>
        </InfoCard>
        
        <DeadlinesList>
          <DeadlinesHeader>
            <h3>{language === 'en' ? 'Legal Deadlines' : 'Délais Légaux'}</h3>
            <button 
              onClick={handleAddDeadline}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <FiPlus />
              {language === 'en' ? 'Add Deadline' : 'Ajouter un Délai'}
            </button>
          </DeadlinesHeader>
          
          {deadlines.map(deadline => (
            <DeadlineItem key={deadline.id}>
              <button onClick={() => handleRemoveDeadline(deadline.id)}>
                <FiMinus />
              </button>
              
              <Input 
                type="text" 
                value={deadline.name} 
                onChange={(e) => handleDeadlineChange(deadline.id, 'name', e.target.value)}
                placeholder={language === 'en' ? 'Deadline name' : 'Nom du délai'}
                style={{ flex: 2 }}
              />
              
              <Input 
                type="number" 
                value={deadline.days} 
                onChange={(e) => handleDeadlineChange(deadline.id, 'days', parseInt(e.target.value))}
                style={{ flex: 1 }}
                min="1"
              />
              
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                {language === 'en' ? 'days' : 'jours'}
              </span>
            </DeadlineItem>
          ))}
        </DeadlinesList>
        
        <Button 
          onClick={generateTimeline} 
          disabled={!startDate}
        >
          <FiCalendar />
          {language === 'en' ? 'Generate Timeline' : 'Générer le Calendrier'}
        </Button>
      </FormContainer>
      
      {timelineGenerated && (
        <Timeline>
          <h3>{language === 'en' ? 'Case Timeline' : 'Calendrier du Dossier'}</h3>
          
          {events.map((event, index) => (
            <TimelineEvent key={index}>
              <EventMarker $color={event.color}>
                {event.icon}
              </EventMarker>
              <EventContent $color={event.color}>
                <EventDate>{formatDate(event.date)}</EventDate>
                <EventDescription>{event.description}</EventDescription>
              </EventContent>
            </TimelineEvent>
          ))}
        </Timeline>
      )}
    </TimelineContainer>
  );
};

export default LegalTimelineCalculator;