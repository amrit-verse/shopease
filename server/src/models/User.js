import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { createMemoryModel, isMemoryMode } from "../lib/memoryStore.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const MongooseUser = mongoose.model("User", userSchema);

const MemoryUser = createMemoryModel({
  name: "User",
  defaults: { isAdmin: false },
  preSave: async function () {
    if (this.password && !this._hashed) {
      this.email = String(this.email || "").toLowerCase().trim();
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      this._hashed = true;
    }
  },
  methods: {
    matchPassword(plain) {
      return bcrypt.compare(plain, this.password);
    },
  },
  toJSON: (doc) => {
    const { password, _hashed, ...safe } = doc;
    return safe;
  },
});

export default isMemoryMode() ? MemoryUser : MongooseUser;
