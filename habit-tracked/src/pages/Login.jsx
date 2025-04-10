import React, { useState, useContext, useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../context/userContext";

export default function Login() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const { email, password } = data;
  
    try {
      // Attempt to send login credentials to the backend
      const { data: res } = await axios.post('/login', { email, password });
  
      // Backend responded with a 200 OK, but may include an error field in the response body
      if (res.error) {
        // Show a toast notification if the backend returns an error message
        toast.error(res.error);
      } else {
        // If login is successful, update user context and clear the form fields
        setUser(res);
        setData({ email: "", password: "" });
        toast.success("Login Successful. Welcome!");
      }
    } catch (err) {
      // Handle HTTP errors (e.g., 401 Unauthorized, 500 Internal Server Error)
      if (err.response && err.response.status === 401) {
        // Specific handling for 401 errors: log to console and show a toast
        console.warn("401 Unauthorized:", err.response.data?.error);
        toast.error(err.response.data?.error || "Unauthorized");
      } else {
        // Handle other unexpected errors (network errors, server crashes, etc.)
        console.error("Login error:", err);
        toast.error("An error occurred during login.");
      }
    }
  };

  // UseEffect to navigate when user state is updated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "350px" }}>
        <h2 className="text-center text-primary mb-4">Login</h2>
        <form onSubmit={loginUser}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email..."
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter password..."
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={togglePasswordVisibility}
              >
                <i className={`bi bi-eye${showPassword ? "" : "-slash"}`}></i>
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
        <p className="text-center mt-3">
          Don't have an account? <Link to="/register" className="text-primary">Register</Link>
        </p>
      </div>
    </div>
  );
}