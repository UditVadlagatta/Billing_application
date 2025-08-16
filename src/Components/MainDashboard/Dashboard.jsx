import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
// We are not using react-chartjs-2 to avoid external library dependencies.
// Instead, we will use a pure CSS approach for the charts.

// Main App component containing the entire dashboard
const Dashboard = () => {
  // Use state to manage the dashboard data
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, partial: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Function to fetch all data from the backend
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all invoices  and customer and product from the backend
      // const invoicesRes = await fetch("http://localhost:8080/api/invoices");
      const [invoicesRes, customersRes, productsRes] = await Promise.all([
        fetch("http://localhost:8080/api/invoices"),
        fetch("http://localhost:8080/api/customers"),
        fetch("http://localhost:8080/api/products")
      ]);
      // if (!invoicesRes.ok) throw new Error(`HTTP error! status: ${invoicesRes.status}`);

      // Check for errors on all responses
      if (!invoicesRes.ok) throw new Error(`HTTP error! status: ${invoicesRes.status} for invoices`);
      if (!customersRes.ok) throw new Error(`HTTP error! status: ${customersRes.status} for customers`);
      if (!productsRes.ok) throw new Error(`HTTP error! status: ${productsRes.status} for products`);

      const invoicesData = await invoicesRes.json();
      const customersData = await customersRes.json();
      const productsData = await productsRes.json();

      const fetchedInvoices = Array.isArray(invoicesData) ? invoicesData : [];
      const fetchedCustomers = Array.isArray(customersData) ? customersData : [];
      const fetchedProducts = Array.isArray(productsData) ? productsData : [];

      // Process fetched data to calculate stats and payments
      const newStats = { total: 0, paid: 0, pending: 0, partial: 0 };
      const allPayments = [];

      fetchedInvoices.forEach(invoice => {
        // Increment total count
        newStats.total += 1;

        // Calculate total payments for this invoice
        const totalPaidAmount = (invoice.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
        
        // Determine the status based on payments and total amount
        let status;
        if (totalPaidAmount >= invoice.totalAmount) {
          status = "PAID";
        } else if (totalPaidAmount > 0) {
          status = "PARTIAL";
        } else {
          status = "PENDING";
        }

        // Update stats based on the calculated status
        if (status === 'PAID') newStats.paid += 1;
        if (status === 'PARTIAL') newStats.partial += 1;
        if (status === 'PENDING') newStats.pending += 1;

        // Aggregate payments from all invoices
        if (invoice.payments && Array.isArray(invoice.payments)) {
          allPayments.push(...invoice.payments);
        }
        
        // Add the calculated status to the invoice object for table display
        invoice.status = status;
      });
      
      // Update state with processed data
      setInvoices(fetchedInvoices);
      setPayments(allPayments);
      setStats(newStats);
      setCustomers(fetchedCustomers);
      setProducts(fetchedProducts);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Call fetchData on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Delete invoice function, now calling the backend API
  const deleteInvoice = async (id) => {
    setInvoiceToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${invoiceToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      // After successful deletion, refetch data to update the UI
      await fetchData();
      
    } catch (err) {
      console.error("Error deleting invoice:", err);
      setError("Failed to delete invoice: " + err.message);
    } finally {
      setShowModal(false);
      setInvoiceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setInvoiceToDelete(null);
  };

  // Calculate total revenue from payments
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Calculate data for the pie chart
  const pieData = {
    paid: stats.paid,
    partial: stats.partial,
    pending: stats.pending,
  };
  const totalInvoices = pieData.paid + pieData.partial + pieData.pending;
  const paidPercent = totalInvoices > 0 ? (pieData.paid / totalInvoices) * 100 : 0;
  const partialPercent = totalInvoices > 0 ? (pieData.partial / totalInvoices) * 100 : 0;
  const pendingPercent = totalInvoices > 0 ? (pieData.pending / totalInvoices) * 100 : 0;

  // Pie chart style using conic-gradient for a CSS-only chart
  const pieChartStyle = {
    background: `conic-gradient(
      #22c55e 0% ${paidPercent}%,
      #f59e0b ${paidPercent}% ${paidPercent + partialPercent}%,
      #ef4444 ${paidPercent + partialPercent}% 100%
    )`,
  };

  // Calculate revenue by month for the bar chart
  const revenueByMonth = payments.reduce((acc, p) => {
    const date = new Date(p.date);
    const month = date.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + Number(p.amount);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Billing Dashboard</h1>
          <Link
            to="/MainDashboard/invoice"
            className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Create Invoice
          </Link>
        </div>

        {/* Loading and error states */}
        {error && <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-6">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-600">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          <>
            {/* Stats section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {[
                { label: "Total Invoices", value: stats.total, color: "text-gray-800" },
                { label: "Paid", value: stats.paid, color: "text-green-600" },
                { label: "Pending", value: stats.pending, color: "text-red-600" },
                { label: "Partial", value: stats.partial, color: "text-yellow-600" },
                { label: "Revenue Collected", value: `₹${totalRevenue.toFixed(2)}`, color: "text-gray-800" },
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                  <h2 className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</h2>
                </div>
              ))}
            </div>

            {/* Charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Invoice Status</h3>
                {/* Custom CSS Pie Chart */}
                <div className="flex justify-center items-center h-64 relative">
                  <div className="w-48 h-48 rounded-full shadow-inner" style={pieChartStyle}></div>
                  {/* Legend */}
                  <div className="absolute top-0 right-0 p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">Paid ({stats.paid})</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-600 mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">Partial ({stats.partial})</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-red-600 mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">Pending ({stats.pending})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Revenue by Month</h3>
                {/* Custom CSS Bar Chart */}
                <div className="flex justify-between items-end h-64 p-2">
                  {Object.entries(revenueByMonth).map(([month, amount]) => (
                    <div key={month} className="flex-grow flex flex-col items-center mx-1">
                      <div
                        className="bg-blue-600 rounded-t-lg transition-all duration-300 ease-in-out"
                        style={{ height: `${(amount / Math.max(...Object.values(revenueByMonth))) * 100}%`, width: '100%' }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">{month}</div>
                      <div className="text-xs font-semibold text-gray-800 mt-1">₹{amount.toFixed(0)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Invoices</h3>
              {invoices.length === 0 ? (
                <p className="text-gray-600">No invoices found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-700">
                        <th className="p-3 font-medium">Invoice ID</th>
                        <th className="p-3 font-medium">Customer</th>
                        <th className="p-3 font-medium">Amount</th>
                        <th className="p-3 font-medium">Status</th>
                        <th className="p-3 font-medium">Due Date</th>
                        <th className="p-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-t hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-600 font-mono">#{inv.id}</td>
                          <td className="p-3 font-medium text-gray-800">{inv.customer?.name || "N/A"}</td>
                          <td className="p-3 text-gray-700">₹{inv.totalAmount.toFixed(2)}</td>
                          <td
                            className={`p-3 font-semibold ${
                              inv.status === "PAID"
                                ? "text-green-600"
                                : inv.status === "PARTIAL"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {inv.status}
                          </td>
                          <td className="p-3 text-gray-500">{inv.dueDate}</td>
                          <td className="p-3 flex gap-2">
                            <Link to={`/MainDashboard/invoice`} className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                              View
                            </Link>
                            <button
                              className="text-white-600 ml-2 hover:text-red-800 transition-colors font-medium"
                              onClick={() => deleteInvoice(inv.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

<div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
{/* customer list, product list */}

{/* Customer Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Customers</h3>
              {customers.length === 0 ? (
                <p className="text-gray-600">No customers found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-700">
                        <th className="p-3 font-medium">Customer ID</th>
                        <th className="p-3 font-medium">Name</th>
                        <th className="p-3 font-medium">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-t hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-600 font-mono">#{customer.id}</td>
                          <td className="p-3 font-medium text-gray-800">{customer.name}</td>
                          <td className="p-3 text-gray-700">{customer.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Product Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Products</h3>
              {products.length === 0 ? (
                <p className="text-gray-600">No products found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-700">
                        <th className="p-3 font-medium">Product ID</th>
                        <th className="p-3 font-medium">Name</th>
                        <th className="p-3 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-t hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-600 font-mono">#{product.id}</td>
                          <td className="p-3 font-medium text-gray-800">{product.name}</td>
                          <td className="p-3 text-gray-700">₹{product.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

</div>


          </>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h4 className="text-xl font-semibold mb-4">Confirm Deletion</h4>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this invoice?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        
        </div>
        
      )}
      
    </div>
    
  );
};

// Main wrapper to enable routing
const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* Placeholder routes for navigation */}
      <Route path="/create-invoice" element={<div className="p-6 text-center text-xl font-semibold">Create Invoice Page Placeholder</div>} />
      <Route path="/invoices/:id" element={<div className="p-6 text-center text-xl font-semibold">Invoice Details Page Placeholder</div>} />
    </Routes>
  </BrowserRouter>
);

export default Dashboard;
