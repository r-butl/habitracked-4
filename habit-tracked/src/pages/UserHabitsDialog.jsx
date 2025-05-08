import React, { useEffect, useState, useContext } from 'react';
import { getUserHabits, deleteHabit, updateHabit } from '../utils/api';
import { UserContext } from '../context/userContext';
import { Popup } from '../components/Popup/Popup';
import { CustomHabitForm } from '../components/CustomHabitForm/CustomHabitForm';

export function UserHabitsDialog({ show, onClose }) {
  const { user } = useContext(UserContext);
  const [userHabits, setUserHabits] = useState([]);
  const [habitToEdit, setHabitToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // Fetch user habits
  useEffect(() => {
    if (!show) return;

    const fetchHabits = async () => {
      setLoading(true);
      try {
        const data = await getUserHabits(user.id);
        setUserHabits(data);
      } catch (err) {
        console.error("Failed to load user habits", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHabits();
  }, [show, user.id]);

  // Handle deleting habit
  const handleDeleteHabit = async (habitToDelete) => {
    try {
      await deleteHabit(habitToDelete._id);
      const data = await getUserHabits(user.id);
      setUserHabits(data);
      setPopupMessage("Habit deleted successfully! Please refresh the page.");
      setIsPopupVisible(true);
    } catch (err) {
      console.error("Delete failed", err);
      setPopupMessage("Failed to delete habit.");
      setIsPopupVisible(true);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Main habits modal */}
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Choose a Habit to Edit</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {loading ? (
                <p>Loading habits...</p>
              ) : (
                <ul className="list-group">
                  {userHabits.map((habit, index) => (
                    <li key={index} className="list-group-item d-flex align-items-center">
                      {habit.image && (
                        <img
                          src={habit.image}
                          alt={habit.name}
                          style={{
                            width: '50px',
                            height: '50px',
                            marginRight: '1rem',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                      )}
                      <div className="flex-grow-1">
                        <strong>{habit.name}</strong>
                        <p className="mb-1">{habit.description}</p>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => setHabitToEdit(habit)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteHabit(habit)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Popup Message */}
      {isPopupVisible && (
        <Popup
          isVisible={isPopupVisible}
          message={popupMessage}
          onClose={() => setIsPopupVisible(false)}
        />
      )}

      {/* Edit Habit Modal */}
      {habitToEdit && (
        <CustomHabitForm
          show={!!habitToEdit}
          initialHabit={habitToEdit}
          onSubmit={async (updatedHabit) => {
            try {
              await updateHabit(habitToEdit._id, updatedHabit);
              const data = await getUserHabits(user.id);
              setUserHabits(data);
              setPopupMessage("Habit updated successfully!");
              setIsPopupVisible(true);
              setHabitToEdit(null);
            } catch (err) {
              console.error("Update failed", err);
              setPopupMessage("Failed to update habit.");
              setIsPopupVisible(true);
            }
          }}
          onHide={() => setHabitToEdit(null)}
        />
      )}
    </>
  );
}
