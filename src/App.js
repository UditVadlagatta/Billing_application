import React, { useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Nav from './Components/Nav';
import Home from './Components/Home';
import Login from './Components/Login';
import Logout from './Components/Logout';
import Registration from './Components/Registration';
import './App.css';

import MainDashboard from './Components/MainDashboard/MainDashboard';

function App() {
  const location = useLocation();
  const nodeRef = useRef(null); 

  return (
    <>
      <Nav />
      
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          classNames="fade"
          timeout={300}
          nodeRef={nodeRef}
        >
          <div ref={nodeRef}> {/* ✅ Wrap Routes in a div with ref */}
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/reg" element={<Registration />} />
              <Route path="/MainDashboard/*" element={<MainDashboard />} />
            </Routes>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </>
  );
}

export default App;
