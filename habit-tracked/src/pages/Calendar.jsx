import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../context/userContext';
import { DayPilot, DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { CreateHabitButton } from '../components/CreateHabitButton/CreateHabitButton';
import { ChooseHabitType } from '../components/ChooseHabitType/ChooseHabitType';
import { CustomHabitForm } from '../components/CustomHabitForm/CustomHabitForm';
import { getUserHabits, createHabit } from '../utils/api';

export default function Calendar() {
  const { user } = useContext(UserContext);
  const [showChooseHabit, setShowChooseHabit] = useState(false);
  const [showCustomHabitForm, setShowCustomHabitForm] = useState(false);
  const [habits, setHabits] = useState([]);
  const calendarRef = useRef(null);

  useEffect(() => {
    const fetchHabits = async () => {
      if (!user || !user.id) return;

      try {
        const data = await getUserHabits(user.id);
        setHabits(data);
      } catch (err) {
        console.error("Error fetching habits: ", err);
      }
    };
    fetchHabits();
  }, [user]);

  const onCreateClick = () => {
    setShowChooseHabit(true);
  };

  const onCreateCustomHabit = (newHabitData) => {
    setShowChooseHabit(false);
  
    const date = new DayPilot.Date(); // UTC
    const startLocal = date.toDateLocal(); // JS local Date
    const duration = 30;  // You can adjust the default duration
    const endLocal = new Date(startLocal.getTime() + duration * 60000); // Set the end time based on duration
  
    // Constructing the new habit using form data + the additional calculated fields
    const newHabit = {
      name: newHabitData.name, // Habit name from form
      icon: newHabitData.icon, // Icon from form (e.g., uploaded or default)
      description: newHabitData.description, // Description from form
      minTime: newHabitData.minTime, // Minimum time from form
      maxTime: newHabitData.maxTime, // Maximum time from form
      timeBlock: newHabitData.timeBlock, // Time block (morning, afternoon, etc.) from form
      visibility: newHabitData.visibility === "public" ? 1 : 0, // Visibility (private/public) from form
      start: startLocal.toISOString(), // Start time (calculated based on current date)
      end: endLocal.toISOString(), // End time (calculated based on current date + duration)
      recurrence: newHabitData.recurrence, // Recurrence (days of the week) from form
    };
    console.log("Creating habit:", newHabit);

    // Now use this `newHabit` to call createHabit
    createHabit(user.id, newHabit)
      .then((createdHabit) => {
        setHabits(prev => [...prev, createdHabit]);
        alert("Custom habit created successfully!");
      })
      .catch((err) => {
        console.error("Failed to create custom habit:", err);
      });
  };

  const calendarEvents = habits
    .filter(habit => habit.start && habit.end)
    .map((habit, index) => {
      const startLocal = new Date(habit.start); // Convert UTC to local
      const endLocal = new Date(habit.end);

      const event = {
        id: habit._id || index,
        text: habit.name,
        start: new DayPilot.Date(startLocal),
        end: new DayPilot.Date(endLocal)
      };
      console.log("Calendar Event (local):", event);
      return event;
    });

  useEffect(() => {
    if (calendarRef.current) {
      calendarRef.current.control.update({
        events: calendarEvents
      });
    }
  }, [calendarEvents]);

  const handleToday = () => {
    const today = DayPilot.Date.today();
    calendarRef.current.control.startDate = today;
    calendarRef.current.control.update();
  };

  const handlePrevious = () => {
    calendarRef.current.control.startDate = calendarRef.current.control.startDate.addDays(-7);
    calendarRef.current.control.update();
  };

  const handleNext = () => {
    calendarRef.current.control.startDate = calendarRef.current.control.startDate.addDays(7);
    calendarRef.current.control.update();
  };

  if (!user) {
    return (
      <div className="text-center mt-5">
        <p className="text-danger">User not logged in. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container bg-light mt-0">
        <h1 className="text-center fs-2">{user.name}'s Calendar</h1>

        <div>
          <CreateHabitButton onClick={onCreateClick} />
          {showChooseHabit && (
            <ChooseHabitType 
              show={showChooseHabit} 
              onClose={() => setShowChooseHabit(false)} 
              onSelectList={() => {
                setShowChooseHabit(false);
                alert("You chose curated habits");
              }} 
              onCreateCustomHabit={() => {
                setShowChooseHabit(false);
                setShowCustomHabitForm(true); // Show the form
              }}
            />
          )}
        </div>

        {/* Custom Habit Form */}
        {showCustomHabitForm && (
          <CustomHabitForm
            show={showCustomHabitForm}
            onHide={() => setShowCustomHabitForm(false)}
            onSubmit={(newHabitData) => {
              onCreateCustomHabit(newHabitData); // Pass the form data here
              setShowCustomHabitForm(false); // Hide the form after submission
            }}
          />
        )}

        <div className="mt-4">
          <DayPilotCalendar
            ref={calendarRef}
            viewType={'Week'}
            headerDateFormat="ddd M/d"
            startHour={0}
            endHour={24}
            timeZone="America/Los_Angeles"
          />
        </div>

        {/* Local time info */}
        <p className="text-center text-muted">
          Times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </p>

        {/* Navigation Buttons */}
        <div className="d-flex justify-content-center gap-2 my-3">
          <button className="btn btn-outline-primary" onClick={handlePrevious}>Previous</button>
          <button className="btn btn-outline-secondary" onClick={handleToday}>Today</button>
          <button className="btn btn-outline-primary" onClick={handleNext}>Next</button>
        </div>

        {/* Displaying Habits */}
        <div className="mt-5">
          <h3 className="fs-4">Your Habits</h3>
          {habits.length === 0 ? (
            <p className="text-muted">No habits to display.</p>
          ) : (
            <ul className="list-group">
              {habits.map((habit, index) => (
                <li key={index} className="list-group-item">
                  <pre className="mb-0">{JSON.stringify(habit, null, 2)}</pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
