import { useState, useEffect } from 'react';

// Main App component
const App = () => {
  // State variables for managing the application data and UI.
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' });
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // --- Backend API Endpoints (Placeholders) ---
  // You will need to replace these with your actual Spring Boot API endpoints.
  const API_BASE_URL = 'http://localhost:8080/api/customers';

  // --- Data Fetching from Backend ---
  // Fetch all customers when the component loads.
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      // API call to get all customers
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Customer CRUD Operations ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleAddOrUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      console.error("Name and Phone are required!");
      return;
    }

    try {
      if (editingCustomer) {
        // API call to update an existing customer
        const response = await fetch(`${API_BASE_URL}/${editingCustomer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error('Failed to update customer');
        }
        setEditingCustomer(null);
      } else {
        // API call to add a new customer
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          throw new Error('Failed to add new customer');
        }
      }
      handleResetForm();
      fetchCustomers(); // Re-fetch the list to show the updated data
    } catch (error) {
      console.error("Error adding or updating customer:", error);
    }
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, phone: customer.phone, email: customer.email, address: customer.address });
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      // API call to delete a customer
      const response = await fetch(`${API_BASE_URL}/${customerToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      fetchCustomers(); // Re-fetch the list to show the updated data
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const handleResetForm = () => {
    setFormData({ name: '', phone: '', email: '', address: '' });
    setEditingCustomer(null);
  };

  // Filter customers for search functionality
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f4f7f9;
            color: #333;
            margin: 0;
            padding: 0;
          }

          .container {
            max-width: 960px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }

          .header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .header h1 {
            font-size: 2.5rem;
            color: #1a202c;
            margin: 0;
          }

          .header p {
            color: #718096;
            margin-top: 0.5rem;
          }

          .card {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .card-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .form-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          @media (min-width: 640px) {
            .form-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          .form-input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            transition: all 0.2s ease-in-out;
          }

          .form-input:focus {
            outline: none;
            border-color: #4c51bf;
            box-shadow: 0 0 0 2px rgba(76, 81, 191, 0.2);
          }

          .button-group {
            display: flex;
            gap: 1rem;
            align-items: center;
          }

          .button {
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: background-color 0.2s ease-in-out;
            width: 100%;
          }
          
          .button-primary {
            background-color: #4c51bf;
            color: white;
          }

          .button-primary:hover {
            background-color: #434190;
          }

          .button-secondary {
            background-color: #e2e8f0;
            color: #4a5568;
          }

          .button-secondary:hover {
            background-color: #cbd5e0;
          }

          .button-success {
            background-color: #38a169;
            color: white;
          }

          .button-success:hover {
            background-color: #2f855a;
          }

          .button-danger {
            background-color: #e53e3e;
            color: white;
          }

          .button-danger:hover {
            background-color: #c53030;
          }

          .search-container {
            position: relative;
          }

          .search-icon {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #a0aec0;
            width: 1.25rem;
            height: 1.25rem;
          }

          .table-container {
            overflow-x: auto;
          }

          .customer-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
          }

          .customer-table thead {
            background-color: #f7fafc;
          }

          .customer-table th,
          .customer-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }

          .customer-table th {
            font-weight: 600;
            color: #718096;
            font-size: 0.875rem;
          }

          .customer-table tbody tr:hover {
            background-color: #f7fafc;
          }

          .actions {
            white-space: nowrap;
            text-align: center;
          }
          
          .action-btn {
            background: none;
            border: none;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: color 0.2s ease-in-out;
          }

          .action-btn.edit {
            color: #4c51bf;
          }

          .action-btn.edit:hover {
            color: #434190;
          }

          .action-btn.delete {
            color: #e53e3e;
          }

          .action-btn.delete:hover {
            color: #c53030;
          }

          .text-center {
            text-align: center;
          }

          .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background-color: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            width: 100%;
            max-width: 400px;
          }
        `}
      </style>
      <header className="header">
        <h1>Customer Management</h1>
      </header>

      {/* Customer Form */}
      <div className="card">
        <h2 className="card-title">{editingCustomer ? 'Update Customer' : 'Add New Customer'}</h2>
        <form onSubmit={handleAddOrUpdateCustomer}>
          <div className="form-grid">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="Customer Name"
              className="form-input"
              required
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              placeholder="Phone Number"
              className="form-input"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="Email"
              className="form-input"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="Address"
              className="form-input"
            />
          </div>
          <div className="button-group" style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              className={`button ${editingCustomer ? 'button-success' : 'button-primary'}`}
            >
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </button>
            {editingCustomer && (
              <button
                type="button"
                onClick={handleResetForm}
                className="button button-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="search-container">
          <input
            type="text"
            id="search"
            placeholder="Search by Name or Phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
          <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Customer Table */}
      <div className="card">
        <h2 className="card-title">Customer List</h2>
        {isLoading ? (
          <div className="text-center">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="text-center">No customers found. Add a new one to get started.</div>
        ) : (
          <div className="table-container">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email}</td>
                    <td>{customer.address}</td>
                    <td className="actions">
                      <button onClick={() => handleEditClick(customer)} className="action-btn edit">Edit</button>
                      <button onClick={() => handleDeleteClick(customer)} className="action-btn delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="card-title">Confirm Deletion</h3>
            <p>Are you sure you want to delete <b>{customerToDelete?.name}</b>?</p>
            <div className="button-group" style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={cancelDelete} className="button button-secondary">Cancel</button>
              <button onClick={confirmDelete} className="button button-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
