import React, { useState } from 'react';
import '../Style/Registration.css';
import RegistrationBg from '../Image/Registration.png';

// Main application component
const App = () => {
  // State for form inputs and messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Handles Registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!username || !password) {
      setMessage('Please fill in all fields.');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! You can now log in.');
        setMessageType('success');
        // Clear form fields
        setUsername('');
        setPassword('');
      } else {
        setMessage(data.message || 'Registration failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('An unexpected error occurred. Please try again later.');
      setMessageType('error');
    }
  };

  // Render the registration form
  return (
    <div>
    <div className='registration-wrapper' style={{backgroundImage: `url(${RegistrationBg})`}}>
      <div className='registration-box' >
        <form onSubmit={handleRegister}>
          <h2>Create Account</h2>
          <p>Join us by filling the information below</p>
          
          {/* Display messages */}
          {message && (
            <div>
              {message}
            </div>
          )}

          {/* Username input */}
          <div >
            <input
              type="text"
              placeholder="👤      Username "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {/* <span>👤</span> */}
          </div>

          {/* Password input */}
          <div>
            <input
              type="password"
              placeholder="🔒      Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* <span>🔒</span> */}
          </div>
          
          {/* Register button */}
          <button
            type="submit"
          >
            Register
          </button>
        </form>
      </div>
      </div>

      {/* Footer */}
      <footer>
        <p>&copy; 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
