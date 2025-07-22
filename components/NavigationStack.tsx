import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useHaptics } from '../utils/haptics';
import '../styles/NavigationStack.css';

interface NavigationStackProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  enableSwipeBack?: boolean;
  className?: string;
  rightButton?: React.ReactNode;
}

const NavigationStack: React.FC<NavigationStackProps> = ({
  children,
  title,
  showBackButton = false,
  onBack,
  enableSwipeBack = true,
  className = '',
  rightButton
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [canSwipeBack, setCanSwipeBack] = useState(false);
  
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const haptics = useHaptics();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipeBack || !onBack) return;

    const touch = e.touches[0];
    startX.current = touch.clientX;
    currentX.current = touch.clientX;
    
    // Only allow swipe from left edge
    if (touch.clientX < 20) {
      setIsSwipeActive(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipeActive || !enableSwipeBack) return;

    const touch = e.touches[0];
    currentX.current = touch.clientX;
    const deltaX = touch.clientX - startX.current;

    if (deltaX > 0) {
      const progress = Math.min(deltaX / 200, 1);
      const offset = deltaX * 0.3; // Reduce movement for native feel
      
      setSwipeOffset(offset);
      setCanSwipeBack(progress > 0.3);
      
      // Add haptic feedback at threshold
      if (progress > 0.3 && !canSwipeBack) {
        haptics.light();
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipeActive) return;

    setIsSwipeActive(false);

    if (canSwipeBack && onBack) {
      haptics.medium();
      onBack();
    } else {
      // Snap back animation
      setSwipeOffset(0);
      setCanSwipeBack(false);
    }
  };

  useEffect(() => {
    if (!isSwipeActive) {
      setSwipeOffset(0);
      setCanSwipeBack(false);
    }
  }, [isSwipeActive]);

  const handleBackButtonClick = () => {
    if (onBack) {
      haptics.light();
      onBack();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`navigation-stack ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation header */}
      <div className="navigation-header">
        <div className="nav-left">
          {showBackButton && (
            <button 
              className="back-button"
              onClick={handleBackButtonClick}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              <span>Back</span>
            </button>
          )}
        </div>
        
        <div className="nav-center">
          {title && <h1 className="nav-title">{title}</h1>}
        </div>
        
        <div className="nav-right">
          {rightButton}
        </div>
      </div>

      {/* Content area with swipe gesture */}
      <div 
        className={`navigation-content ${isSwipeActive ? 'swiping' : ''}`}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwipeActive ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        {children}
      </div>

      {/* Swipe indicator */}
      {isSwipeActive && (
        <div 
          className={`swipe-indicator ${canSwipeBack ? 'active' : ''}`}
          style={{ opacity: Math.min(swipeOffset / 50, 1) }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </div>
      )}

      {/* Previous screen shadow effect */}
      {swipeOffset > 0 && (
        <div 
          className="previous-screen-shadow"
          style={{ opacity: Math.min(swipeOffset / 100, 0.3) }}
        />
      )}
    </div>
  );
};

export default NavigationStack;