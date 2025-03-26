import React from 'react';

interface LinearProgressProps {
    progress: number;
}

const LinearProgress: React.FC<LinearProgressProps> = ({ progress }) => {
    return (
        <div className="progress-bar-container">
            <div className="progress-bar-background">
                <div 
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="progress-text">
                <span>{Math.round(progress)}%</span>
                <span>100%</span>
            </div>
        </div>
    );
};

export default LinearProgress; 