import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../Style/Home.css';
// import MainDashboard from './MainDashboard/MainDashboard.js'


const Home = () => {
  return (
    <div className="home-background">
      <div className="overlay">
        <div className="content animate-fade-in">
          <h5>EXPERT KNOWLEDGE</h5>
          <h1>Transforming<br />The Work Place</h1>
          <button>MORE INFO</button>
          <br/>

          
 <Link to="/MainDashboard">Go to Dashboard</Link>
          {/* <a href={MainDashboard/MainDashboard.js} alt="">Link</a> */}
        </div>
      </div>
      <footer className="footer">
        <p>&copy; 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;