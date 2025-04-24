import React from 'react';
import './Popup.css';

export const Popup = ({ isVisible, message, onClose }) => {
    if (!isVisible) return null;
    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <p>{message}</p>
            <button onClick={onClose}>Close</button>
            </div>
        </div>
        );
}