import React, { useState } from 'react';

export function ConfigureHabitDialog({ habit, onClose, onSubmit }) {
    const [timeBlock, setTimeBlock] = useState(habit.timeBlock || "morning");
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [recurrence, setRecurrence] = useState({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
    });

    const toggleDay = (day) => {
        setRecurrence((prev) => ({ ...prev, [day]: !prev[day] }));
    };

    const handleSubmit = () => {
        const selectedDays = Object.keys(recurrence).filter((day) => recurrence[day]);
        
        if (!timeBlock || !start || !end) {
            alert("Please complete all fields.");
            return;
        }
        
        const habitData = {
            ...habit,
            timeBlock,
            minTime: parseInt((new Date(start).getTime() / 1000 / 60).toFixed(0)),
            maxTime: parseInt((new Date(end).getTime() / 1000 / 60).toFixed(0)),
            start: new Date(start).toISOString(),
            end: new Date(end).toISOString(),
            recurrence: selectedDays, // pass array for new recurrence structure
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
                            <input type="datetime-local" className="form-control" 
                                   value={new Date(start).toISOString().slice(0, 16)} 
                                   onChange={(e) => setStart(new Date(e.target.value))} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">End Time</label>
                            <input type="datetime-local" className="form-control" 
                                   value={new Date(end).toISOString().slice(0, 16)} 
                                   onChange={(e) => setEnd(new Date(e.target.value))} />
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
        </div>
    );
}
