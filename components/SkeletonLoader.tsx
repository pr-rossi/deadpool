import React from 'react';
import '../styles/SkeletonLoader.css';

interface SkeletonLoaderProps {
  type?: 'text' | 'card' | 'exercise' | 'workout' | 'circle';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'text', 
  count = 1,
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return <div className="skeleton skeleton-text" />;
      
      case 'circle':
        return <div className="skeleton skeleton-circle" />;
      
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-card-header">
              <div className="skeleton skeleton-circle" />
              <div className="skeleton-card-content">
                <div className="skeleton skeleton-text skeleton-title" />
                <div className="skeleton skeleton-text skeleton-subtitle" />
              </div>
            </div>
            <div className="skeleton skeleton-text skeleton-full" />
          </div>
        );
      
      case 'exercise':
        return (
          <div className="skeleton-exercise">
            <div className="skeleton-exercise-left">
              <div className="skeleton skeleton-icon" />
              <div className="skeleton-exercise-info">
                <div className="skeleton skeleton-text skeleton-title" />
                <div className="skeleton skeleton-text skeleton-subtitle" />
              </div>
            </div>
            <div className="skeleton-exercise-right">
              <div className="skeleton skeleton-circle skeleton-small" />
              <div className="skeleton skeleton-icon skeleton-chevron" />
            </div>
          </div>
        );
      
      case 'workout':
        return (
          <div className="skeleton-workout">
            <div className="skeleton-workout-header">
              <div className="skeleton skeleton-icon" />
              <div className="skeleton skeleton-text skeleton-title" />
              <div className="skeleton skeleton-circle skeleton-small" />
            </div>
            <div className="skeleton skeleton-progress-bar" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`skeleton-loader ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-item">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;