import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "student" | "instructor" | "admin";
  bio?: string;
  enrolledCourses: string[];
  createdCourses: string[];
  wishlist: string[];
  socialLinks: { platform: string; url: string }[];
  notifications: { message: string; read: boolean; createdAt: Date }[];
  settings: {
    language: string;
    darkMode: boolean;
  };
  providers: { provider: "google" | "github" | "facebook"; providerId: string }[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String },
    bio: { type: String, trim: true, default: "" },
    enrolledCourses: { type: [String], default: [] },
    createdCourses: { type: [String], default: [] },
    wishlist: { type: [String], default: [] },
    socialLinks: { type: [{ platform: String, url: String }], default: [] },
    notifications: { type: [{ message: String, read: Boolean, createdAt: { type: Date, default: Date.now } }], default: [] },
    settings: {
      language: { type: String, default: "en" },
      darkMode: { type: Boolean, default: false },
    },
    providers: {
      type: [{ provider: String, providerId: String }],
      required: true,
      default: [],
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for faster queries
UserSchema.index({ email: 1 });

export const User = model<IUser>("User", UserSchema);
