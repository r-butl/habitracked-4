import React, { useContext } from 'react';
import { UserContext } from '../context/userContext';
import { LogHistoryGraph } from '../components/LogHistoryGraph/LogHistoryGraph';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  
  return (
    <div className="container d-flex flex-column align-items-center min-vh-100" >
      <div className="card shadow-lg p-4 text-center mb-4" style={{ maxWidth: "500px", width: "100%", height: "150px", marginTop: "40px", marginLeft: "auto", marginRight: "auto" }}>
        <h1 className="text-primary mb-3">Dashboard</h1>
        {!!user && (
          <h2 className="text-secondary fs-4">Hi, {user.name}! 👋</h2>
        )}
      </div>
      <LogHistoryGraph />
    </div>
  );
}