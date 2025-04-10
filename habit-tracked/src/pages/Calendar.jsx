import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";
//import { useLocation } from 'react-router-dom';


export default function Calendar() {
 const { user } = useContext(UserContext);

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
               <DayPilotCalendar
               viewType={'Week'}
               headerDateFormat="dddd"
               />
           </div>
       </div>
   </div>
 );
}