import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Button,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

interface Comment {
  id: string;
  text: string;
  author: string;
}

interface Post {
  id: string;
  postType: string;
  subType: string;
  text: string;
  image?: string;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  author: string;
  locality: string;
  views: number;
  community: string;
}

const communities = [
  { id: "1", name: "Railways", color: "#FF4500", icon: "🚆" },
  { id: "2", name: "Water Supply", color: "#007AFF", icon: "💧" },
  { id: "4", name: "Road Safety", color: "#8A2BE2", icon: "🚦" },
  { id: "5", name: "Electricity", color: "#FFD700", icon: "⚡" },
];

const CommunityHub: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newPostText, setNewPostText] = useState<string>("");
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(
    null
  );

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = selectedCommunity
    ? posts.filter((post) => post.community === selectedCommunity)
    : posts;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setNewPostImage(result.assets[0].uri);
    }
  };

  const handleNewPost = () => {
    if (!newPostText || !selectedCommunity) return;
    const newPost: Post = {
      id: (posts.length + 1).toString(),
      postType: "Announcement",
      subType: "General",
      text: newPostText,
      image: newPostImage || undefined,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      author: "NewUser",
      locality: "City Center",
      views: 0,
      community: selectedCommunity,
    };
    setPosts([newPost, ...posts]);
    setNewPostText("");
    setNewPostImage(null);
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>Community Hub</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for communities..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Community List - Styled like subreddit cards */}
      <FlatList
        data={filteredCommunities}
        numColumns={2}
        columnWrapperStyle={styles.communityGrid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.communityCard, { borderColor: item.color }]}
            onPress={() => setSelectedCommunity(item.name)}
          >
            <Text style={styles.communityIcon}>{item.icon}</Text>
            <Text style={styles.communityText}>r/{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* New Post Section */}
      {selectedCommunity && (
        <View style={styles.newPostContainer}>
          <Text style={styles.communityText}>Posting in r/{selectedCommunity}</Text>
          <TextInput
            style={styles.newPostInput}
            placeholder="Write a new post..."
            value={newPostText}
            onChangeText={setNewPostText}
          />
          {/* <Button title="Choose Image" onPress={pickImage} /> */}
          {newPostImage && (
            <Image source={{ uri: newPostImage }} style={styles.previewImage} />
          )}
          <Button title="Post" onPress={handleNewPost} />
        </View>
      )}

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <Text style={styles.username}>@{item.author}</Text>
              <Text style={styles.flair}>{item.postType}</Text>
              <Text style={styles.communityTag}>r/{item.community}</Text>
            </View>
            <Text style={styles.issueTitle}>{item.text}</Text>
            {item.image && (
              <TouchableOpacity
                onPress={() => item.image && setSelectedImage(item.image)}
              >
                <Image source={{ uri: item.image }} style={styles.resizedPostImage} />
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Modal for Image Preview */}
      <Modal visible={!!selectedImage} transparent>
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.modalImage} />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8", padding: 10 },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1DA1F2",
  },
  navTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 35,
    flex: 1,
    marginLeft: 10,
  },

  communityGrid: { justifyContent: "space-between", marginTop: 10 },
  communityCard: {
    flex: 1,
    padding: 20,
    margin: 10,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  communityIcon: { fontSize: 32, marginBottom: 10 },
  communityText: { fontSize: 16, fontWeight: "bold", color: "#333" },

  postCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  username: { fontSize: 14, fontWeight: "bold", color: "#555" },
  flair: { fontSize: 12, fontWeight: "bold", color: "#fff", backgroundColor: "#007AFF", padding: 5, borderRadius: 5 },
  communityTag: { fontSize: 12, fontWeight: "bold", color: "#555" },
  issueTitle: { fontSize: 16, fontWeight: "bold" },
  resizedPostImage: { width: 100, height: 100, borderRadius: 8 },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  newPostContainer: { backgroundColor: "#fff", padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  newPostInput: { backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#ddd" },
  previewImage: { width: 100, height: 100, borderRadius: 8, marginBottom: 10 },
  modalImage: { width: 300, height: 300, borderRadius: 8 },
});

export default CommunityHub;