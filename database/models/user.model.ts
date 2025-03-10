import { Schema, models, model, Document } from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  image?: string;
  address?: string;
  contactNumber?: number;
  role: string;
}

export interface IUserDoc extends IUser, Document {}
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["user", "business", "admin"],
      default: "user",
    },
    image: { type: String },
    address: { type: String },
    contactNumber: {
      type: Number,
      validate: {
        validator: function (value: number) {
          return /^[6789]\d{9}$/.test(value.toString());
        },
        message:
          "Invalid contact number. Must be a 10-digit number starting with 6, 7, 8, or 9.",
      },
    },
  },
  { timestamps: true }
);

const User = models?.User || model<IUser>("User", UserSchema);

export default User;
