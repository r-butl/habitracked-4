import React from 'react';
import './ChooseHabitType.css';
import { Modal } from 'react-bootstrap';

export const ChooseHabitType = ({ show, onClose, onSelectList, onCreateCustomHabit }) => {
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <div className="habit-choice-modal p-4 position-relative">
        <button className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose}></button>
        <div className="d-flex justify-content-around align-items-center">
          <div className="choice-box text-center" onClick={onSelectList}>
            <i className="bi bi-grid-3x3-gap display-4 mb-2"></i>
            <div>Select from a Curated List</div>
          </div>
          <div className="vertical-divider"></div>
          <div className="choice-box text-center" onClick={onCreateCustomHabit}>
            <i className="bi bi-plus-circle display-4 mb-2"></i>
            <div>Create a Habit</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
