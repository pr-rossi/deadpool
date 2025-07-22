import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useHaptics } from '../utils/haptics';
import '../styles/Toast.css';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onPress: () => void;
  };
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  dismissible = true,
  action,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const haptics = useHaptics();

  const getIcon = () => {
    switch (type) {
      case 'success': return faCheckCircle;
      case 'error': return faExclamationCircle;
      case 'warning': return faExclamationCircle;
      case 'info': return faInfoCircle;
      default: return faInfoCircle;
    }
  };

  const handleDismiss = () => {
    haptics.light();
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 200);
  };

  const handleAction = () => {
    if (action) {
      haptics.medium();
      action.onPress();
      handleDismiss();
    }
  };

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto dismiss
    if (duration > 0) {
      const dismissTimer = setTimeout(handleDismiss, duration);
      return () => {
        clearTimeout(timer);
        clearTimeout(dismissTimer);
      };
    }
    
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div 
      className={`toast ${type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
    >
      <div className="toast-content">
        <div className="toast-icon">
          <FontAwesomeIcon icon={getIcon()} />
        </div>
        
        <div className="toast-text">
          <h4 className="toast-title">{title}</h4>
          {message && <p className="toast-message">{message}</p>}
        </div>
        
        {action && (
          <button className="toast-action" onClick={handleAction}>
            {action.label}
          </button>
        )}
        
        {dismissible && (
          <button className="toast-dismiss" onClick={handleDismiss}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

// Toast Manager Component
interface ToastManagerProps {
  toasts: ToastProps[];
  onDismiss: (id: string) => void;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-manager">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id, onDismiss: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  const showSuccess = (title: string, message?: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'success', title, message, ...options });
  };

  const showError = (title: string, message?: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'error', title, message, ...options });
  };

  const showWarning = (title: string, message?: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'warning', title, message, ...options });
  };

  const showInfo = (title: string, message?: string, options?: Partial<ToastProps>) => {
    addToast({ type: 'info', title, message, ...options });
  };

  return {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    removeAllToasts
  };
};

export default Toast;