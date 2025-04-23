import React, { useEffect, useState } from 'react';
import { getCuratedHabits } from '../utils/api';

export function CuratedHabitsDialog({ show, onClose, onSelect }) {
    const [curatedHabits, setCuratedHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!show) return;

        const fetchCurated = async () => {
            setLoading(true);
            try {
                const data = await getCuratedHabits();
                setCuratedHabits(data);
            } catch (err) {
                console.error("Failed to load curated habits", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCurated();
    }, [show]);

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Choose a Curated Habit</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        {loading ? (
                            <p>Loading curated habits...</p>
                        ) : (
                            <ul className="list-group">
                                {curatedHabits.map((habit, index) => (
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
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        )}
                                        <div className="flex-grow-1">
                                            <strong>{habit.name}</strong>
                                            <p className="mb-1">{habit.description}</p>
                                        </div>
                                        <button className="btn btn-sm btn-primary ms-2" onClick={() => onSelect(habit)}>
                                            Add
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
