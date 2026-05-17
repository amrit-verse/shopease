# ShopEase — Full-Stack eCommerce

A production-ready eCommerce app with **product listing, cart, authentication, order tracking, and Razorpay payment integration**. Optimized for performance with INR currency support, lazy-loaded pages, and robust image handling.

## Features

- 🛍️ Product catalogue with search & filtering
- 🛒 Persistent cart with INR (₹) currency formatting
- 🔐 JWT authentication (register / login)
- 💳 **Razorpay payment integration** (test mode + demo simulate button)
- 📦 **Order tracking system** with 5-step stepper UI
- 👤 My Orders page with real-time status display
- 🔧 Admin dashboard — manage products & update order statuses
- 🗄️ Works with MongoDB **or** in-memory (zero config demo mode)
- ⚡ **Performance Optimized**: lazy-loaded route splitting, skeleton loading, image fallback handling
- 🖼️ Stable product images with Unsplash/Pexels URLs and fallback support

## Recent Improvements

### Currency & Pricing
- **INR (₹) Support**: All prices are now formatted in Indian Rupees across the frontend (cart, checkout, product cards, orders).
- Centralized `formatCurrency` utility for consistent formatting.

### Performance Optimizations
- **Code Splitting**: Heavy pages (Admin, Orders, Checkout) are lazy-loaded with React.lazy + Suspense.
- **Skeleton Loading**: Product list shows skeleton placeholders while data loads for better UX.
- **Image Optimization**: 
  - New `ImageWithFallback` component handles broken/missing images gracefully with a fallback SVG.
  - Lazy loading (`loading="lazy"`) on all product images for faster initial page load.
  - Stable image URLs from Unsplash/Pexels with optimized query params (`?auto=format&fit=crop&w=700&q=80`).

### Product Data
- **Seed Database**: 46 products with matching high-quality images from Unsplash and Pexels.
- **Image Resilience**: Even if a source image fails, the frontend falls back to a clean placeholder UI.

## Quick Start

### Backend

```bash
cd server
npm install
cp .env.example .env     # edit .env with your keys
npm run dev              # starts on http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev              # starts on http://localhost:5173
```

> **No MongoDB?** Leave `MONGO_URI` unset — the server auto-switches to in-memory storage.

## Razorpay Setup (Test Mode)

1. Create a free account at https://dashboard.razorpay.com
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy `Key ID` and `Key Secret` into `server/.env`:

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

Without real keys the app runs in **demo mode** — click "Simulate Payment" to complete checkout without a real gateway.

## Order Status Flow

```
Order Placed → Processing → Shipped → Out for Delivery → Delivered
```

Each order gets a unique **Tracking ID** (e.g. `TRK-A1B2C3D4`). Admins can update order status from the Admin → Orders tab.

## Docker

```bash
docker compose up
```

## Project Structure

```
shopease/
├── client/          # React + TypeScript + Tailwind (Vite)
│   └── src/
│       ├── api/         # fetch wrappers (auth, products, orders, payment)
│       ├── components/  # Navbar, ProductCard, ProtectedRoute, ImageWithFallback, ProductSkeleton
│       ├── context/     # Auth, Cart, Toast
│       ├── pages/       # Home, ProductDetail, Cart, Checkout, Orders, Admin (lazy-loaded)
│       └── utils/       # formatCurrency (INR formatting)
└── server/          # Express + MongoDB (Mongoose) or in-memory
    └── src/
        ├── controllers/ # auth, product, order, payment
        ├── models/      # User, Product, Order
        ├── routes/      # authRoutes, productRoutes, orderRoutes, paymentRoutes
        ├── middleware/  # auth, error
        └── seed.js      # 46 demo products with optimized image URLs
```
