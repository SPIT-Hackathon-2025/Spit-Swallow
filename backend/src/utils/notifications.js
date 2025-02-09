import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getDistance } from "./functions.js";

export const notifications = (socket , io) => {
    socket.on("newPost", async ({ postId }) => {
        console.log("post", postId);
    
        const post = await Post.findById(postId);
        if (!post) {
          throw new Error("Post not found");
        }
        if (post.criticality === "Severe" || post.status === "Verified") {
          io.sockets.sockets.forEach(async (socketInstance) => {
            const userId = socketInstance.handshake.query.userId;
            const user = await User.findById(userId);
            if (!user) {
              throw new Error("User not found");
            }
            const distance = getDistance(post.location, user.location);
            console.log("helo", distance);
    
            if (
              (post.criticality === "Severe" && distance <= 300) ||
              (post.criticality === "Moderate" && distance <= 750) ||
              (post.criticality === "Minor" && distance <= 2000)
            ) {
              socketInstance.emit("notification", post);
            }
          });
        }
      });
      io.on("disconnect", () => {
        console.log("User disconnected");
      });
}