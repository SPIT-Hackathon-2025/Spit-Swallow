import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import PostDetails from "../../components/Postdetails";
import axios from "axios";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

// ✅ Replace with your actual backend API URL
const API_URL = "http://10.10.119.145:8000";

interface Post {
  _id: string;
  title: string;
  content: string;
  image: string;
  media: {
    secure_url: string;
  };
  upvotes: number;
  comments: { id: number; user: string; text: string }[];
  username: string;
  tags: string[];
}

const LiveIssues: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [issues, setIssues] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    criticality: "",
  });
  const formData = new FormData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/post`);
        setIssues(response.data.data);
        // console.log(response.data.data);
      } catch (err) {
        setError("Failed to fetch issues.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      
    }
  };

  const addPost = async () => {
    if (!newPost.title || !newPost.content || newPost.tags.length === 0) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userid");
      if (!userId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }
      // formData.append("title", newPost.title);
      // formData.append("content", newPost.content);
      // if(newPost.tags.length > 0 ) formData.append("tags", newPost.tags[0]);
      // else formData.append("tags", "");
      // formData.append("userId", userId);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Error", "Location permission denied.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // const postData = new FormData();
      formData.append("title", newPost.title);
      formData.append("content", newPost.content);
      formData.append("tags", JSON.stringify(newPost.tags));
      formData.append("criticality", newPost.criticality);
      formData.append("userId", userId);
      formData.append("community", "Test");
      // formData.append("latitude", latitude);
      // formData.append("longitude", longitude);

      // if (capturedImage) {
      //   const resource = await fetch(capturedImage);
      //   formData.append("media", {
      //     uri: file.uri,
      //     name: file.fileName || "image.jpg",
      //     type: file.mimeType || "image/jpeg",
      //   });
      // }
      // console.log(formData);
      

      const response = await axios.post(`${API_URL}/post/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log(response);
      
      setIssues([response.data, ...issues]);
      setModalVisible(false);
      setNewPost({ title: "", content: "", tags: [], criticality: "" });
      setCapturedImage(null);
    } catch (err) {
      Alert.alert("Error", "Failed to create post.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Issues</Text>
      <FlatList
        data={issues}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedPost(item)}
          >
            <View style={styles.header}>
              <Text style={styles.username}>@{item.username}</Text>
              <Text style={styles.tags}>{item.tags.join(", ")}</Text>
            </View>
            <Text style={styles.issueTitle}>{item.title}</Text>
            <Text style={styles.issueText} numberOfLines={2}>
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
      />
      {selectedPost && (
        <PostDetails
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Issue</Text>
            <TextInput
              placeholder="Title"
              style={styles.input}
              value={newPost.title}
              onChangeText={(text) => setNewPost({ ...newPost, title: text })}
            />
            <TextInput
              placeholder="Description"
              style={styles.input}
              value={newPost.content}
              onChangeText={(text) => setNewPost({ ...newPost, content: text })}
            />
            <TextInput
              placeholder="Criticality"
              style={styles.input}
              value={newPost.criticality}
              onChangeText={(text) =>
                setNewPost({ ...newPost, criticality: text })
              }
            />
            <TextInput
              placeholder="Tags (Comma Separated)"
              style={styles.input}
              value={newPost.tags.join(", ")}
              onChangeText={(text) =>
                setNewPost({ ...newPost, tags: text.split(", ") })
              }
            />

            <TouchableOpacity onPress={openCamera} style={styles.button}>
              <Text style={styles.buttonText}>Capture Image</Text>
            </TouchableOpacity>

            {capturedImage && (
              <Image source={{ uri: capturedImage }} style={styles.image} />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.button} onPress={addPost}>
                <Text style={styles.buttonText}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LiveIssues;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  card: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  username: { fontSize: 14, fontWeight: "bold", color: "#555" },
  tags: {
    fontSize: 12,
    backgroundColor: "#007AFF",
    color: "#fff",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  issueTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  issueText: { fontSize: 14, color: "#333" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: { backgroundColor: "#007AFF", padding: 10, borderRadius: 5 },
  buttonCancel: { backgroundColor: "#ccc", padding: 10, borderRadius: 5 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  image: { width: 200, height: 200, borderRadius: 10, marginTop: 20 },
});