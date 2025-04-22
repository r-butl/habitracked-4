import React, { useState, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { CreateHabitButton } from '../components/CreateHabitButton/CreateHabitButton';
import { ChooseHabitType } from '../components/ChooseHabitType/ChooseHabitType';
import { CustomHabitForm } from '../components/CustomHabitForm/CustomHabitForm'
//import { useLocation } from 'react-router-dom';


export default function Calendar() {
 const { user } = useContext(UserContext);
 const [showChooseHabit, setShowChooseHabit] = useState(false);
 const [showCustomHabitForm, setShowCustomHabitForm] = useState(false);
 const onCreateClick = () => {
   setShowChooseHabit(true);
 }
 // protect against accessing null user during logout [temp fix]
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

              {showCustomHabitForm && (
                <CustomHabitForm
                  show={showCustomHabitForm}
                  onHide={() => setShowCustomHabitForm(false)}
                  onSubmit={() => {
                    console.log("Habit created");
                  }}
                />
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