import Product from "../models/Product.js";

export const listProducts = async (req, res) => {
  const { search = "", category } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (category) filter.category = category;
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
};

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const createProduct = async (req, res) => {
  const { name, description, price, image, category, countInStock } =
    req.body || {};
  if (!name || price == null) {
    return res.status(400).json({ message: "Name and price are required" });
  }
  const product = await Product.create({
    name,
    description: description || "",
    price: Number(price),
    image: image || "",
    category: category || "General",
    countInStock: Number(countInStock || 0),
  });
  res.status(201).json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  const fields = ["name", "description", "price", "image", "category", "countInStock"];
  for (const f of fields) {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  }
  await product.save();
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await product.deleteOne();
  res.json({ message: "Product deleted" });
};
