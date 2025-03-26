import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faDumbbell, 
    faChevronRight, 
    faFire,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import ProfileHeader from './ProfileHeader';
import '../styles/LandingPage.css';

interface WorkoutPlan {
    id: string;
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    progress?: number;
}

interface LandingPageProps {
    onPlanSelect: (planId: string) => void;
    userEmail: string;
    userName: string;
    onLogout: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
    onPlanSelect, 
    userEmail,
    userName,
    onLogout 
}) => {
    // This would eventually come from your backend
    const workoutPlans: WorkoutPlan[] = [
        {
            id: '1',
            title: '12-Week Strength Program',
            description: 'A comprehensive strength training program designed to build muscle and increase overall strength.',
            duration: '12 weeks',
            difficulty: 'Intermediate',
            progress: 25, // This would be calculated based on user progress
        }
    ];

    return (
        <div className="landing-container">
            <div className="header-row">
                <div className="landing-header">
                    <h1>Welcome back!</h1>
                    <p className="subtitle">Select a workout plan to begin your fitness journey</p>
                </div>
                <ProfileHeader 
                    userEmail={userEmail}
                    userName={userName}
                    onLogout={onLogout}
                />
            </div>

            <div className="plans-grid">
                {workoutPlans.map(plan => (
                    <button
                        key={plan.id}
                        className="plan-card"
                        onClick={() => onPlanSelect(plan.id)}
                    >
                        <div className="plan-icon">
                            <FontAwesomeIcon icon={faDumbbell} />
                        </div>
                        <div className="plan-content">
                            <div className="plan-header">
                                <h2 className="plan-title">{plan.title}</h2>
                                <FontAwesomeIcon icon={faChevronRight} className="chevron-icon" />
                            </div>
                            <p className="plan-description">{plan.description}</p>
                            <div className="plan-metrics">
                                <div className="plan-metric">
                                    <FontAwesomeIcon icon={faClock} />
                                    <span>{plan.duration}</span>
                                </div>
                                <div className="plan-metric">
                                    <FontAwesomeIcon icon={faFire} />
                                    <span>{plan.difficulty}</span>
                                </div>
                            </div>
                            {plan.progress !== undefined && (
                                <div className="plan-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill"
                                            style={{ width: `${plan.progress}%` }}
                                        />
                                    </div>
                                    <span className="progress-text">{plan.progress}% Complete</span>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LandingPage; 