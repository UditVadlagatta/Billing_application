import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Customer from './Customer';
import Product from './Product';
import Style from './MainDashboard.module.css'
import Invoice from './Invoice';
import Report from './Report';

const MainDashboard = () => {
  return (
    <div>
      <nav className={Style.subNavbar}>
         <div class={Style.logo_admin}>
            A
         </div>

        <Link to="/MainDashboard/dashboard">Dashboard</Link>
        <Link to="/MainDashboard/customer">Customer</Link>
        <Link to="/MainDashboard/product">Product</Link>
        <Link to="/MainDashboard/invoice">Invoice</Link>
        <Link to="/MainDashboard/report">Report</Link>
      </nav>
     

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

export default MainDashboard;
