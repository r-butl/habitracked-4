import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";
//import { useLocation } from 'react-router-dom';


export default function Calendar() {
 const { user } = useContext(UserContext);
 // variable passing test
 // const location = useLocation()
 // const { userData, timestamp } = location.state || {};
 // console.log(userData)
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