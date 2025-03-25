import React, { ReactNode } from 'react';
import styles from './Modal.module.css';

// Define an interface for the Modal component props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;  // ReactNode allows any valid React child (elements, strings, numbers, etc.)
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <button className={styles.closeButton} onClick={onClose}>×</button>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.video}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
