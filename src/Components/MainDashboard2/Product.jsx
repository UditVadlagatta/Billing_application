import { useState, useEffect } from "react";
import { ArrowLeft, Search } from "lucide-react";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected product for details view
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = "http://localhost:8080/api/products";

  // Fetch products
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered products by search
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="product-management-app">
      <header className="header">
        <h1>Products</h1>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="form-content">
        {isLoading ? (
          <div>Loading products...</div>
        ) : selectedProduct ? (
          <div className="details-container">
            <button
              onClick={() => setSelectedProduct(null)}
              className="back-button"
            >
              <ArrowLeft size={16} />
              <span>Back to list</span>
            </button>
            <div className="details-card">
              <h3>{selectedProduct.name}</h3>
              <p>
                <strong>Category:</strong> {selectedProduct.category}
              </p>
              <p>
                <strong>Price:</strong> ₹ {selectedProduct.price} /-
              </p>
              <p>
                <strong>Description:</strong> {selectedProduct.description}
              </p>
            </div>
          </div>
        ) : (
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
                filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="product-list-item"
                    onClick={() => setSelectedProduct(p)}
                  >
                    <span>{p.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-center">
                  No products found. Try a different search.
                </p>
              )}
            </div>
          </div>
        )}
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
          .form-content { }
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
