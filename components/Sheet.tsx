import React, { useEffect, useState, useRef } from 'react';
import '../styles/Sheet.css';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'auto' | 'full';
  showHandle?: boolean;
}

const Sheet: React.FC<SheetProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  height = 'auto',
  showHandle = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (dragOffset > 100) {
      onClose();
    }
    
    setDragOffset(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`sheet-backdrop ${isOpen ? 'open' : ''}`}
      onClick={handleBackdropClick}
    >
      <div 
        ref={sheetRef}
        className={`sheet ${isOpen ? 'open' : ''} ${height === 'full' ? 'full-height' : ''}`}
        style={{ transform: `translateY(${dragOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {showHandle && (
          <div className="sheet-handle-container">
            <div className="sheet-handle" />
          </div>
        )}
        
        {title && (
          <div className="sheet-header">
            <h2 className="sheet-title">{title}</h2>
            <button className="sheet-close" onClick={onClose}>
              Done
            </button>
          </div>
        )}
        
        <div className="sheet-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sheet;