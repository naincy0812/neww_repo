import React from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // Use a portal so that the modal is rendered at the root of the DOM tree. This prevents it from
  // inheriting positioning contexts (e.g. transformed ancestors) that could cause the overlay to
  // be offset from the viewport centre.
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          transition: 'transform 0.3s ease-in-out',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className="modal-close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#e2e8f0',
          }}
        >
          &times;
        </span>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
