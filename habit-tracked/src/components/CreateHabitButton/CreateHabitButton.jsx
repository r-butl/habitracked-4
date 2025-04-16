import React from 'react';
import './CreateHabitButton.css';

export const CreateHabitButton = ({ onClick }) => {
  return (
    <button className="create-habit-btn" onClick={onClick}>
      <i className="bi bi-plus-square me-2"></i>
      Create a Habit
    </button>
  );
};

