import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPlay, faChevronRight, faClock, faDumbbell, faRotate } from '@fortawesome/free-solid-svg-icons';
import '../styles/ExerciseCard.css';

interface ExerciseCardProps {
  exerciseName: string;
  sets?: number;
  reps?: string;
  rest?: number;
  isCompleted?: boolean;
  hasVideo?: boolean;
  onClick?: () => void;
  onComplete?: () => void;
  animationDelay?: number;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseName,
  sets,
  reps,
  rest,
  isCompleted = false,
  hasVideo = false,
  onClick,
  onComplete,
  animationDelay = 0
}) => {
  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete?.();
  };

  return (
    <div 
      className={`exercise-card ${isCompleted ? 'completed' : ''}`}
      onClick={onClick}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <div className="exercise-card-header">
        <div className="exercise-icon">
          <FontAwesomeIcon icon={faDumbbell} />
        </div>
        
        <div className="exercise-info">
          <h3 className="exercise-name">{exerciseName}</h3>
          
          <div className="exercise-details">
            {sets && reps && (
              <span className="exercise-metric">
                <FontAwesomeIcon icon={faRotate} className="metric-icon" />
                {sets} × {reps}
              </span>
            )}
            
            {rest && (
              <span className="exercise-metric">
                <FontAwesomeIcon icon={faClock} className="metric-icon" />
                {rest}s rest
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="exercise-card-actions">
        {hasVideo && (
          <span className="video-indicator">
            <FontAwesomeIcon icon={faPlay} />
          </span>
        )}
        
        <button
          className={`complete-circle ${isCompleted ? 'completed' : ''}`}
          onClick={handleComplete}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <FontAwesomeIcon icon={faCheck} />}
        </button>
        
        <FontAwesomeIcon icon={faChevronRight} className="chevron-icon" />
      </div>

      {isCompleted && <div className="completion-glow" />}
    </div>
  );
};

export default ExerciseCard;