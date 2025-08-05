
import React from 'react';
import { Link } from 'react-router-dom';
import '../Style/Nav.css';
import logo from '../Image/HRMlogo.png';

const Nav = () => {
  return (
    <nav className="nav-bar">
      <div className="nav-logo">
        <img src={logo} alt="HRMLogo" />
      </div>
      <div className="nav-links">
        <Link to="/" className="nav-item">HOME</Link>
        <Link to="/login" className="nav-item">LOGIN</Link>
        <Link to="/logout" className="nav-item">LOGOUT</Link>
        <Link to="/reg" className="nav-item">REGISTRATION</Link>
      </div>
    </nav>
  );
};

export default Nav;
