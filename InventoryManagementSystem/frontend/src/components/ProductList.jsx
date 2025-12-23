import { useState, useEffect } from 'react';
import './ProductList.css';

const ProductList = ({ refreshTrigger }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async (category = '') => {
    setLoading(true);
    setError('');
    try {
      const url = category 
        ? `/api/products?category=${encodeURIComponent(category)}`
        : '/api/products';
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while fetching products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();

      if (response.ok) {
        // Extract unique categories from products
        const uniqueCategories = [...new Set((data.products || []).map(p => p.category))];
        setCategories(uniqueCategories.sort());
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory, refreshTrigger]);

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const clearFilter = () => {
    setSelectedCategory('');
  };

  if (loading && products.length === 0) {
    return (
      <div className="product-list-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="list-header">
        <h2 className="list-title">Product Inventory</h2>
        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <button onClick={clearFilter} className="clear-filter-btn">
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products found{selectedCategory ? ` in category "${selectedCategory}"` : ''}.</p>
          <p>Add your first product using the form above!</p>
        </div>
      ) : (
        <>
          <div className="product-count">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
            {selectedCategory && ` in "${selectedCategory}"`}
          </div>
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                  <span className="product-sku">{product.sku}</span>
                </div>
                <div className="product-details">
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{product.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Quantity:</span>
                    <span className={`detail-value ${product.quantity === 0 ? 'out-of-stock' : ''}`}>
                      {product.quantity}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value price">${parseFloat(product.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;


