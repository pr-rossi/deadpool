import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheck, 
    faChevronRight, 
    faRotateLeft 
} from '@fortawesome/free-solid-svg-icons';
import LinearProgress from './CircularProgress';
import Navigation from './Navigation';
import DropdownMenu from './DropdownMenu';
import { Exercise } from '../types';
import '../styles/WeekView.css';
import '../styles/LinearProgress.css';

interface WeekViewProps {
    uniqueWorkoutWeeks: string[];
    completedExercises: Set<string>;
    onWeekSelect: (week: string) => void;
    workoutData: Exercise[];
    onBack: () => void;
    onRestartPlan: () => void;
}

const WeekView: React.FC<WeekViewProps> = ({
    uniqueWorkoutWeeks,
    completedExercises,
    onWeekSelect,
    workoutData,
    onBack,
    onRestartPlan
}) => {
    const getWeekProgress = (week: string) => {
        const weekExercises = workoutData.filter(exercise => exercise.fields.WorkoutWeek === week);
        const completedCount = weekExercises.filter(exercise => completedExercises.has(exercise.id)).length;
        return weekExercises.length > 0 ? (completedCount / weekExercises.length) * 100 : 0;
    };

    const isWeekCompleted = (week: string) => {
        const weekExercises = workoutData.filter(exercise => exercise.fields.WorkoutWeek === week);
        return weekExercises.length > 0 && weekExercises.every(exercise => completedExercises.has(exercise.id));
    };

    const handleRestartClick = () => {
        onRestartPlan();
    };

    const hasCompletedExercises = completedExercises.size > 0;

    const dropdownItems = hasCompletedExercises ? [
        {
            label: 'Restart Plan',
            icon: faRotateLeft,
            onClick: handleRestartClick,
            className: 'danger'
        }
    ] : [];

    return (
        <>
            <div className="week-header-row">
                <h1>Select a week to begin</h1>
                {hasCompletedExercises && (
                    <DropdownMenu items={dropdownItems} />
                )}
            </div>
            <div className="week-grid">
                {uniqueWorkoutWeeks
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map(week => {
                        const progress = getWeekProgress(week);
                        return (
                            <button
                                key={week}
                                className={`week-card ${isWeekCompleted(week) ? 'completed' : ''}`}
                                onClick={() => onWeekSelect(week)}
                            >
                                <div className="week-header">
                                    <span className="week-number">Week {week}</span>
                                    <FontAwesomeIcon icon={faChevronRight} className="chevron-icon" />
                                </div>
                                <div className="week-progress">
                                    {progress === 0 ? (
                                        <span className="not-started-pill">Not started</span>
                                    ) : (
                                        <LinearProgress progress={progress} />
                                    )}
                                </div>
                            </button>
                        );
                    })}
            </div>
            <Navigation onBack={onBack} backText="Plans" />
        </>
    );
};

export default WeekView; 