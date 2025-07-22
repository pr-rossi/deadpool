import React, { useState, useEffect } from 'react';
import '../styles/AppLayout.css';

interface AppLayoutProps {
  children: React.ReactNode;
  showStatusBar?: boolean;
  backgroundColor?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showStatusBar = true,
  backgroundColor = 'var(--color-background)'
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      setScrollPosition(window.scrollY);
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="app-layout" style={{ backgroundColor }}>
      {showStatusBar && (
        <div className={`status-bar ${scrollPosition > 50 ? 'scrolled' : ''}`}>
          <div className="status-bar-content">
            <span className="status-time">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="status-indicators">
              <span className="status-signal">●●●●</span>
              <span className="status-wifi">📶</span>
              <span className="status-battery">🔋</span>
            </div>
          </div>
        </div>
      )}
      <div className={`app-content ${isScrolling ? 'scrolling' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default AppLayout;