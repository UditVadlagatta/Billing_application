import React from 'react';
import '../Style/Login.css';
import LoginBg from '../Image/Login.png';

const Login = () => {
  return (
    <div className="login-background" style={{ backgroundImage: `url(${LoginBg})` }}>
  <div className="login-overlay" />
  
  <div className="login-center-wrapper">
    <div className="login-container animated-form glass-effect">
      <form className="login-form">
        <h2 className="fade-in">Welcome Back</h2>
        <p className="subtitle fade-in">Log in to continue your journey</p>

        <input className="fade-in" type="text" placeholder="👤 Username" required />
        <input className="fade-in" type="password" placeholder="🔒 Password" required />
        <button className="fade-in" type="submit">🚀 Login</button>
      </form>
    </div>
  </div>

  <footer className="footer">
    <p>&copy; 2025 MyCompany. All rights reserved.</p>
  </footer>
</div>

  );
};

export default Login;
