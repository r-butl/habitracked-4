import React, { useState } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const loginUser = async (e) => {
    e.preventDefault();
    const {email, password} = data
    try {
      const {data} = await axios.post('/login', {
        email,
        password,
      })
      if(data.error){
        toast.error(data.error)
      } else {
        setData({});
        navigate('/')
      }
    } catch (error) {
      
    }
  };

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
          Don't have an account? <a href="/register" className="text-primary">Register</a>
        </p>
      </div>
    </div>
  );
}