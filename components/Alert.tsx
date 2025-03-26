import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/Alert.css';

interface AlertProps {
    type: 'success' | 'error' | 'warning';
    message: string;
    onClose: () => void;
    duration?: number;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return faCheckCircle;
            case 'error':
                return faTimesCircle;
            case 'warning':
                return faExclamationCircle;
            default:
                return faExclamationCircle;
        }
    };

    return (
        <div className={`alert alert-${type}`}>
            <FontAwesomeIcon icon={getIcon()} className="alert-icon" />
            <span className="alert-message">{message}</span>
            <button className="alert-close" onClick={onClose}>
                <FontAwesomeIcon icon={faTimesCircle} />
            </button>
        </div>
    );
};

export default Alert; 