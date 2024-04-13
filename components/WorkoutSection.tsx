import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronUp, faChevronDown, faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import styles from './WorkoutSection.module.css';
import Modal from './Modal';

interface ExerciseRecord {
    Exercises?: string;
    Rounds?: number;
    Reps?: string;
    Rest?: number;
    Video?: { url: string }[];
}

interface WorkoutSectionProps {
    groupTitle: string;
    exercises: ExerciseRecord[];
    isOpen: boolean;
    onClick: () => void;
}

const WorkoutSection: React.FC<WorkoutSectionProps> = ({
    groupTitle,
    exercises,
    isOpen,
    onClick
}) => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);  // Define contentRef here

    const handleVideoOpen = (url: string) => {
        setCurrentVideoUrl(url);
        setIsVideoModalOpen(true);
    };

    useEffect(() => {
        if (isOpen && contentRef.current) {
            contentRef.current.style.maxHeight = `${contentRef.current.scrollHeight}px`;
        } else if (contentRef.current) {
            contentRef.current.style.maxHeight = '0';
        }
    }, [isOpen]);

    return (
        <div className={styles.workoutSection}>
            <button className={styles.button} onClick={onClick}>
                <span className={styles.title}>{groupTitle}</span>
                <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className={`${styles.arrow} ${isOpen ? styles.open : ''}`} />
            </button>
            <div ref={contentRef} className={styles.content}>
                {exercises.map((exercise, index) => (
                    <div key={index} className={styles.exercise}>
                        <div className="exercise-header">
                        <div className="exercise-title">{exercise.Exercises || "No Exercise Listed"}</div>
                        {exercise.Video && exercise.Video.map((video, vidIndex) => (
                            <button key={vidIndex} onClick={() => handleVideoOpen(video.url)} className="play-button">
                                <FontAwesomeIcon icon={faCirclePlay} />
                            </button>
                        ))}
                        </div>
                        <div className="rounds">Rounds: {exercise.Rounds !== undefined ? exercise.Rounds : "N/A"}</div>
                        <div className="reps">Reps: {exercise.Reps || "N/A"}</div>
                        <div className="rest">Rest: {exercise.Rest || "N/A"} min</div>
                    </div>
                ))}
            </div>
            <Modal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)}>
                <video controls autoPlay muted src={currentVideoUrl} width="100%">
                    Sorry, your browser does not support embedded videos.
                </video>
            </Modal>
        </div>
    );
};

export default WorkoutSection;
