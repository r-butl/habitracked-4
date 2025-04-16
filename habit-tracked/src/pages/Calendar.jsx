import React, { useState, useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/userContext';
import axios from 'axios';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { CreateHabitButton } from '../components/CreateHabitButton/CreateHabitButton';
import { ChooseHabitType } from '../components/ChooseHabitType/ChooseHabitType';

export default function Calendar() {
  const { user, ready } = useContext(UserContext);
 const [showChooseHabit, setShowChooseHabit] = useState(false);
 const onCreateClick = () => {
   setShowChooseHabit(true);
 }  const [habits, setHabits] = useState([]);

  useEffect(() => {
    // if (!ready || !user || !user.id) return;

    const fetchHabits = async () => {
      try {
        const res = await axios.get(`/habits?userId=${user.id}`, {
          withCredentials: true
        });
        setHabits(res.data);
      } catch (err) {
        console.error("Error fetching habits: ", err);
      }
    };

    fetchHabits();
  }, [ready, user]);

  if (!ready) {
    return <p className="text-center mt-5">Loading...</p>;
  }
  
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
           <h1 className="text-center fs-2">{user.name}'s Calendar </h1>
           <div>
           <CreateHabitButton onClick={onCreateClick} />
            {showChooseHabit && (
              <ChooseHabitType 
              show={showChooseHabit} 
              onClose={() => {setShowChooseHabit(false)}} 
              onSelectList={() => {
                setShowChooseHabit(false);
                alert("You chose curated habits");
              }} 
              onCreateCustomHabit={() => {
                setShowChooseHabit(false);
                alert("You chose custom habit.");
              }}></ChooseHabitType>
            )}
           </div>
           <div>
               <DayPilotCalendar
               viewType={'Week'}
               headerDateFormat="dddd"
               />
           </div>
       </div>
   </div>
 );
}