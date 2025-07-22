import React from 'react';
import '../styles/NativeLoadingSpinner.css';

interface NativeLoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  style?: 'default' | 'primary' | 'white';
}

const NativeLoadingSpinner: React.FC<NativeLoadingSpinnerProps> = ({ 
  size = 'medium',
  style = 'default'
}) => {
  return (
    <div className={`native-spinner ${size} ${style}`}>
      <div className="spinner-track">
        <div className="spinner-fill"></div>
      </div>
    </div>
  );
};

export default NativeLoadingSpinner;