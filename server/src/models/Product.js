import mongoose from "mongoose";
import { createMemoryModel, isMemoryMode } from "../lib/memoryStore.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    category: { type: String, default: "General", trim: true },
    countInStock: { type: Number, required: true, default: 0, min: 0 },
  },
  { timestamps: true },
);

const MongooseProduct = mongoose.model("Product", productSchema);

const MemoryProduct = createMemoryModel({
  name: "Product",
  defaults: {
    description: "",
    image: "",
    category: "General",
    countInStock: 0,
  },
});

export default isMemoryMode() ? MemoryProduct : MongooseProduct;
