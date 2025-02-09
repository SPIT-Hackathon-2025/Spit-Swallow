import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const eventSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
  },
  time: {
    type: String,
    required: [true, "Time is required"],
  },
  location: {
    type: String,
    required: [true, "Location is required"],
  },
  attendees: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  tags: {
    type: [
      {
        type: String,
        default: "Club Event",
      },
    ],
  },
});
