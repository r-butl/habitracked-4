import React from "react";

export default function Home() {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 fw-bold text-primary">Welcome to Habitracked</h1>
      <p className="lead text-muted">
        Your personal habit tracker to stay motivated and reach your goals.
      </p>
      
      <div className="mt-4 d-flex justify-content-center">
        <img 
          src="https://images.healthshots.com/healthshots/en/uploads/2022/10/03161920/habits.jpg" 
          alt="Habits" 
          className="img-fluid rounded shadow-lg"
          style={{ width: "50%", maxWidth: "500px" }} // Adjust size here
        />
      </div>

      <div className="mt-4">
        <a href="/register" className="btn btn-primary btn-lg me-3">Get Started</a>
        <a href="/login" className="btn btn-outline-primary btn-lg">Log In</a>
      </div>
    </div>
  );
}