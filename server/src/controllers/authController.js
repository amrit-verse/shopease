import User from "../models/User.js";
import { signToken } from "../middleware/authMiddleware.js";

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const register = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }
  const user = await User.create({ name, email, password });
  const token = signToken(user._id);
  res.status(201).json({ user, token });
};

export const login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = signToken(user._id);
  res.json({ user, token });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
