import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiGlobe, FiInfo, FiHelpCircle, FiLogIn } from 'react-icons/fi';

const HeaderContainer = styled.header`
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
`;

const Logo = styled(motion.div)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 32px;
    height: 32px;
  }
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const LogoSvg = styled.svg`
  width: 32px;
  height: 32px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  svg {
    font-size: 1.2rem;
  }

  &:hover {
    color: white;
  }
  
  @media (max-width: 768px) {
    span {
      display: none;
    }
  }
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LanguageButton = styled.button`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  color: white;
  border: ${props => props.$active ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.15)'};
  border-radius: 6px;
  padding: 0.4rem 0.7rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const LanguageControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  
  @media (min-width: 768px) {
    gap: 0.6rem;
  }
`;

const Header = ({ onLanguageChange, language = 'en' }) => {
  return (
    <HeaderContainer>
      <Logo
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoSvg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </LogoSvg>
        {language === 'en' ? 'CamLegal Assistant' : 'Assistant Juridique Cam'}
      </Logo>
      
      <HeaderControls>
        <LanguageControls>
          <FiGlobe style={{ color: 'white' }} />
          <LanguageButton 
            $active={language === 'en'}
            onClick={() => onLanguageChange('en')}
          >
            EN
          </LanguageButton>
          <LanguageButton 
            $active={language === 'fr'}
            onClick={() => onLanguageChange('fr')}
          >
            FR
          </LanguageButton>
        </LanguageControls>
        
        <NavLinks>
          <NavLink href="#">
            <FiHelpCircle />
            <span>{language === 'en' ? 'Help' : 'Aide'}</span>
          </NavLink>
          <NavLink href="#">
            <FiInfo />
            <span>{language === 'en' ? 'About' : 'À propos'}</span>
          </NavLink>
          <NavLink href="#">
            <FiLogIn />
            <span>{language === 'en' ? 'Sign In' : 'Connexion'}</span>
          </NavLink>
        </NavLinks>
      </HeaderControls>
    </HeaderContainer>
  );
};

export default Header;