import React from 'react';
import '../Style/Registration.css';
import RegistrationBg from '../Image/Registration.png'; 

const Registration = () => {
  return (
    <div
      className="registration-wrapper"
      style={{ backgroundImage: `url(${RegistrationBg})` }}
    >
      <div className="registration-box">
        <h2>Create Account</h2>
        <p>Join us by filling the information below</p>
        <input type="text" placeholder="👤 Full Name" />
        <input type="email" placeholder="📧 Email" />
        <input type="password" placeholder="🔒 Password" />
        <button>🚀 Register</button>
      </div>
    </div>
  );
};

export default Registration;
