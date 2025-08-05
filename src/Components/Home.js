import React from 'react';
import '../Style/Home.css';

const Home = () => {
  return (
    <div className="home-background">
      <div className="overlay">
        <div className="content animate-fade-in">
          <h5>EXPERT KNOWLEDGE</h5>
          <h1>Transforming<br />The Work Place</h1>
          <button>MORE INFO</button>
        </div>
      </div>
      <footer className="footer">
        <p>&copy; 2025 MyCompany. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;