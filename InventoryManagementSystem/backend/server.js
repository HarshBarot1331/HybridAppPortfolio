const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const connectDB = require('./config/database');
const Product = require('./models/Product');

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
// Root route - API information
app.get('/', (req, res) => {
  res.json({
    message: 'Inventory Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      addProduct: 'POST /api/products',
      getProducts: 'GET /api/products',
      getProductsByCategory: 'GET /api/products?category=CATEGORY_NAME',
      deleteProduct: 'DELETE /api/products/:id',
      deleteAllProducts: 'DELETE /api/products'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Inventory Management API is running' });
});

// Inventory Management API Routes

// Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const { sku, name, category, quantity, price } = req.body;

    // Validate input
    if (!sku || !name || !category || quantity === undefined || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: sku, name, category, quantity, price' 
      });
    }

    // Check if product with same SKU already exists
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product with this SKU already exists' 
      });
    }

    // Create new product
    const product = new Product({
      sku,
      name,
      category,
      quantity: Number(quantity),
      price: Number(price)
    });

    const savedProduct = await product.save();

    res.status(201).json({ 
      success: true, 
      message: 'Product added successfully',
      product: savedProduct
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add product. Please try again later.',
      error: error.message
    });
  }
});

// Get all products with optional category filter
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    
    // Build query
    const query = category ? { category } : {};

    // Fetch products
    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: products.length,
      products 
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products. Please try again later.',
      error: error.message
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Inventory Management backend server running on port ${PORT}`);
  console.log(`MongoDB connected to inventorydb`);
});

// Handle server errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n Error: Port ${PORT} is already in use.`);
    console.log(`\nTo fix this, you can:`);
    console.log(`1. Kill the process using port ${PORT}: lsof -ti:${PORT} | xargs kill -9`);
    console.log(`2. Or use a different port by setting PORT environment variable: PORT=5002 npm start\n`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

