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
];

export async function seedDemoData({ silent = false } = {}) {
  const log = silent ? () => {} : (...a) => console.log(...a);

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(products);
    log(`[seed] inserted ${products.length} products`);
  }

  const userCount = await User.countDocuments();
  if (userCount === 0) {
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
    console.log("  User login:  user@shop.com  / user123");
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    process.exit(0);
  };
  run().catch((err) => {
    console.error("[seed] error:", err);
    process.exit(1);
  });
}
