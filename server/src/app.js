import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/healthz", (_req, res) => {
  const usingMemory = !process.env.MONGO_URI;
  const dbReady = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    storage: usingMemory ? "in-memory (demo)" : dbReady ? "mongodb" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
