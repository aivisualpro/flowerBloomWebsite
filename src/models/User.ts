import mongoose from "mongoose";

const GENDER = ["male", "female", "other"];

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    ar_firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    ar_lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, index: true },
    password: { type: String }, // optional for Google OAuth users
    gender: { type: String, enum: GENDER },
    role: { type: String, enum: ['ADMIN', 'CUSTOMER', 'SUPER_ADMIN'], default: 'CUSTOMER' },
    dob: { type: Date },
    lastLoginAt: { type: Date },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    passwordChangedAt: { type: Date },
    // OAuth fields
    provider: { type: String, enum: ["credentials", "google"], default: "credentials" },
    image: { type: String }, // profile picture URL from Google
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
