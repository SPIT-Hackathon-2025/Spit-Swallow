// server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import userRouter from "./routes/user.router.js";
import postRouter from "./routes/post.router.js";
import commentRouter from "./routes/comment.router.js";
import aiRouter from "./routes/askai.router.js";

import http from "http";
import { Server } from "socket.io";
import Post from "./models/post.model.js";
import User from "./models/user.model.js";
import { getDistance } from "./utils/functions.js";
import { notifications } from "./utils/notifications.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

// Attach the io instance to the Express app
app.set("io", io);

// Socket connection handling
io.on("connection", (socket) => {
  console.log("User connected", socket.id);
  io.emit("simple-message", "Hello from the server!");
  socket.on("newPost", async ({ postId }) => {
    console.log("Received newPost event for post:", postId);
    // You can call your notification logic here if needed
  });
  socket.on("tobackend", ()=>{
    console.log("Received from frontend");
  })
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/ping", (req, res) => {
  res.send("Pong");
});

// Routes
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/ai", aiRouter);

const PORT = process.env.PORT || 8000;

console.log(process.env.MONGODB_URI);

mongoose
  .connect("mongodb+srv://dakshjain624:SPIT-hack@spit-hack.7enuz.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

// Optionally export io if needed elsewhere, but avoid circular imports in controllers
export { io };
