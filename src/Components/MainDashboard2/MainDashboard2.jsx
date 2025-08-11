import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard2';
import Customer from './Customer';
import Product from './Product';
import Style from './MainDashboard2.module.css'
import Invoice from './Invoice';
import Report from './Report';

const MainDashboard2 = () => {
  return (
    <div> 
      <nav className={Style.subNavbar}>
        
        <Link to="/MainDashboard2/dashboard">Dashboard</Link>
        <Link to="/MainDashboard2/customer">Customer</Link>
        <Link to="/MainDashboard2/product">Product</Link>
        <Link to="/MainDashboard2/invoice">Invoice</Link>
        <Link to="/MainDashboard2/report">Reporthi</Link>
      </nav>
      User Login

      <div >
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customer" element={<Customer />} />
          <Route path="product" element={<Product />} />
          <Route path="invoice" element={<Invoice />}/>
          <Route path="report" element={<Report />}/>
        </Routes>
      </div>
    </div>
  );
};

export default MainDashboard2;
