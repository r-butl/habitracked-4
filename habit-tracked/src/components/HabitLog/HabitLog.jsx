import React, { useState } from 'react';

export default function HabitCard({ habit }) {
  const [minutes, setMinutes] = useState('');

  const handleLog = () => {
    if (!minutes || isNaN(minutes)) {
      alert("Please enter a valid number of minutes.");
      return;
    }
    console.log(`Habit: ${habit.name}, Logged: ${minutes} minutes`);
    alert(`Logged ${minutes} minutes for "${habit.name}"!`);
    setMinutes('');
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
        <button onClick={handleLog} className="btn btn-sm btn-primary">
          Log
        </button>
      </div>
    </div>
  );
}
