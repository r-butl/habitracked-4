import React from 'react';
import './EditHabitButton.css';

export const EditHabitButton = ({ onClick }) => {
  return (
    <button className="edit-habit-btn" onClick={onClick}>
      <i className="bi bi-plus-square me-2"></i>
      Edit a Habit
    </button>
  );
};