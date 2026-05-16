import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(403).json({ message: "Admin access required" });
};

export const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
