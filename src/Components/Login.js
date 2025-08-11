import React, { useState } from 'react';
import '../Style/Login.css';
import LoginBg from '../Image/Login.png';
import MainDashboard2 from './MainDashboard2/Dashboard2';

// Main application component
const App = () => {
  // State for username, password, and form messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Handles form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    // Simple validation
    if (!username || !password) {
      setMessage('Please enter both username and password.');
      setMessageType('error');
      return;
    }

    try {
      // Send login request to the backend
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful!');
        setMessageType('success');
        // Store username and redirect based on user type
        localStorage.setItem('username', data.username);
        if (data.username === 'admin') {
          // Redirect to the admin dashboard
          window.location.href = './MainDashboard/Dashboard'
        } else {
          // Redirect to the regular user dashboard
          window.location.href = './MainDashboard2/MainDashboard2';
        // window.location.href = {MainDashboard2};
        }
      } else {
        setMessage(data.message || 'Login failed. Please check your credentials.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An unexpected error occurred. Please try again later.');
      setMessageType('error');
    }
  };

  return (
    <div className="login-background" style={{ backgroundImage: `url(${LoginBg})` }}>
  <div className="login-overlay" />
      <div className="login-center-wrapper">
        <div className="login-container animated-form glass-effect">
 
          <form onSubmit={handleLogin} className="login-form">
            <h2 className="fade-in">Welcome Back</h2>
            <p className="subtitle fade-in">Log in to continue your journey</p>
            
            {/* Display messages */}
            {message && (
              <div>
                {message}
              </div>
            )}

            {/* Username input */}
{/*             <div> */}
              <input className="fade-in" 
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
{/*             </div> */}

            {/* Password input */}
{/*             <div> */}
              <input className="fade-in" 
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
{/*             </div> */}
            
            {/* Login button */}
            <button
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer" style={{marginBottom:'-16px'}}>
        <p>&copy; 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
