import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Product from "./models/Product.js";

const products = [
  {
    name: "Wireless Headphones",
    description: "Over-ear noise cancelling Bluetooth headphones with 30h battery.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    category: "Electronics",
    countInStock: 15,
  },
  {
    name: "Classic Leather Wallet",
    description: "Slim genuine leather bifold wallet with RFID protection.",
    price: 39.5,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
    category: "Accessories",
    countInStock: 30,
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-walled insulated bottle keeps drinks cold for 24h.",
    price: 24.0,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
    category: "Lifestyle",
    countInStock: 50,
  },
  {
    name: "Mechanical Keyboard",
    description: "75% layout, hot-swappable switches, RGB backlit.",
    price: 159.0,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
    category: "Electronics",
    countInStock: 12,
  },
  {
    name: "Minimalist Backpack",
    description: "Water resistant 20L backpack with padded laptop sleeve.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    category: "Accessories",
    countInStock: 22,
  },
  {
    name: "Ceramic Coffee Mug Set",
    description: "Set of 4 hand-glazed 12oz ceramic mugs.",
    price: 32.0,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600",
    category: "Home",
    countInStock: 40,
  },
  {
    name: "iPhone 15 Pro",
    description: "Apple flagship smartphone with A17 Pro chip and titanium design.",
    price: 129999,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569",
    category: "Electronics",
    countInStock: 10,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android smartphone with AI-powered camera features.",
    price: 119999,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
    category: "Electronics",
    countInStock: 8,
  },
  {
    name: "MacBook Air M3",
    description: "Lightweight Apple laptop with M3 chip and Retina display.",
    price: 149999,
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8",
    category: "Computers",
    countInStock: 6,
  },
  {
    name: "Dell XPS 15",
    description: "High-performance laptop for creators and developers.",
    price: 139999,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    category: "Computers",
    countInStock: 5,
  },
  {
    name: "ASUS ROG Gaming Laptop",
    description: "Powerful gaming laptop with RTX graphics card.",
    price: 159999,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
    category: "Gaming",
    countInStock: 7,
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise cancelling wireless headphones.",
    price: 29999,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    category: "Accessories",
    countInStock: 12,
  },
  {
    name: "Apple AirPods Pro",
    description: "Wireless earbuds with active noise cancellation.",
    price: 24999,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37",
    category: "Accessories",
    countInStock: 15,
  },
  {
    name: "Logitech MX Master 3S",
    description: "Advanced ergonomic wireless mouse for productivity.",
    price: 9999,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db",
    category: "Accessories",
    countInStock: 20,
  },
  {
    name: "Mechanical RGB Keyboard",
    description: "Mechanical keyboard with customizable RGB lighting.",
    price: 6999,
    image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae",
    category: "Gaming",
    countInStock: 18,
  },
  {
    name: "Gaming Mouse",
    description: "High precision gaming mouse with RGB effects.",
    price: 3999,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
    category: "Gaming",
    countInStock: 25,
  },
  {
    name: "Nike Air Max",
    description: "Comfortable and stylish running shoes.",
    price: 5999,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    category: "Shoes",
    countInStock: 30,
  },
  {
    name: "Adidas Ultraboost",
    description: "Premium running shoes with responsive cushioning.",
    price: 8999,
    image: "https://images.unsplash.com/photo-1543508282-6319a3e2621f",
    category: "Shoes",
    countInStock: 22,
  },
  {
    name: "Puma Sneakers",
    description: "Trendy sneakers for daily casual wear.",
    price: 4999,
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
    category: "Shoes",
    countInStock: 17,
  },
  {
    name: "Levi's Denim Jacket",
    description: "Classic blue denim jacket with modern fit.",
    price: 3499,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    category: "Fashion",
    countInStock: 14,
  },
  {
    name: "Casual Hoodie",
    description: "Comfortable oversized hoodie for all seasons.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c",
    category: "Fashion",
    countInStock: 25,
  },
  {
    name: "Ray-Ban Sunglasses",
    description: "Premium UV protected sunglasses.",
    price: 7999,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
    category: "Fashion",
    countInStock: 10,
  },
  {
    name: "Apple Watch Series 9",
    description: "Advanced smartwatch with fitness tracking.",
    price: 45999,
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d",
    category: "Watches",
    countInStock: 9,
  },
  {
    name: "Samsung Galaxy Watch 6",
    description: "Stylish smartwatch with health monitoring.",
    price: 32999,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    category: "Watches",
    countInStock: 11,
  },
  {
    name: "Fossil Leather Watch",
    description: "Elegant leather strap analog watch.",
    price: 11999,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3",
    category: "Watches",
    countInStock: 16,
  },
  {
    name: "Canon DSLR Camera",
    description: "Professional DSLR camera for photography.",
    price: 79999,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    category: "Electronics",
    countInStock: 4,
  },
  {
    name: "GoPro Hero 12",
    description: "Waterproof action camera for adventure recording.",
    price: 39999,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    category: "Electronics",
    countInStock: 7,
  },
  {
    name: "PlayStation 5",
    description: "Next-generation gaming console from Sony.",
    price: 54999,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
    category: "Gaming",
    countInStock: 6,
  },
  {
    name: "Xbox Series X",
    description: "Powerful gaming console with 4K support.",
    price: 52999,
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d",
    category: "Gaming",
    countInStock: 5,
  },
  {
    name: "Gaming Chair",
    description: "Ergonomic gaming chair with lumbar support.",
    price: 15999,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7",
    category: "Gaming",
    countInStock: 9,
  },
  {
    name: "Smart LED TV 55 Inch",
    description: "4K Ultra HD Smart Android TV.",
    price: 64999,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6",
    category: "Electronics",
    countInStock: 8,
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable speaker with deep bass sound.",
    price: 4999,
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab",
    category: "Accessories",
    countInStock: 20,
  },
  {
    name: "Wireless Charger",
    description: "Fast charging wireless pad for smartphones.",
    price: 1999,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586",
    category: "Accessories",
    countInStock: 24,
  },
  {
    name: "USB-C Hub",
    description: "Multiport USB-C hub for laptops.",
    price: 2999,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    category: "Accessories",
    countInStock: 19,
  },
  {
    name: "Office Backpack",
    description: "Waterproof backpack with laptop compartment.",
    price: 3499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    category: "Fashion",
    countInStock: 13,
  },
  {
    name: "Leather Wallet",
    description: "Premium genuine leather wallet.",
    price: 1499,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93",
    category: "Fashion",
    countInStock: 26,
  },
  {
    name: "Perfume for Men",
    description: "Long lasting luxury fragrance.",
    price: 4599,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601",
    category: "Fashion",
    countInStock: 15,
  },
  {
    name: "Coffee Maker",
    description: "Automatic coffee machine for home and office.",
    price: 8999,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6",
    category: "Home Appliances",
    countInStock: 7,
  },
  {
    name: "Air Fryer",
    description: "Healthy oil-free cooking appliance.",
    price: 10999,
    image: "https://images.unsplash.com/photo-1585515656973-6e0d6b9ef44d",
    category: "Home Appliances",
    countInStock: 8,
  },
  {
    name: "Vacuum Cleaner",
    description: "Powerful cordless vacuum cleaner.",
    price: 12999,
    image: "https://images.unsplash.com/photo-1558317374-067fb5f30001",
    category: "Home Appliances",
    countInStock: 6,
  },
  {
    name: "Study Table",
    description: "Modern wooden study desk.",
    price: 7999,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    category: "Furniture",
    countInStock: 10,
  },
  {
    name: "Ergonomic Office Chair",
    description: "Comfortable chair for long work sessions.",
    price: 14999,
    image: "https://images.unsplash.com/photo-1505843513577-22bb7d21e455",
    category: "Furniture",
    countInStock: 9,
  },
  {
    name: "Bedside Lamp",
    description: "Minimal LED bedside lamp with warm lighting.",
    price: 2499,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
    category: "Home Decor",
    countInStock: 18,
  },
  {
    name: "Smartphone Tripod",
    description: "Adjustable tripod for mobile photography.",
    price: 1599,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    category: "Accessories",
    countInStock: 21,
  },
  {
    name: "Portable SSD 1TB",
    description: "High-speed external SSD storage device.",
    price: 11999,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b",
    category: "Computers",
    countInStock: 14,
  },
  {
    name: "Fitness Smart Band",
    description: "Track steps, heart rate and sleep.",
    price: 3499,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a",
    category: "Watches",
    countInStock: 30,
  }
];

export async function seedDemoData({ silent = false } = {}) {
  const log = silent ? () => {} : (...a) => console.log(...a);

  await Product.deleteMany({});
  await Product.insertMany(products);

  log(`[seed] inserted ${products.length} products`);

  await User.deleteMany({});

  await User.create({
    name: "Admin",
    email: "admin@shop.com",
    password: "admin123",
    isAdmin: true,
  });

  await User.create({
    name: "Demo User",
    email: "user@shop.com",
    password: "user123",
  });

  log("[seed] created admin and demo user");
}

const isMain = import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  const run = async () => {
    await connectDB();

    if (process.env.MONGO_URI && mongoose.connection.readyState !== 1) {
      console.error("[seed] no DB connection. Check MONGO_URI and try again.");
      process.exit(1);
    }

    await seedDemoData();

    console.log("[seed] done.");
    console.log("  Admin login: admin@shop.com / admin123");
    console.log("  User login:  user@shop.com / user123");

    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }

    process.exit(0);
  };

  run().catch((err) => {
    console.error("[seed] error:", err);
    process.exit(1);
  });
}
