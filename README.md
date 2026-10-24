# Jersey HUB Store

Jersey HUB is a modern e-commerce storefront and RESTful API backend designed for browsing and ordering sports jerseys and athletic apparel.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Get All Products](#get-all-products)
  - [Get Product by ID](#get-product-by-id)
  - [Create Order](#create-order)
- [Security & Middleware](#security--middleware)

---

## Overview

Jersey HUB offers a clean e-commerce experience for sports enthusiasts to explore club jerseys, national team kits, rugby gear, and customizable kits. Built with Node.js and Express on the backend and static HTML/CSS/JS on the frontend, Jersey HUB serves both API consumers and browser users.

---

## Features

- **Product Catalog Browsing**: View available jerseys with categorization, stock levels, pricing, badges, and descriptions.
- **Product Detail View**: Dedicated product page with item specifications and ordering options.
- **Cart & Order Processing**: In-browser shopping cart and API payload validation for order processing.
- **Built-in Security**:
  - Content Security Policy (CSP) headers
  - CORS origin restrictions
  - Rate limiting (100 requests per 15-minute window per IP)
  - Input validation for order requests
- **Static Asset Delivery**: Static HTML/CSS/JS frontend served directly via Express static middleware.

---

## Tech Stack

- **Backend**: Node.js, Express.js
- **Security & Utilities**: `cors`, `express-rate-limit`
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Data Source**: In-memory JavaScript data store (`data/products.js`)

---

## Project Structure

```
.
├── CSS/
│   └── main.css              # Frontend styling
├── JS/
│   ├── apps.js               # Application client-side logic
│   └── main.js               # Main frontend script
├── data/
│   └── products.js           # Product catalog data model
├── public/
│   ├── 404.html              # 404 error page
│   ├── index.html            # Main storefront homepage
│   ├── privacy.html          # Privacy policy page
│   ├── product.html          # Product detail view page
│   ├── terms.html            # Terms of service page
│   ├── robots.txt            # Search engine crawling rules
│   └── sitemap.xml           # Site map
├── AGENTS.md                 # Agent and UI/UX skill guidelines
├── package.json              # NPM dependencies and scripts
├── server.js                 # Express application server entry point
└── README.md                 # Project documentation
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) (included with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd jersey-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Server

Start the application server:
```bash
npm start
```

For development mode:
```bash
npm run dev
```

By default, the server will start at `http://localhost:3000`.

---

## Environment Variables

The server configurable options via environment variables:

| Variable | Description | Default Value |
| --- | --- | --- |
| `PORT` | The port for the Express server to listen on. | `3000` |
| `ALLOWED_ORIGINS` | Comma-separated list of origins allowed by CORS middleware. | `https://jerseyhub.example.com` |

Example `.env` configuration or export:
```bash
export PORT=8080
export ALLOWED_ORIGINS="http://localhost:3000,https://my-jersey-hub.com"
```

---

## API Reference

### Health Check

- **Endpoint**: `GET /health`
- **Description**: Returns the health status of the service.
- **Response**: `200 OK`
  ```json
  {
    "status": "ok",
    "service": "jersey-hub-api"
  }
  ```

### Get All Products

- **Endpoint**: `GET /api/products`
- **Description**: Retrieves all available products in the catalog.
- **Response**: `200 OK`
  ```json
  {
    "products": [
      {
        "id": 1,
        "name": "Manchester City Jersey Kit",
        "club": "Man City",
        "category": "new",
        "price": 8.99,
        "image": "IMAGES/images.jpeg",
        "description": "Official-style Man City home jersey...",
        "stock": 12,
        "badge": "New Arrival"
      }
    ]
  }
  ```

### Get Product by ID

- **Endpoint**: `GET /api/products/:id`
- **Description**: Retrieves a single product by its unique integer ID.
- **Response**:
  - `200 OK` when found:
    ```json
    {
      "product": {
        "id": 1,
        "name": "Manchester City Jersey Kit",
        ...
      }
    }
    ```
  - `404 Not Found` if product does not exist:
    ```json
    {
      "message": "Product not found"
    }
    ```

### Create Order

- **Endpoint**: `POST /api/orders`
- **Description**: Creates a new purchase order.
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "customer": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1234567890"
    },
    "items": [
      {
        "id": 1,
        "qty": 2
      }
    ]
  }
  ```
- **Validation Rules**:
  - `customer.name` must be a non-empty string.
  - `customer.email` must be a valid email format.
  - `items` must be a non-empty array of items with valid `id` and integer quantity `qty` (between 1 and 10).
- **Response**:
  - `201 Created` on success:
    ```json
    {
      "message": "Order created successfully",
      "order": {
        "id": 1700000000000,
        "customer": {
          "name": "Jane Doe",
          "email": "jane@example.com",
          "phone": "+1234567890"
        },
        "items": [
          {
            "id": 1,
            "qty": 2
          }
        ],
        "total": 17.98,
        "status": "pending",
        "createdAt": "2026-10-24T19:30:00.000Z"
      }
    }
    ```
  - `400 Bad Request` if payload validation fails:
    ```json
    {
      "message": "Valid customer email is required"
    }
    ```

---

## Security & Middleware

Jersey HUB includes security defaults configured in `server.js`:
- **Content Security Policy (CSP)**: Headers restricting allowed scripts, styles, fonts, frames, and images.
- **Rate Limiting**: Limits clients to 100 requests per 15-minute window via `express-rate-limit`.
- **CORS Protection**: Restricted to configured allowed origins.
- **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
