import React from 'react';
import '../styles/ProgressRing.css';

interface ProgressRingProps {
  percentage: number;
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  strokeWidth?: number;
  className?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 'medium',
  showPercentage = true,
  strokeWidth = 4,
  className = ''
}) => {
  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80
  };

  const radius = sizeMap[size] / 2;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`progress-ring ${size} ${className}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="progress-ring-svg"
      >
        <circle
          className="progress-ring-background"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="progress-ring-progress"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {showPercentage && (
        <div className="progress-ring-text">
          <span className="progress-percentage">{Math.round(percentage)}</span>
          <span className="progress-percent-sign">%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressRing;