import { Schema, model } from "mongoose";
import mongoose from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Name is required"],
      minLength: [5, "Name must be atleast 5 characters"],
      maxLength: [50, "Name should be less than 50 characters"],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Emai; is required"],
      lowercase: true,
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please fill in a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [3, "Password must be at least 3 characters"],
    },
    credit: {
      type: Number,
      default: 0,
    },
    media: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    location: {
      latitude: { type: Number, required: false, default: null },
      longitude: { type: Number, required: false, default: null },
    },
    badges: [{
        type: String , 
    }] , 
    verifiedPostsCount: {
        type: Number , 
        default: 0 , 
    } , 
    verifiedIssuesCount: {
        type: Number , 
        default: 0 ,
    }
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

export default User;
