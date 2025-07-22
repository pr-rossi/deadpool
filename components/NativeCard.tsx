import React, { useState } from 'react';
import { useHaptics } from '../utils/haptics';
import '../styles/NativeCard.css';

interface NativeCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  interactive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  selected?: boolean;
}

const NativeCard: React.FC<NativeCardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  onPress,
  onLongPress,
  className = '',
  style,
  disabled = false,
  selected = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const haptics = useHaptics();

  const handleTouchStart = () => {
    if (disabled) return;
    setIsPressed(true);
    if (interactive || onPress) {
      haptics.light();
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    if (disabled) return;
    
    if (onPress) {
      onPress();
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (onPress) {
      onPress();
    }
  };

  const cardClasses = [
    'native-card',
    variant,
    interactive || onPress ? 'interactive' : '',
    disabled ? 'disabled' : '',
    selected ? 'selected' : '',
    isPressed ? 'pressed' : '',
    className
  ].filter(Boolean).join(' ');

  const cardProps: React.HTMLAttributes<HTMLDivElement> = {
    className: cardClasses,
    style,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onClick: handleClick
  };

  if (onLongPress) {
    // Add long press handling if needed
    cardProps.onContextMenu = (e) => {
      e.preventDefault();
      if (!disabled) {
        onLongPress();
      }
    };
  }

  return <div {...cardProps}>{children}</div>;
};

// Specialized card components
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  avatar?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, trailing, avatar }) => (
  <div className="card-header">
    {avatar && <div className="card-avatar">{avatar}</div>}
    <div className="card-header-content">
      <h3 className="card-title">{title}</h3>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
    {trailing && <div className="card-trailing">{trailing}</div>}
  </div>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

interface CardActionsProps {
  children: React.ReactNode;
  alignment?: 'start' | 'center' | 'end' | 'space-between';
}

export const CardActions: React.FC<CardActionsProps> = ({ children, alignment = 'end' }) => (
  <div className={`card-actions ${alignment}`}>{children}</div>
);

export default NativeCard;