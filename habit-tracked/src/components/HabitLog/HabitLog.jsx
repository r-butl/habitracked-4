import React, { useState } from 'react';
import { createLog } from '../../utils/api';
import { Popup } from '../Popup/Popup';

export default function HabitCard({ habit, onLogCreated }) {
  const [minutes, setMinutes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleLog = async () => {
    if (!minutes || isNaN(minutes)) {
        setPopupMessage("Please enter a valid number of minutes.");
        setShowPopup(true);
        return;
    }
    setIsLoading(true);
    try {
        const res = await createLog(habit._id, minutes);
        setPopupMessage(`Logged ${res.log.duration} minutes for "${habit.name}"`);
        setShowPopup(true);
        setMinutes('');
        if (onLogCreated) onLogCreated();
    } 
    catch (err) {
        setPopupMessage("Failed to log.");
        setShowPopup(true);
    } 
    finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="card mb-3 p-3 shadow-sm">
      <h6 className="mb-1 text-dark">{habit.name}</h6>
      <p className="mb-2 text-muted">Goal: {habit.minutes} mins/day</p>
      <div className="d-flex gap-2">
        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          placeholder="Minutes"
          className="form-control form-control-sm"
        />
        <button onClick={handleLog} disabled={isLoading} className="btn btn-sm btn-primary">
            {isLoading ? "Logging..." : "Log"}
        </button>
      </div>
      {showPopup && (
        <Popup 
          isVisible={showPopup} 
          message={popupMessage} 
          onClose={() => setShowPopup(false)} 
        />
      )}
    </div>
  );
}
