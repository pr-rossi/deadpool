import React from 'react';
import '../styles/ConfirmationModal.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    message,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-modal">
                <p className="confirmation-message">{message}</p>
                <div className="confirmation-buttons">
                    <button className="cancel-button" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="confirm-button" onClick={onConfirm}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 