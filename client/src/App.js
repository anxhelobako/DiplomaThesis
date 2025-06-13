    import React, { useState, useEffect } from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import Navbar from './components/Navbar';
    import Register from './components/Register';
    import Login from './components/Login';
    import ProtectedRoute from './components/ProtectedRoute';
    import Dashboard from './components/Dashboard';
    import axios from 'axios';
    import FuelEfficiencyCalculator from './components/FuelEfficiencyCalculator';
    import Home from './components/Home';
    import CarDetails from './components/CarDetails';
    

    axios.defaults.withCredentials = true; // Ensures cookies are sent with all requests

    const appStyles = {
  shell: {
    minHeight: '100vh',
    /* identical palette & angle to Home.js “container” gradient     */
    background:
      'linear-gradient(135deg, #0f172a 0%, #581c87 30%, #1e1b4b 70%, #0f172a 100%)',
    color: '#f8fafc',          // light slate text for any stray content
    display: 'flex',
    flexDirection: 'column',
     },
    };

    function App() {
      const [user, setUser] = useState(null);
      
      useEffect(() => {
        axios.get('http://localhost:5000/api/auth/check_session', {
          withCredentials: true})
          .then(response => {
            const data = response.data;
        
            if (data.logged_in) {
              setUser(data.user);
            } else {
              setUser(null);
            }
          })
          .catch(err => {
            console.error('Session check failed:', err);
            setUser(null);
          });
        
      }, []);

      
      const handleLogout = async () => {
        try {
          const res = await axios.post(
            'http://localhost:5000/api/auth/logout',
            {},
            { withCredentials: true } // Send session cookies
          );
          alert(res.data.message);
          setUser(null);
        } catch (error) {
          console.error('Logout failed:', error);
          alert('Logout failed');
        }
      };

      const refreshSession = () => {
        axios.get('http://localhost:5000/api/auth/check_session', { withCredentials: true })
          .then(res => {
            if (res.data.logged_in) {
              setUser(res.data.user);
            } else {
              setUser(null);
            }
          })
          .catch(err => {
            console.error('Session refresh failed:', err);
            setUser(null);
          });
      };

      return (
         <div style={appStyles.shell}>
      <Router>
        <nav style={{ padding: '10px 20px', background: 'transparent', display: user ? 'block' : 'none' }}>
          <span style={{ fontWeight: 'bold', color: '#a5f3fc' }}>
            Welcome, {user?.name}
          </span>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              background: "linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)",
              color: '#0f172a',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </nav>

        {/* Navbar shared across pages */}
        <Navbar user={user} setUser={setUser} refreshSession={refreshSession} />

        {/* Route components */}
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/calculator" element={<FuelEfficiencyCalculator />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </div>
  );
}

    export default App;
