import React, { useEffect, useState } from "react";
import axios from "axios";

// This is the Reports component that will display a summary of billing data.
const Reports = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, partial: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // We fetch all invoices to generate the report.
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8080/api/invoices");
        const fetchedInvoices = res.data;
        setInvoices(fetchedInvoices);

        // Process fetched invoice data to calculate stats and payments
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
        setPayments(allPayments);
        setStats(newStats);

      } catch (err) {
        console.error("Error fetching invoices:", err);
        setError("Failed to fetch report data. Please check the backend connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);
  
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

  // Function to determine the invoice status based on total paid amount.
  const getInvoiceStatus = (invoice) => {
    const totalPaidAmount = (invoice.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
    if (totalPaidAmount >= invoice.totalAmount) {
      return { status: "PAID", color: "text-green-600" };
    } else if (totalPaidAmount > 0) {
      return { status: "PARTIAL", color: "text-yellow-600" };
    } else {
      return { status: "PENDING", color: "text-red-600" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>

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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Invoices", value: stats.total, color: "text-gray-800" },
                { label: "Revenue Collected", value: `₹${totalRevenue.toFixed(2)}`, color: "text-green-600" },
                { label: "Paid Invoices", value: stats.paid, color: "text-green-600" },
                { label: "Pending Invoices", value: stats.pending, color: "text-red-600" },
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

            {/* Invoices Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Invoices</h2>
              {invoices.length === 0 ? (
                <p className="text-gray-600">No invoices found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-700">
                        <th className="p-3 font-medium">Invoice ID</th>
                        <th className="p-3 font-medium">Customer</th>
                        <th className="p-3 font-medium">Invoice Amount</th>
                        <th className="p-3 font-medium">Paid Amount</th>
                        <th className="p-3 font-medium">Due Date</th>
                        <th className="p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => {
                        const status = getInvoiceStatus(inv);
                        const paidAmount = (inv.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
                        return (
                          <tr key={inv.id} className="border-t hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-gray-600 font-mono">#{inv.id}</td>
                            <td className="p-3 font-medium text-gray-800">{inv.customer?.name || "N/A"}</td>
                            <td className="p-3 text-gray-700">₹{inv.totalAmount?.toFixed(2) || "N/A"}</td>
                            <td className="p-3 text-gray-700">₹{paidAmount.toFixed(2)}</td>
                            <td className="p-3 text-gray-500">{inv.dueDate || "N/A"}</td>
                            <td className={`p-3 font-semibold ${status.color}`}>
                              {status.status}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
