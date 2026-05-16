import mongoose from "mongoose";

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log("[db] No MongoDB URI provided → using in-memory mode");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[db] MongoDB connected");
  } catch (error) {
    console.log("[db] connection failed, switching to in-memory mode");
  }
};
