import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faFire, faTrophy, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import ProgressRing from './ProgressRing';
import '../styles/WorkoutProgressCard.css';

interface WorkoutProgressCardProps {
  title: string;
  subtitle?: string;
  progress: number;
  exerciseCount: number;
  completedCount: number;
  onClick?: () => void;
  isActive?: boolean;
}

const WorkoutProgressCard: React.FC<WorkoutProgressCardProps> = ({
  title,
  subtitle,
  progress,
  exerciseCount,
  completedCount,
  onClick,
  isActive = false
}) => {
  const isCompleted = progress === 100;

  return (
    <div 
      className={`workout-progress-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
      onClick={onClick}
    >
      <div className="workout-progress-header">
        <div className="workout-icon-wrapper">
          <FontAwesomeIcon 
            icon={isCompleted ? faTrophy : faDumbbell} 
            className="workout-icon"
          />
        </div>
        
        <div className="workout-info">
          <h3 className="workout-title">{title}</h3>
          {subtitle && <p className="workout-subtitle">{subtitle}</p>}
        </div>

        <ProgressRing 
          percentage={progress} 
          size="small"
          showPercentage={!isCompleted}
        />
      </div>

      <div className="workout-stats">
        <div className="stat-item">
          <FontAwesomeIcon icon={faFire} className="stat-icon" />
          <span className="stat-value">{completedCount}/{exerciseCount}</span>
          <span className="stat-label">Exercises</span>
        </div>

        <div className="progress-bar">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          >
            <div className="progress-bar-glow" />
          </div>
        </div>
      </div>

      <FontAwesomeIcon 
        icon={faChevronRight} 
        className="card-chevron"
      />

      {isCompleted && <div className="completion-badge">Complete!</div>}
    </div>
  );
};

export default WorkoutProgressCard;