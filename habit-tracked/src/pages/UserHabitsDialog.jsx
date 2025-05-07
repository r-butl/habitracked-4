import React, { useEffect, useState, useContext } from 'react';
import { getUserHabits, deleteHabit } from '../utils/api';
import { ConfigureHabitDialog } from './ConfigureHabitDialog';
import { UserContext } from '../context/userContext';
import { Popup } from '../components/Popup/Popup';

export function UserHabitsDialog({ show, onClose, onSelect }) {
  const { user } = useContext(UserContext);
  const [userHabits, setUserHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState(null);
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
      await deleteHabit(habitToDelete._id); // Delete from backend
      // Refetch the habits to ensure the latest data from the server
      const data = await getUserHabits(user.id);
      setUserHabits(data); // Update the local state with the latest habits
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
                          onClick={() => setSelectedHabit(habit)}
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

      {/* Configurator Modal */}
      {selectedHabit && (
        <ConfigureHabitDialog
          habit={selectedHabit}
          onClose={() => setSelectedHabit(null)}
          onSubmit={(finalHabit) => {
            onSelect(finalHabit); // Pass the configured habit back to the parent
            setSelectedHabit(null);
          }}
        />
      )}
    </>
  );
}