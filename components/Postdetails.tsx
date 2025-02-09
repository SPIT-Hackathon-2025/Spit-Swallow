import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const names  = ["John", "Doe", "Jane", "Smith", "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Ryan", "Sophia", "Tom", "Uma", "Victor", "Wendy", "Xander", "Yara", "Zane"];

const getRandomName = () => {
  return names[Math.floor(Math.random() * names.length)];
};
interface Comment {
  id: number;
  user: string;
  text: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  image: string;
  media: {
    secure_url: string;
  };
  upvotes: number;
  comments: Comment[];
  username: string;
  tags: string[];
}

interface PostDetailsProps {
  post: Post;
  onClose: () => void;
}

const API_URL = "http://10.10.119.145:8000";

const PostDetails: React.FC<PostDetailsProps> = ({ post, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [upvotes, setUpvotes] = useState<number>(post.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);

  const scrollY = new Animated.Value(0);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/comment/${post._id}`);
      console.log("Fetched Comments:", response.data.data);
      setComments(response.data.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      Alert.alert("Error", "Failed to load comments.");
    }
  };

  const addComment = async () => {
    if (newComment.trim() === "") return;

    try {
      const userId = await AsyncStorage.getItem("userid");
      if (!userId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }

      const response = await axios.post(`${API_URL}/comment/post/create`, {
        postId: post._id,
        content: newComment,
        userId,
      });

      const newCommentObj: Comment = {
        id: response.data.id, 
        user: "You", 
        text: newComment,
      };

      setComments((prev) => [...prev, newCommentObj]); 
      setNewComment("");

      fetchComments(); // Refresh comments from API
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Error", "Failed to add comment.");
    }
  };

  const handleToggleUpvote = () => {
    setUpvotes((prev) => (hasUpvoted ? prev - 1 : prev + 1));
    setHasUpvoted(!hasUpvoted);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Animated.ScrollView
            style={styles.scrollContainer}
            scrollEventThrottle={16}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
              useNativeDriver: false,
            })}
          >
            {post.media.secure_url && (
              <Animated.Image
                source={{ uri: post.media.secure_url }}
                style={[
                  styles.image,
                  {
                    transform: [
                      {
                        scale: scrollY.interpolate({
                          inputRange: [-250, 0, 250],
                          outputRange: [1.2, 1, 0.8],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}

            <View style={styles.details}>
              <Text style={styles.username}>@{post.username}</Text>

              <View style={styles.tagsContainer}>
                {post.tags.map((tag, index) => (
                  <Text key={index} style={styles.tags}>
                    {tag}
                  </Text>
                ))}
              </View>

              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.content}>{post.content}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={handleToggleUpvote}>
                <Text style={[styles.upvote, hasUpvoted && styles.upvoted]}>👍 {upvotes}</Text>
              </TouchableOpacity>
              <Text style={styles.commentCount}>💬 {comments.length}</Text>
            </View>

            {/* Comments Section */}
            <View style={styles.commentSection}>
              <ScrollView>
                {comments.map((item) => (
                  <View key={item.id} style={styles.comment}>
                    <Text style={styles.commentUser}>@{getRandomName()}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </Animated.ScrollView>

          {/* Add Comment Section */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.commentButton} onPress={addComment}>
              <Text style={styles.commentButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "95%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    zIndex: 10,
  },
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 15,
  },
  details: {
    alignItems: "center",
    marginVertical: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  tags: {
    fontSize: 14,
    backgroundColor: "#007AFF",
    color: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
  content: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    marginBottom: 15,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  upvote: {
    fontSize: 18,
    color: "#007AFF",
  },
  upvoted: {
    color: "#FF4500",
  },
  commentCount: {
    fontSize: 18,
    color: "#007AFF",
  },
  commentSection: {
    flex: 1,
    width: "100%",
    marginBottom: 10,
  },
  comment: {
    width: "100%",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "bold",
  },
  commentText: {
    fontSize: 14,
    color: "#555",
  },
  commentInputContainer: {
    flexDirection: "row",
    width: "100%",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  commentButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default PostDetails;
