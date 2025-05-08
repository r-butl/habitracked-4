import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../context/userContext';
import { LogHistoryGraph } from '../components/LogHistoryGraph/LogHistoryGraph';
import HabitLog from '../components/HabitLog/HabitLog';
import { getUserHabits } from '../utils/api';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const [habits, setHabits] = useState([]);

  const fetchHabits = async () => {
    if (!user || !user.id) return;
    try {
      const data = await getUserHabits(user.id);
      setHabits(data);
    } catch (err) {
      console.error("Error fetching habits: ", err);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user]); 

  return (
    <div className="container min-vh-100">
      <div className="card shadow-lg p-4 text-center mb-4 mx-auto" style={{ maxWidth: "600px", marginTop: "40px" }}>
        <h1 className="text-primary mb-3">Dashboard</h1>
        {!!user && (
          <h2 className="text-secondary fs-4">Hi, {user.name}! 👋</h2>
        )}
      </div>

      <div className="row">
        <div className="col-md-8 mb-4">
          <LogHistoryGraph />
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm" style={{ height: "100%" }}>
            <h5 className="text-primary mb-3">All Habits</h5>
            <div style={{ overflowY: "auto", maxHeight: "400px" }}>
              {habits.length > 0 ? (
                habits.map(habit => (
                  <HabitLog key={habit.id} habit={habit} />
                ))
              ) : (
                <p className="text-muted">No habits found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
