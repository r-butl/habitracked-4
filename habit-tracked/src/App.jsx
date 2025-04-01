import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// component imports
import Navbar from './components/Navbar';

// page imports
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'

// bootstrap imports
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import 'bootstrap-icons/font/bootstrap-icons.css';

// backend imports
import axios from 'axios';

// connect to backend url
axios.defaults.baseURL = 'http://localhost:5050';
axios.defaults.withCredentials = true;

function App() {
  return (
    <>
    <Router>
    <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
