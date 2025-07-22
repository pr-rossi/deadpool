import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { useHaptics } from '../utils/haptics';
import '../styles/ContextMenu.css';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: IconDefinition;
  destructive?: boolean;
  disabled?: boolean;
  action: () => void;
}

interface ContextMenuProps {
  children: React.ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
  longPressDuration?: number;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  items,
  disabled = false,
  longPressDuration = 500
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const haptics = useHaptics();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    setIsLongPressing(true);

    longPressTimer.current = setTimeout(() => {
      if (isLongPressing) {
        haptics.medium();
        setPosition({ x: touch.clientX, y: touch.clientY });
        setIsOpen(true);
        setIsLongPressing(false);
      }
    }, longPressDuration);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current || !isLongPressing) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStart.current.x);
    const deltaY = Math.abs(touch.clientY - touchStart.current.y);

    // Cancel long press if user moves too much
    if (deltaX > 10 || deltaY > 10) {
      setIsLongPressing(false);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsLongPressing(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    
    haptics.light();
    item.action();
    setIsOpen(false);
  };

  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div
        ref={containerRef}
        className={`context-menu-trigger ${isLongPressing ? 'long-pressing' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {isOpen && (
        <>
          <div className="context-menu-backdrop" onClick={handleBackdropClick} />
          <div 
            className="context-menu"
            style={{ 
              left: position.x, 
              top: position.y,
              transform: 'translate(-50%, -100%)' 
            }}
          >
            <div className="context-menu-content">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  className={`context-menu-item ${item.destructive ? 'destructive' : ''} ${item.disabled ? 'disabled' : ''}`}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                >
                  {item.icon && (
                    <FontAwesomeIcon icon={item.icon} className="menu-item-icon" />
                  )}
                  <span className="menu-item-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ContextMenu;