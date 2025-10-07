import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { Exercise } from '../types';
import Navigation from './Navigation';
import LinearProgress from './CircularProgress';
import '../styles/WorkoutView.css';

interface WorkoutViewProps {
    groupedExercises: { [key: string]: Exercise[] };
    completedExercises: Set<string>;
    onExerciseSelect: (groupName: string) => void;
    onBack: () => void;
}

const WorkoutView: React.FC<WorkoutViewProps> = ({
    groupedExercises,
    completedExercises,
    onExerciseSelect,
    onBack
}) => {
    const getGroupProgress = (exercises: Exercise[]) => {
        const completedCount = exercises.filter(exercise => completedExercises.has(exercise.id)).length;
        return exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;
    };

    const isGroupCompleted = (exercises: Exercise[]) => {
        return exercises.length > 0 && exercises.every(exercise => completedExercises.has(exercise.id));
    };

    const getExerciseCount = (exercises: Exercise[]) => {
        return `${exercises.length} exercise${exercises.length !== 1 ? 's' : ''}`;
    };

    return (
        <>
            <div className="workout-grid">
                {Object.entries(groupedExercises).map(([groupName, exercises]) => {
                    const progress = getGroupProgress(exercises);
                    return (
                        <button
                            key={groupName}
                            className={`workout-card ${isGroupCompleted(exercises) ? 'completed' : ''}`}
                            onClick={() => onExerciseSelect(groupName)}
                        >
                            <div className="workout-header">
                                <div className="workout-title">
                                    <div className="workout-icon">
                                        <FontAwesomeIcon icon={faDumbbell} />
                                    </div>
                                    <div className="workout-info">
                                        <span className="workout-name">{groupName}</span>
                                        <span className="exercise-count">{getExerciseCount(exercises)}</span>
                                    </div>
                                </div>
                                <FontAwesomeIcon icon={faChevronRight} className="chevron-icon" />
                            </div>
                            <div className="workout-progress">
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
            <Navigation onBack={onBack} backText="Day" />
        </>
    );
};

export default WorkoutView; 