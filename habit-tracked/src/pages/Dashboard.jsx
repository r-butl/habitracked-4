import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';
//import { useLocation } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(UserContext);

  // variable passing test
  // const location = useLocation()
  // const { userData, timestamp } = location.state || {};
  // console.log(userData)

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 text-center" style={{ maxWidth: "400px" }}>
        <h1 className="text-primary">Dashboard</h1>
        {!!user && (
          <h2 className="text-secondary mt-3">Hi, {user.name}! 👋</h2>
        )}
      </div>
    </div>
  );
}