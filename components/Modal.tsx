import React, { ReactNode } from 'react';

// Define an interface for the Modal component props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;  // ReactNode allows any valid React child (elements, strings, numbers, etc.)
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
      <button onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
