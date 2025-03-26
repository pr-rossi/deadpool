import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCheck, 
    faCirclePlay, 
    faClock, 
    faRepeat, 
    faLayerGroup 
} from '@fortawesome/free-solid-svg-icons';
import { Exercise } from '../types';
import Modal from './Modal';
import Navigation from './Navigation';
import '../styles/ExerciseView.css';

interface ExerciseViewProps {
    exercises: Exercise[];
    completedExercises: Set<string>;
    onExerciseComplete: (exerciseId: string) => void;
    onVideoOpen: (url: string) => void;
    isVideoModalOpen: boolean;
    currentVideoUrl: string;
    onCloseVideo: () => void;
    onBack: () => void;
    onNext: () => void;
    isLastExercise: boolean;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({
    exercises,
    completedExercises,
    onExerciseComplete,
    onVideoOpen,
    isVideoModalOpen,
    currentVideoUrl,
    onCloseVideo,
    onBack,
    onNext,
    isLastExercise
}) => {
    return (
        <>
            <div className="exercise-grid">
                {exercises.map((exercise) => (
                    <div key={exercise.id} className="exercise-card">
                        <div className="exercise-card-header">
                            <h2 className="exercise-name">{exercise.fields.Exercises}</h2>
                            <button 
                                className={`complete-button ${completedExercises.has(exercise.id) ? 'completed' : ''}`}
                                onClick={() => onExerciseComplete(exercise.id)}
                            >
                                <FontAwesomeIcon icon={faCheck} />
                                <span className="complete-text">
                                    {completedExercises.has(exercise.id) ? 'Completed' : 'Mark Complete'}
                                </span>
                            </button>
                        </div>
                        <div className="exercise-metrics">
                            <div className="metric">
                                <div className="metric-icon">
                                    <FontAwesomeIcon icon={faLayerGroup} />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Rounds</span>
                                    <span className="metric-value">{exercise.fields.Rounds}</span>
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric-icon">
                                    <FontAwesomeIcon icon={faRepeat} />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Reps</span>
                                    <span className="metric-value">{exercise.fields.Reps}</span>
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric-icon">
                                    <FontAwesomeIcon icon={faClock} />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Rest</span>
                                    <span className="metric-value">{exercise.fields.Rest} min</span>
                                </div>
                            </div>
                        </div>
                        {exercise.fields.Video && exercise.fields.Video[0] && (
                            <button 
                                className="watch-button"
                                onClick={() => onVideoOpen(exercise.fields.Video![0].url)}
                            >
                                <FontAwesomeIcon icon={faCirclePlay} />
                                Watch example
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <Navigation 
                onBack={onBack} 
                onNext={onNext} 
                showNext={true} 
                nextText={isLastExercise ? 'Finish' : 'Next'} 
                backText="Exercises"
            />
            <Modal isOpen={isVideoModalOpen} onClose={onCloseVideo}>
                <video controls autoPlay muted src={currentVideoUrl} width="100%">
                    Sorry, your browser does not support embedded videos.
                </video>
            </Modal>
        </>
    );
};

export default ExerciseView; 