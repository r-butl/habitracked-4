import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../context/userContext';
import { DayPilot, DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { CreateHabitButton } from '../components/CreateHabitButton/CreateHabitButton';
import { ChooseHabitType } from '../components/ChooseHabitType/ChooseHabitType';
import { CustomHabitForm } from '../components/CustomHabitForm/CustomHabitForm';
import { getUserHabits, createHabit } from '../utils/api';
import { CuratedHabitsDialog } from './CuratedHabitsDialog';
import { Popup } from '../components/Popup/Popup';
// import { ConfigureHabitDialog } from './ConfigureHabitDialog';

export default function Calendar() {
  const { user } = useContext(UserContext)
  const [showChooseHabit, setShowChooseHabit] = useState(false);
  const [showCustomHabitForm, setShowCustomHabitForm] = useState(false);
  const [habits, setHabits] = useState([]);
  const calendarRef = useRef(null);
  const [showCuratedDialog, setShowCuratedDialog] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  // const [habitToConfigure, setHabitToConfigure] = useState(null);

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
  
    const startLocal = new Date(newHabitData.start);
    const endLocal = new Date(newHabitData.end);
  
    const newHabit = {
      name: newHabitData.name,
      icon: newHabitData.icon,
      description: newHabitData.description,
      minTime: newHabitData.minTime,
      maxTime: newHabitData.maxTime,
      timeBlock: newHabitData.timeBlock,
      visibility: newHabitData.visibility === "public" ? 1 : 0,
      start: startLocal.toISOString(),
      end: endLocal.toISOString(),
      recurrence: newHabitData.recurrence,
    };
  
    createHabit(user.id, newHabit)
      .then((createdHabit) => {
        setHabits((prev) => [...prev, createdHabit]);
        // alert("Custom habit created successfully!");
        setPopupMessage("Habit created successfully!");
        setIsPopupVisible(true);
      })
      .catch((err) => {
        console.error("Failed to create habit:", err);
        setPopupMessage("Failed to create habit. Please try again.");
        setIsPopupVisible(true);
      });
  };

  // Recurring events generator
  // This function generates all the recurring events for a given habit
  // based on the specified recurrence days and the given date range.
  // It takes into account the start and end times of the habit.
  const generateRecurringEvents = (habit, rangeStart, rangeEnd) => {
    const result = [];
  
    if (!Array.isArray(habit.recurrence) || habit.recurrence.length === 0) {
      result.push(habit);
      return result;
    }
  
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };
  
    const habitStart = new Date(habit.start);
    const habitEnd = new Date(habit.end);
    const duration = habitEnd.getTime() - habitStart.getTime();
  
    const startHour = habitStart.getHours();
    const startMinute = habitStart.getMinutes();
  
    const current = new Date(rangeStart);
    while (current <= rangeEnd) {
      const localDay = current.getDay(); // 0 = Sunday
      const dayName = Object.keys(dayMap).find(day => dayMap[day] === localDay);
  
      if (habit.recurrence.includes(dayName)) {
        const start = new Date(current);
        start.setHours(startHour, startMinute, 0, 0); // Set time from original habit
  
        const end = new Date(start.getTime() + duration);
  
        result.push({
          ...habit,
          start,
          end
        });
      }
  
      current.setDate(current.getDate() + 1);
    }
  
    return result;
  };  

  const rangeStart = new Date(); // today
  const rangeEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // one week

  const calendarEvents = habits
    .flatMap(habit => generateRecurringEvents(habit, rangeStart, rangeEnd))
    .map((habit, index) => {
      const startLocal = new Date(habit.start);
      const endLocal = new Date(habit.end);

      return {
        id: habit._id || `${habit.name}-${index}`,
        text: habit.name,
        start: new DayPilot.Date(startLocal),
        end: new DayPilot.Date(endLocal)
      };
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

  // if (!user) {
  //   return (
  //     <div className="text-center mt-5">
  //       <p className="text-danger">User not logged in. Redirecting...</p>
  //     </div>
  //   );
  // }

  return (
    <div className="bg-light min-vh-100">
      <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">

        <div className="card shadow-lg p-4 text-center mb-4" style={{ maxWidth: "500px", width: "100%", height: "150px", marginTop: "40px" }}>
          <h1 className="text-primary mb-3">Calendar</h1>
          {!!user && (
            <h2 className="text-secondary fs-4">Hi, {user.name}! 👋</h2>
          )}
        </div>

        <div>
          <CreateHabitButton onClick={onCreateClick} />
          {showChooseHabit && (
            <ChooseHabitType
              show={showChooseHabit}
              onClose={() => setShowChooseHabit(false)}
              onSelectList={() => {
                setShowChooseHabit(false);
                setShowCuratedDialog(true);
              }}
              onCreateCustomHabit={() => {
                setShowChooseHabit(false);
                setShowCustomHabitForm(true);
              }}
            />
          )}
        </div>

        {showCuratedDialog && (
          <CuratedHabitsDialog
            show={showCuratedDialog}
            onClose={() => setShowCuratedDialog(false)}
            onSelect={(habit) => {
              const recurrenceArray = typeof habit.recurrence === 'string'
                ? habit.recurrence.split(',').map(day => day.trim().toLowerCase())
                : habit.recurrence;
              setShowCuratedDialog(false);
              onCreateCustomHabit({ ...habit, recurrence: recurrenceArray });
            }}
          />
        )}

        {showCustomHabitForm && (
          <CustomHabitForm
            show={showCustomHabitForm}
            onHide={() => setShowCustomHabitForm(false)}
            onSubmit={(newHabitData) => {
              onCreateCustomHabit(newHabitData);
              setShowCustomHabitForm(false);
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

        <p className="text-center text-muted">
          Times shown in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </p>

        <div className="d-flex justify-content-center gap-2 my-3">
          <button className="btn btn-outline-primary" onClick={handlePrevious}>Previous</button>
          <button className="btn btn-outline-secondary" onClick={handleToday}>Today</button>
          <button className="btn btn-outline-primary" onClick={handleNext}>Next</button>
        </div>

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
        {isPopupVisible && (
          <div>
            <Popup
              isVisible={isPopupVisible}
              message={popupMessage}
              onClose={() => setIsPopupVisible(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
