import { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Trash2, ArrowLeft, Search } from 'lucide-react';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // The current mode of the application: 'add', 'update', 'details', or 'delete'.
  const [mode, setMode] = useState('add');
  
  // State for the form data, used for adding and updating products.
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
  });

  // Stores the ID of the currently selected product for update/delete/details.
  const [selectedProductId, setSelectedProductId] = useState('');

  // State for the search query in the details view.
  const [searchQuery, setSearchQuery] = useState('');

  // Base URL for the Spring Boot backend API.
  const API_URL = 'http://localhost:8080/api/products';


  /**
   * Fetches all products from the backend API.
   * This function is called on component mount and after any CUD operation.
   */
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetching products without an Authorization header as requested.
      const response = await fetch(API_URL);
      if (!response.ok) {
        // We'll throw an error if the response is not a success
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(`Failed to load products: ${error.message}.`);
      setProducts([]); // Clear products on error
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * useEffect hook to fetch products when the component first mounts.
   */
  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Handles changes to the form input fields.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  /**
   * Handles the selection of a product from the dropdown or list.
   * It populates the form with the selected product's data.
   */
  const selectProduct = (productId) => {
    setSelectedProductId(productId);
    if (productId) {
      // Find the selected product from the state and set the form data.
      const product = products.find(p => p.id.toString() === productId);
      setFormData(product || { name: '', category: '', price: '', description: '' });
    } else {
      // If no product is selected, reset the form.
      setFormData({ name: '', category: '', price: '', description: '' });
    }
  };
  
  const handleProductSelect = (e) => {
      selectProduct(e.target.value);
  };
  
  const handleProductClick = (product) => {
      selectProduct(product.id.toString());
  };

  /**
   * Handles the form submission for adding a new product.
   */
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description
      };
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      await response.json();
      fetchProducts(); // Refresh the product list after a successful addition.
      setFormData({ name: '', category: '', price: '', description: '' }); // Reset the form.
      setError(null); // Clear any previous errors.
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product. Please check the server logs for details.');
    }
  };

  /**
   * Handles the form submission for updating an existing product.
   */
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError('Please select a product to update.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${selectedProductId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, price: parseFloat(formData.price) }),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      fetchProducts(); // Refresh the product list after a successful update.
      setError(null); // Clear any previous errors.
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product.');
    }
  };

  /**
   * Deletes a product via a DELETE request to the API.
   */
  const handleDeleteProduct = async () => {
    if (!selectedProductId) {
      setError('Please select a product to delete.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${selectedProductId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      fetchProducts(); // Refresh the product list after a successful deletion.
      setFormData({ name: '', category: '', price: '', description: '' }); // Reset the form.
      setSelectedProductId(''); // Clear the selected product.
      setError(null); // Clear any previous errors.
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Failed to delete product.');
    }
  };

  /**
   * Renders the appropriate form or view based on the current mode.
   */
  const renderForm = () => {
    if (isLoading) {
      return <div>Loading products...</div>;
    }

    // Filter products based on search query
    const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (mode) {
      case 'add':
        return (
          <form className="form" onSubmit={handleAddProduct}>
            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="input" required />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input type="text" id="category" name="category" value={formData.category} onChange={handleInputChange} className="input" />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} className="input" required />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" className="input"></textarea>
            </div>
            <button type="submit" className="button add-button">Add Product</button>
          </form>
        );

      case 'update':
        return (
          <form className="form" onSubmit={handleUpdateProduct}>
            <div className="form-group">
              <label htmlFor="product-select">Select Product to Update</label>
              <select id="product-select" value={selectedProductId} onChange={handleProductSelect} className="input" required>
                <option value="">-- Select a product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {selectedProductId && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Product Name</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input type="text" id="category" name="category" value={formData.category} onChange={handleInputChange} className="input" />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price</label>
                  <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} className="input" required />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows="3" className="input"></textarea>
                </div>
                <button type="submit" className="button update-button">Update Product</button>
              </>
            )}
          </form>
        );

      case 'details':
        // New logic to handle details view with search functionality
        if (selectedProductId) {
          // Display the details of the selected product
          return (
            <div className="details-container">
              <button onClick={() => selectProduct('')} className="back-button"><ArrowLeft size={16} /><span>Back to list</span></button>
              <div className="details-card">
                <h3>{formData.name}</h3>
                <p><strong>Category:</strong> {formData.category}</p>
                <p><strong>Price:</strong> ₹ {formData.price} /-</p>
                <p><strong>Description:</strong> {formData.description}</p>
              </div>
            </div>
          );
        } else {
          // Display a search bar and a filtered list of products to click on
          return (
            <div className="details-container">
              <div className="search-box">
                <Search size={16} color="#495057" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="product-list">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(p => (
                    <div key={p.id} className="product-list-item" onClick={() => handleProductClick(p)}>
                      <span>{p.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center">No products found. Try a different search or add a new product.</p>
                )}
              </div>
            </div>
          );
        }

      case 'delete':
        return (
          <div className="delete-container">
            <div className="form-group">
              <label htmlFor="product-select">Select Product to Delete</label>
              <select id="product-select" value={selectedProductId} onChange={handleProductSelect} className="input">
                <option value="">-- Select a product --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {selectedProductId && (
              <div className="delete-confirmation">
                <p>Are you sure you want to delete the product: <span>{formData.name}</span>?</p>
                <button type="button" onClick={handleDeleteProduct} className="button delete-button">Confirm Delete</button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="product-management-app">
      <header className="header">
        <h1>Product Management</h1>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="button-group">
        <button onClick={() => { setMode('add'); setSelectedProductId(''); setFormData({ name: '', category: '', price: '', description: '' }); setError(null); setSearchQuery(''); }} className={`mode-button ${mode === 'add' ? 'active' : ''}`}><Plus size={20} /><span>Add New</span></button>
        <button onClick={() => { setMode('update'); setSelectedProductId(''); setFormData({ name: '', category: '', price: '', description: '' }); setError(null); setSearchQuery(''); }} className={`mode-button ${mode === 'update' ? 'active' : ''}`}><Edit size={20} /><span>Update</span></button>
        <button onClick={() => { setMode('details'); setSelectedProductId(''); setFormData({ name: '', category: '', price: '', description: '' }); setError(null); setSearchQuery(''); }} className={`mode-button ${mode === 'details' ? 'active' : ''}`}><Eye size={20} /><span>Details</span></button>
        <button onClick={() => { setMode('delete'); setSelectedProductId(''); setFormData({ name: '', category: '', price: '', description: '' }); setError(null); setSearchQuery(''); }} className={`mode-button ${mode === 'delete' ? 'active' : ''}`}><Trash2 size={20} /><span>Delete</span></button>
      </div>

      <div className="form-content">
        {renderForm()}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <div className="app-container">
      <Product />
      <style>
        {`
          body {
            margin: 0;
            font-family: 'Inter', sans-serif;
            background-color: #f8f9fa;
            color: #343a40;
          }
          .app-container {
            min-height: 100vh;
            padding: 1rem;
          }
          .product-management-app {
            max-width: 600px;
            margin: 2rem auto;
            background-color: #ffffff;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #e9ecef;
          }
          .header {
            padding-bottom: 1rem;
            border-bottom: 1px solid #e9ecef;
            margin-bottom: 1.5rem;
          }
          .header h1 {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 0;
          }
          .button-group {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
          }
          .mode-button {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.75rem 1rem;
            font-weight: bold;
            border-radius: 8px;
            background-color: #e9ecef;
            color: #495057;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
          }
          .mode-button:hover {
            background-color: #e9eefb;
          }
          .mode-button.active {
            background-color: #0d6efd;
            color: #ffffff;
            box-shadow: 0 2px 4px rgba(13, 110, 253, 0.25);
          }
          .form-content {
          }
          .form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .form-group {
            display: flex;
            flex-direction: column;
          }
          .form-group label {
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.25rem;
          }
          .input {
            padding: 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 6px;
            width: 100%;
          }
          .input:focus {
            outline: none;
            border-color: #0d6efd;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
          }
          .button {
            padding: 0.75rem 1rem;
            font-weight: 600;
            border: none;
            border-radius: 6px;
            color: #ffffff;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .add-button {
            background-color: #0d6efd;
          }
          .add-button:hover {
            background-color: #0b63d7;
          }
          .update-button {
            background-color: #198754;
          }
          .update-button:hover {
            background-color: #157347;
          }
          .delete-button {
            background-color: #dc3545;
          }
          .delete-button:hover {
            background-color: #bb2d3b;
          }
          .details-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .details-card {
            background-color: #e9ecef;
            padding: 1rem;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .details-card h3 {
            font-size: 1.25rem;
            font-weight: bold;
            margin: 0;
          }
          .details-card p {
            margin: 0;
          }
          .delete-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .delete-confirmation {
            padding: 1rem;
            background-color: #f8d7da;
            border: 1px solid #f5c2c7;
            border-radius: 8px;
          }
          .error-message {
            color: #dc3545;
            text-align: center;
            font-weight: 500;
          }
          .product-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .product-list-item {
            padding: 0.75rem 1rem;
            background-color: #f1f3f5;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .product-list-item:hover {
            background-color: #e9ecef;
          }
          .back-button {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem;
            background-color: #6c757d;
            color: #ffffff;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            width: fit-content;
            margin-bottom: 1rem;
          }
          .search-box {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #f1f3f5;
            border: 1px solid #ced4da;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            margin-bottom: 1rem;
          }
          .search-input {
            border: none;
            background-color: transparent;
            width: 100%;
            outline: none;
          }
        `}
      </style>
    </div>
  );
}
