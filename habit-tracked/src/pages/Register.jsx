import React, { useState } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios'
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate()
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const registerUser = async (e) => {
    e.preventDefault();
    const {name, email, password} = data
    try {
      const {data} = await axios.post('/register', {
        name, email, password
      })
      if(data.error){
        toast.error(data.error)
      } else {
        setData({})
        toast.success("Login Successful. Welcome!")
        navigate('/login')
      }
    } catch(error) {
      console.log(error)
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "350px" }}>
        <h2 className="text-center text-primary mb-4">Register</h2>
        <form onSubmit={registerUser}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter name..."
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
            />
          </div>
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
            Register
          </button>
        </form>
        <p className="text-center mt-3">
          Already have an account? <a href="/login" className="text-primary">Login</a>
        </p>
      </div>
    </div>
  );
}