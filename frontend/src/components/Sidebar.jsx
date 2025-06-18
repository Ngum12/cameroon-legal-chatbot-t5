import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageSquare, 
  FiFileText, 
  FiSettings, 
  FiInfo, 
  FiChevronLeft, 
  FiChevronRight,
  FiUser,
  FiGlobe,
  FiBook,
  FiHeadphones,
  FiFilePlus,
  FiCalendar
} from 'react-icons/fi';

// Gradient animation for the sidebar
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const SidebarContainer = styled(motion.div)`
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
  width: ${props => props.$collapsed ? '80px' : '280px'};
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => props.$collapsed ? 'none' : '5px 0 25px rgba(0, 0, 0, 0.2)'};
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(145deg, rgba(30, 58, 138, 0.05), rgba(29, 78, 216, 0.15));
    pointer-events: none;
    z-index: 1;
  }
`;

const Logo = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
  background: rgba(0, 0, 0, 0.2);
  
  h2 {
    color: white;
    margin: 0;
    font-size: 1.2rem;
    white-space: nowrap;
    display: ${props => props.$collapsed ? 'none' : 'block'};
    font-weight: 600;
    background: linear-gradient(90deg, #ffffff, #a5b4fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30px rgba(165, 180, 252, 0.5);
  }
  
  svg {
    color: white;
    font-size: 1.8rem;
    margin-right: ${props => props.$collapsed ? '0' : '0.8rem'};
  }
`;

const NavItems = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 2;
  
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
`;

const NavCategory = styled.div`
  padding: ${props => props.$collapsed ? '0.5rem' : '0.5rem 1.5rem'};
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: ${props => props.$mt ? '1rem' : '0'};
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const NavItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${props => props.$collapsed ? '1rem 0' : '0.8rem 1.5rem'};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  border-left: 4px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  background: ${props => props.$active ? 'rgba(59, 130, 246, 0.15)' : 'transparent'};
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  svg {
    font-size: 1.4rem;
    min-width: 1.4rem;
    margin-right: ${props => props.$collapsed ? '0' : '1rem'};
    opacity: ${props => props.$active ? '1' : '0.8'};
    color: ${props => props.$active ? '#60a5fa' : 'rgba(255, 255, 255, 0.8)'};
    filter: ${props => props.$active ? 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))' : 'none'};
  }
  
  span {
    white-space: nowrap;
    font-weight: ${props => props.$active ? '500' : 'normal'};
    display: ${props => props.$collapsed ? 'none' : 'inline'};
    font-size: 0.95rem;
  }
`;

const NavItemBadge = styled.div`
  background: ${props => props.$type === 'new' ? '#10b981' : '#f59e0b'};
  color: white;
  font-size: 0.7rem;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  margin-left: auto;
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 50%;
  right: ${props => props.$collapsed ? 'auto' : '-15px'};
  left: ${props => props.$collapsed ? 'calc(100% - 15px)' : 'auto'};
  transform: translateY(-50%);
  background: #1e40af;
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  
  &:hover {
    background: #2563eb;
    transform: translateY(-50%) scale(1.1);
  }
`;

const UserSection = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
`;

const UserAvatar = styled.div`
  width: ${props => props.$collapsed ? '40px' : '45px'};
  height: ${props => props.$collapsed ? '40px' : '45px'};
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: ${props => props.$collapsed ? '1rem' : '1.2rem'};
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
`;

const UserInfo = styled.div`
  margin-left: 1rem;
  display: ${props => props.$collapsed ? 'none' : 'block'};
  
  h4 {
    margin: 0;
    color: white;
    font-size: 0.95rem;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const OnlineStatus = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10b981;
  position: absolute;
  bottom: 3px;
  right: 3px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const VersionTag = styled.div`
  position: absolute;
  bottom: ${props => props.$collapsed ? '15px' : '70px'};
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  display: ${props => props.$collapsed ? 'none' : 'block'};
`;

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [newFeatures, setNewFeatures] = useState(true);
  
  useEffect(() => {
    // After 5 seconds, remove the "NEW" badge
    const timer = setTimeout(() => {
      setNewFeatures(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  // Main navigation items
  const mainNavItems = [
    { id: 'chat', icon: <FiMessageSquare />, label: 'Chat Assistant' },
    { id: 'documents', icon: <FiFileText />, label: 'Document Analysis', badge: newFeatures ? 'new' : null },
    { id: 'generator', icon: <FiFilePlus />, label: 'Document Generator' },
    { id: 'timeline', icon: <FiCalendar />, label: 'Legal Timeline' },
  ];
  
  // Additional navigation items
  const secondaryNavItems = [
    { id: 'lawLibrary', icon: <FiBook />, label: 'Law Library', badge: 'soon' },
    { id: 'support', icon: <FiHeadphones />, label: 'Support' },
  ];
  
  // Bottom navigation items
  const bottomNavItems = [
    { id: 'about', icon: <FiInfo />, label: 'About' },
    { id: 'settings', icon: <FiSettings />, label: 'Settings' }
  ];
  
  return (
    <SidebarContainer 
      $collapsed={collapsed}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Logo $collapsed={collapsed}>
        <FiGlobe />
        {!collapsed && <h2>Legal Assistant</h2>}
      </Logo>
      
      <NavItems>
        <NavCategory $collapsed={collapsed}>Main</NavCategory>
        
        {mainNavItems.map(item => (
          <NavItem 
            key={item.id}
            $active={activeTab === item.id}
            $collapsed={collapsed}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && <NavItemBadge $type={item.badge} $collapsed={collapsed}>{item.badge}</NavItemBadge>}
          </NavItem>
        ))}
        
        <NavCategory $collapsed={collapsed} $mt>Resources</NavCategory>
        
        {secondaryNavItems.map(item => (
          <NavItem 
            key={item.id}
            $active={activeTab === item.id}
            $collapsed={collapsed}
            onClick={() => item.badge !== 'soon' && setActiveTab(item.id)}
            style={{ opacity: item.badge === 'soon' ? 0.6 : 1, cursor: item.badge === 'soon' ? 'not-allowed' : 'pointer' }}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && <NavItemBadge $type={item.badge} $collapsed={collapsed}>{item.badge}</NavItemBadge>}
          </NavItem>
        ))}
        
        <div style={{ flexGrow: 1 }}></div>
        
        {bottomNavItems.map(item => (
          <NavItem 
            key={item.id}
            $active={activeTab === item.id}
            $collapsed={collapsed}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavItem>
        ))}
      </NavItems>
      
      <VersionTag $collapsed={collapsed}>v2.1.0 - Cameroonian Legal AI</VersionTag>
      
      <UserSection>
        <UserAvatar $collapsed={collapsed} aria-label="User Avatar">
          CJ
          {!collapsed && <OnlineStatus />}
        </UserAvatar>
        
        <UserInfo $collapsed={collapsed}>
          <h4>Cameroon Justice</h4>
          <p>Legal Explorer</p>
        </UserInfo>
      </UserSection>
      
      <ToggleButton 
        onClick={toggleSidebar} 
        $collapsed={collapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </ToggleButton>
    </SidebarContainer>
  );
};

export default Sidebar;