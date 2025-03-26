import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import LinearProgress from './CircularProgress';
import Navigation from './Navigation';
import { Exercise } from '../types';
import '../styles/WeekView.css';
import '../styles/LinearProgress.css';

interface WeekViewProps {
    uniqueWorkoutWeeks: string[];
    completedExercises: Set<string>;
    onWeekSelect: (week: string) => void;
    workoutData: Exercise[];
    onBack: () => void;
}

const WeekView: React.FC<WeekViewProps> = ({
    uniqueWorkoutWeeks,
    completedExercises,
    onWeekSelect,
    workoutData,
    onBack
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

    return (
        <>
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