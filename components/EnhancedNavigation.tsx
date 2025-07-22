import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faHome, faChartLine } from '@fortawesome/free-solid-svg-icons';
import '../styles/EnhancedNavigation.css';

interface EnhancedNavigationProps {
  onBack?: () => void;
  onHome?: () => void;
  currentStep?: string;
  showProgress?: boolean;
  progressPercentage?: number;
}

const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  onBack,
  onHome,
  currentStep,
  showProgress = false,
  progressPercentage = 0
}) => {
  return (
    <nav className="enhanced-nav">
      <div className="nav-content">
        <div className="nav-actions">
          {onBack && (
            <button 
              className="nav-action-button back" 
              onClick={onBack}
              aria-label="Go back"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              <span>Back</span>
            </button>
          )}
          
          {onHome && (
            <button 
              className="nav-action-button home" 
              onClick={onHome}
              aria-label="Go to home"
            >
              <FontAwesomeIcon icon={faHome} />
              <span className="home-label">Home</span>
            </button>
          )}
        </div>

        {currentStep && (
          <div className="nav-breadcrumb">
            <span className="current-step">{currentStep}</span>
          </div>
        )}

        {showProgress && (
          <div className="nav-progress">
            <FontAwesomeIcon icon={faChartLine} className="progress-icon" />
            <span className="progress-text">{Math.round(progressPercentage)}%</span>
          </div>
        )}
      </div>

      {showProgress && (
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </nav>
  );
};

export default EnhancedNavigation;