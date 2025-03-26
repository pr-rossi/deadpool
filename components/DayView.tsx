import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faChevronRight, 
    faRotateLeft 
} from '@fortawesome/free-solid-svg-icons';
import { Exercise } from '../types';
import Navigation from './Navigation';
import LinearProgress from './CircularProgress';
import DropdownMenu from './DropdownMenu';
import '../styles/DayView.css';

interface DayViewProps {
    uniqueWorkoutDays: string[];
    completedExercises: Set<string>;
    onDaySelect: (day: string) => void;
    selectedWorkoutWeek: string;
    workoutData: Exercise[];
    onBack: () => void;
    onRestartWeek: () => void;
}

const DayView: React.FC<DayViewProps> = ({
    uniqueWorkoutDays,
    completedExercises,
    onDaySelect,
    selectedWorkoutWeek,
    workoutData,
    onBack,
    onRestartWeek
}) => {
    const getDayProgress = (day: string) => {
        const dayExercises = workoutData.filter(
            data => data.fields.WorkoutWeek === selectedWorkoutWeek && data.fields.WorkoutDay === day
        );
        const completedCount = dayExercises.filter(exercise => completedExercises.has(exercise.id)).length;
        return dayExercises.length > 0 ? (completedCount / dayExercises.length) * 100 : 0;
    };

    const isDayCompleted = (day: string) => {
        const dayExercises = workoutData.filter(
            data => data.fields.WorkoutWeek === selectedWorkoutWeek && data.fields.WorkoutDay === day
        );
        return dayExercises.length > 0 && dayExercises.every(exercise => completedExercises.has(exercise.id));
    };

    const getDayName = (day: string) => {
        switch (day) {
            case '1': return 'Legs';
            case '2': return 'Chest';
            case '3': return 'Arm Day';
            case '4': return 'Back Day';
            default: return 'Shoulders & Abs';
        }
    };

    const handleRestartWeek = () => {
        onRestartWeek();
    };

    const hasCompletedExercisesInWeek = workoutData.some(
        exercise => 
            exercise.fields.WorkoutWeek === selectedWorkoutWeek && 
            completedExercises.has(exercise.id)
    );

    const dropdownItems = hasCompletedExercisesInWeek ? [
        {
            label: 'Restart Week',
            icon: faRotateLeft,
            onClick: handleRestartWeek,
            className: 'danger'
        }
    ] : [];

    return (
        <>
            <div className="day-header-row">
                <h1>Week {selectedWorkoutWeek}</h1>
                {hasCompletedExercisesInWeek && (
                    <DropdownMenu items={dropdownItems} />
                )}
            </div>
            <div className="day-grid">
                {uniqueWorkoutDays
                    .sort((a, b) => parseInt(a) - parseInt(b))
                    .map(day => {
                        const progress = getDayProgress(day);
                        return (
                            <button
                                key={day}
                                className={`day-card ${isDayCompleted(day) ? 'completed' : ''}`}
                                onClick={() => onDaySelect(day)}
                            >
                                <div className="day-header">
                                    <div className="day-title">
                                        <span className="day-number">Day {day}</span>
                                        <span className="day-name">{getDayName(day)}</span>
                                    </div>
                                    <FontAwesomeIcon icon={faChevronRight} className="chevron-icon" />
                                </div>
                                <div className="day-progress">
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
            <Navigation onBack={onBack} backText="Week" />
        </>
    );
};

export default DayView; 