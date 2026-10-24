const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { products } = require('./data/products');

const app = express();
const PORT = process.env.PORT || 3000;

// ------------------------------------------------------------
// Security middleware
// ------------------------------------------------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['https://jerseyhub.example.com'];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
}));

app.use(express.json());

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://fonts.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'jersey-hub-api' });
});

app.get('/api/products', (req, res) => {
  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(item => item.id === Number(req.params.id));

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({ product });
});

app.post('/api/orders', (req, res) => {
  const { customer, items } = req.body;

  if (!customer || typeof customer !== 'object') {
    return res.status(400).json({ message: 'Invalid customer data' });
  }
  if (!customer.name || typeof customer.name !== 'string' || customer.name.trim().length === 0) {
    return res.status(400).json({ message: 'Customer name is required' });
  }
  if (!customer.email || typeof customer.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    return res.status(400).json({ message: 'Valid customer email is required' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Invalid order payload: items required' });
  }

  let total = 0;
  const validatedItems = [];

  for (const item of items) {
    if (!item.id || !Number.isFinite(Number(item.id))) {
      return res.status(400).json({ message: 'Invalid product id in order items' });
    }
    const product = products.find(p => p.id === Number(item.id));
    if (!product) {
      return res.status(400).json({ message: `Product id ${item.id} not found` });
    }
    const qty = Number(item.qty) || 1;
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
      return res.status(400).json({ message: 'Invalid quantity for product ' + product.name });
    }
    total += product.price * qty;
    validatedItems.push({ id: product.id, qty });
  }

  const order = {
    id: Date.now(),
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone ? String(customer.phone).trim() : ''
    },
    items: validatedItems,
    total: Number(total.toFixed(2)),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  res.status(201).json({ message: 'Order created successfully', order });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Jersey HUB backend running on http://localhost:${PORT}`);
});

