import React, { useState } from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = () => {
  // Sample user data
  const [user, setUser] = useState({
    name: "Krrish Nichanii",
    email: "krrish@gmail.com",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    stardust: 25,
    badges: 4,
    adventureLevel: 10,
    nextLevelXp: 750,
    currentXp: 500,
    posts: [
      { id: "1", title: "First Adventure!", likes: 120, date: "Feb 5, 2024", location: "Bandra Fort" },
      { id: "2", title: "Hiking at Andheri", likes: 200, date: "Jan 22, 2024", location: "Andheri Hills" },
      { id: "3", title: "Discovered a New Café", likes: 95, date: "Jan 10, 2024", location: "Colaba" },
    ],
  });

  const xpProgress = (user.currentXp / user.nextLevelXp) * 100;

  const [modalVisible, setModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedEmail, setEditedEmail] = useState(user.email);
  const [editedProfileImage, setEditedProfileImage] = useState(user.profileImage);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.canceled) {
        setEditedProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image: ", error);
    }
  };
  
  const saveProfile = () => {
    setUser({ ...user, name: editedName, email: editedEmail, profileImage: editedProfileImage });
    setModalVisible(false);
  };


  return (
    <View style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        <Text style={styles.verifiedTag}>✔ Verified</Text>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          {/* Adventure Level Progress */}
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>🏆 Adventure Level: {user.adventureLevel}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.xpText}>{user.currentXp} / {user.nextLevelXp} XP</Text>
          </View>

          {/* Stardust & Badges */}
          <View style={styles.statsContainer}>
            <Text style={styles.stat}>✨ {user.stardust} Stardust</Text>
            
          </View>
          <View style={styles.statsContainer}>
          <Text style={styles.stat}>🎖️ {user.badges} Badges</Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="pencil" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Post History Section */}
      <Text style={styles.historyTitle}>📜 Adventure Log</Text>
      <FlatList
        data={user.posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postDetails}>
              📍 {item.location}  |  ❤️ {item.likes} Likes  |  📅 {item.date}
            </Text>
          </View>
        )}
      />
        <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
                    <Text style={styles.imagePickerText}>Choose Image</Text>
                    </TouchableOpacity>
                    <TextInput style={styles.input} value={editedName} onChangeText={setEditedName} placeholder="Name" />
                    <TextInput style={styles.input} value={editedEmail} onChangeText={setEditedEmail} placeholder="Email" keyboardType="email-address" />
                    <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                    <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },

  /* Profile Section */
  profileContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "white",
    padding: 25, 
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    marginBottom: 20,
    position: "relative",
  },
  verifiedTag: {
    position: "absolute",
    bottom: 30,
    left: 40,
    backgroundColor: "green",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: "bold",
  },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginRight: 20, },
  userInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: "bold", color: "#333" },
  email: { fontSize: 14, color: "gray", marginBottom: 5 },

  /* Level Progress */
  levelContainer: { marginTop: 5, marginBottom: 10 },
  levelText: { fontSize: 16, fontWeight: "bold", color: "#FF9800" },
  progressBarContainer: {
    height: 8,
    width: "100%",
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 5,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FF9800",
  },
  xpText: { fontSize: 12, color: "#777" },

  /* Stats */
  statsContainer: { flexDirection: "row", gap: 20, marginTop: 5 },
  stat: { fontSize: 14, fontWeight: "bold", color: "#555" },

  /* Edit Profile Button */
  editButton: { 
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#FF9800",
    padding: 8,
    borderRadius: 15,
    elevation: 3,
  },

  /* Post History */
  historyTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#333" },
  postCard: { 
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  postTitle: { fontSize: 16, fontWeight: "bold", color: "#222" },
  postDetails: { fontSize: 14, color: "#555", marginTop: 5 },

  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 10 },
  saveButton: { backgroundColor: "#FF9800", padding: 10, borderRadius: 5, width: "100%", alignItems: "center" },
  saveButtonText: { color: "white", fontWeight: "bold" },
  cancelButton: { marginTop: 10 },
  cancelButtonText: { color: "red" },

  imagePickerButton: { backgroundColor: "#FF9800", padding: 10, borderRadius: 5, marginBottom: 10 },
  imagePickerText: { color: "white", fontWeight: "bold", textAlign: "center" },
});

export default ProfileScreen;
