import React, { useState } from 'react';
import { useHaptics } from '../utils/haptics';
import '../styles/NativeSwitch.css';

interface NativeSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  label?: string;
  description?: string;
  className?: string;
}

const NativeSwitch: React.FC<NativeSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'medium',
  color,
  label,
  description,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const haptics = useHaptics();

  const handleToggle = () => {
    if (disabled) return;
    
    haptics.light();
    onChange(!checked);
  };

  const handleTouchStart = () => {
    if (!disabled) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const switchClasses = [
    'native-switch',
    size,
    checked ? 'checked' : '',
    disabled ? 'disabled' : '',
    isPressed ? 'pressed' : '',
    className
  ].filter(Boolean).join(' ');

  const switchStyle = color && checked ? { backgroundColor: color } : {};

  return (
    <div className="native-switch-container">
      {(label || description) && (
        <div className="switch-label-container">
          {label && <label className="switch-label">{label}</label>}
          {description && <span className="switch-description">{description}</span>}
        </div>
      )}
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        className={switchClasses}
        style={switchStyle}
        onClick={handleToggle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={disabled}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  );
};

export default NativeSwitch;