import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'
import { UserContextProvider, UserContext } from './context/userContext';
import { useContext } from 'react';

// component imports
import Navbar from './components/Navbar';

// page imports
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard';

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
    <UserContextProvider> {/* ✅ Context is available from this point onward */}
      <Router>
        <NavbarWrapper />
        <Toaster position="bottom-right" toastOptions={{ duration: 2500 }} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </UserContextProvider>
  );
}

function NavbarWrapper() {
  const { user, setUser } = useContext(UserContext); // ✅ Now safely inside the provider
  return <Navbar user={user} setUser={setUser} />;
}

export default App;