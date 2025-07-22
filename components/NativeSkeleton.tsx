import React from 'react';
import '../styles/NativeSkeleton.css';

interface NativeSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list-item';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
  className?: string;
}

const NativeSkeleton: React.FC<NativeSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  animated = true,
  className = ''
}) => {
  const getSkeletonStyle = () => {
    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;
    return style;
  };

  if (variant === 'card') {
    return (
      <div className={`native-skeleton card ${animated ? 'animated' : ''} ${className}`}>
        <div className="skeleton-header">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-text-group">
            <div className="skeleton-line short"></div>
            <div className="skeleton-line shorter"></div>
          </div>
        </div>
        <div className="skeleton-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line medium"></div>
        </div>
      </div>
    );
  }

  if (variant === 'list-item') {
    return (
      <div className={`native-skeleton list-item ${animated ? 'animated' : ''} ${className}`}>
        <div className="skeleton-avatar small"></div>
        <div className="skeleton-text-group flex-1">
          <div className="skeleton-line medium"></div>
          <div className="skeleton-line short"></div>
        </div>
        <div className="skeleton-line tiny"></div>
      </div>
    );
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`native-skeleton text ${animated ? 'animated' : ''} ${className}`} style={getSkeletonStyle()}>
        {Array.from({ length: lines }, (_, index) => (
          <div 
            key={index} 
            className={`skeleton-line ${index === lines - 1 ? 'short' : ''}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={`native-skeleton ${variant} ${animated ? 'animated' : ''} ${className}`}
      style={getSkeletonStyle()}
    />
  );
};

// Skeleton container for loading states
interface SkeletonGroupProps {
  loading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({ loading, children, skeleton }) => {
  return loading ? <>{skeleton}</> : <>{children}</>;
};

export default NativeSkeleton;