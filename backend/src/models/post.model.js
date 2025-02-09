import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
        },
      ],
    },
    media: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    tags: [
      {
        type: String,
        default: "Discussion",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "Not Verified",
    },
    criticality: {
      type: String,
      default: "Minor",
    },
    verifiedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    disapprovedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    location: {
      latitude: { type: Number, required: false, default: null },
      longitude: { type: Number, required: false, default: null },
    },
    community : {
        type: String , 
        default: "General"
    } , 
    isLostAndFound: {
        type: Boolean , 
        default: false , 
    }
    //community values  - Mumbai Railway ,  water supply , Traffic road , Accidents
    //status values - not verified , verified , Solved
    //criticality values - Minor(2Km) , Moderate(750m) , Severe(250m)
  },
  {
    timestamps: true,
  }
);

const Post = model("Post", postSchema);

export default Post;
