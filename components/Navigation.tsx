import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface NavigationProps {
    onBack: () => void;
    onNext?: () => void;
    showNext?: boolean;
    nextText?: string;
    backText?: string;
}

const Navigation: React.FC<NavigationProps> = ({ 
    onBack, 
    onNext, 
    showNext = false,
    nextText = 'Next',
    backText = 'Back'
}) => {
    return (
        <div className="nav-footer">
            <button className="nav-button" onClick={onBack}>
                <FontAwesomeIcon icon={faChevronLeft} /> {backText}
            </button>
            {showNext && onNext && (
                <button className="nav-button next" onClick={onNext}>
                    {nextText} <FontAwesomeIcon icon={faChevronRight} />
                </button>
            )}
        </div>
    );
};

export default Navigation; 