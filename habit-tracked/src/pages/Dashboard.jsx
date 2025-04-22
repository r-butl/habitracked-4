import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  
  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 text-center mb-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h1 className="text-primary mb-3">Dashboard</h1>
        {!!user && (
          <h2 className="text-secondary fs-4">Hi, {user.name}! 👋</h2>
        )}
      </div>
    </div>
  );
}