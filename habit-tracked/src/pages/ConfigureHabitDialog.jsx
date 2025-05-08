import React, { useState } from 'react';
import { Popup } from '../components/Popup/Popup';

export function ConfigureHabitDialog({ habit, onClose, onSubmit }) {
    const [timeBlock, setTimeBlock] = useState(habit.timeBlock || "morning");
    const [start, setStart] = useState(() => new Date().toISOString().slice(0, 16));
    const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 16));
    const [recurrence, setRecurrence] = useState({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
    });
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");

    const toggleDay = (day) => {
        setRecurrence((prev) => ({ ...prev, [day]: !prev[day] }));
    };

    const showError = (message) => {
        setPopupMessage(message);
        setShowPopup(true);
    };

    const handleSubmit = () => {
        const selectedDays = Object.keys(recurrence).filter((day) => recurrence[day]);
      
        if (!timeBlock || !start || !end) {
          showError("Please fill in all required fields.");
          return;
        }
      
        const startDate = new Date(start);
        const endDate = new Date(end);
      
        if (endDate <= startDate) {
          showError("End time should be greater than start time.");
          return;
        }
      
        const habitData = {
          ...habit,
          timeBlock,
          minTime: Math.floor(startDate.getTime() / 1000 / 60),
          maxTime: Math.floor(endDate.getTime() / 1000 / 60),
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          recurrence: selectedDays,
        };
      
        onSubmit(habitData);
      };


    return (
        <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Configure "{habit.name}"</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label className="form-label">Time Block</label>
                            <select className="form-select" value={timeBlock} onChange={(e) => setTimeBlock(e.target.value)}>
                                <option value="morning">Morning</option>
                                <option value="afternoon">Afternoon</option>
                                <option value="evening">Evening</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Start Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">End Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Recurrence</label>
                            <div className="d-flex flex-wrap gap-2">
                                {Object.keys(recurrence).map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`btn btn-sm ${recurrence[day] ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => toggleDay(day)}
                                    >
                                        {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-success" onClick={handleSubmit} disabled={!start || !end}>Save</button>
                    </div>
                </div>
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
