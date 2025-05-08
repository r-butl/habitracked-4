import React, { useState } from 'react';
import { Popup } from '../components/Popup/Popup';

export function ConfigureHabitDialog({ habit, onClose, onSubmit }) {
    const [timeBlock, setTimeBlock] = useState(habit.timeBlock || "morning");
    const [start, setStart] = useState(habit.start ? new Date(habit.start) : new Date());
    const [end, setEnd] = useState(habit.end ? new Date(habit.end) : new Date(Date.now() + 3600000));
    const [recurrence, setRecurrence] = useState(() => {
        const defaultDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const selected = habit.recurrence || [];
        return defaultDays.reduce((acc, day) => {
          acc[day] = selected.includes(day);
          return acc;
        }, {});
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
        else{
            const durationMinutes = Math.round((new Date(end) - new Date(start)) / 60000);
            const habitData = {
                ...habit,
                timeBlock,
                minTime: durationMinutes,
                maxTime: durationMinutes,
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString(),
                recurrence: selectedDays, // pass array for new recurrence structure
            };
            onSubmit(habitData);
        }
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
