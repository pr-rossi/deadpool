import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { 
  faDumbbell, 
  faCalendarDay, 
  faWifi, 
  faExclamationTriangle, 
  faSearch,
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import '../styles/EmptyState.css';

interface EmptyStateProps {
  type?: 'empty' | 'error' | 'offline' | 'search' | 'completed';
  icon?: IconDefinition;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
  };
  illustration?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'empty',
  icon,
  title,
  description,
  action,
  illustration,
  className = ''
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'error': return faExclamationTriangle;
      case 'offline': return faWifi;
      case 'search': return faSearch;
      case 'completed': return faCheckCircle;
      default: return faDumbbell;
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={`empty-state ${type} ${className}`}>
      <div className="empty-state-content">
        {illustration ? (
          <div className="empty-state-illustration">
            {illustration}
          </div>
        ) : (
          <div className="empty-state-icon">
            <FontAwesomeIcon icon={displayIcon} />
          </div>
        )}
        
        <div className="empty-state-text">
          <h2 className="empty-state-title">{title}</h2>
          {description && (
            <p className="empty-state-description">{description}</p>
          )}
        </div>
        
        {action && (
          <button 
            className={`empty-state-action ${action.variant || 'primary'}`}
            onClick={action.onPress}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

// Specialized empty state components
interface WorkoutEmptyStateProps {
  onStartWorkout?: () => void;
}

export const WorkoutEmptyState: React.FC<WorkoutEmptyStateProps> = ({ onStartWorkout }) => (
  <EmptyState
    type="empty"
    icon={faDumbbell}
    title="No Workouts Yet"
    description="Start your fitness journey by creating your first workout plan."
    action={onStartWorkout ? {
      label: "Start First Workout",
      onPress: onStartWorkout,
      variant: "primary"
    } : undefined}
  />
);

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = "Something went wrong",
  description = "We're having trouble loading your content. Please try again.",
  onRetry 
}) => (
  <EmptyState
    type="error"
    title={title}
    description={description}
    action={onRetry ? {
      label: "Try Again",
      onPress: onRetry,
      variant: "primary"
    } : undefined}
  />
);

interface OfflineStateProps {
  onRetry?: () => void;
}

export const OfflineState: React.FC<OfflineStateProps> = ({ onRetry }) => (
  <EmptyState
    type="offline"
    title="You're Offline"
    description="Check your internet connection and try again."
    action={onRetry ? {
      label: "Retry",
      onPress: onRetry,
      variant: "primary"
    } : undefined}
  />
);

interface SearchEmptyStateProps {
  query?: string;
  onClearSearch?: () => void;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ 
  query, 
  onClearSearch 
}) => (
  <EmptyState
    type="search"
    title={query ? `No results for "${query}"` : "No results found"}
    description="Try adjusting your search or browse all exercises."
    action={onClearSearch ? {
      label: "Clear Search",
      onPress: onClearSearch,
      variant: "secondary"
    } : undefined}
  />
);

interface CompletedStateProps {
  title?: string;
  description?: string;
  onContinue?: () => void;
}

export const CompletedState: React.FC<CompletedStateProps> = ({ 
  title = "Great job!",
  description = "You've completed all your exercises for today.",
  onContinue 
}) => (
  <EmptyState
    type="completed"
    title={title}
    description={description}
    action={onContinue ? {
      label: "Continue",
      onPress: onContinue,
      variant: "primary"
    } : undefined}
  />
);

export default EmptyState;