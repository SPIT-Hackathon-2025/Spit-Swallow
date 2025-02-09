import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

// ✅ Replace with your backend API URL
const BACKEND_URL = "https://your-backend.com/api/upload"; 

interface CameraAppProps {
  onImageUpload: (url: string) => void; 
}

const CameraApp: React.FC<CameraAppProps> = ({ onImageUpload }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to take pictures.");
      }
    })();
  }, []);

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setCapturedImage(imageUri);
      uploadImage(imageUri);
    }
  };

  const uploadImage = async (imageUri: string) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg", // Change according to image type
        name: "image.jpg",
      } as any);

      const response = await axios.post(BACKEND_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload Successful:", response.data);
      Alert.alert("Upload Successful!", "Image has been uploaded.");
      onImageUpload(response.data.imageUrl); // ✅ Adjust based on backend response

    } catch (error: any) {
      console.error("Upload Error:", error.response ? error.response.data : error);
      Alert.alert("Upload Failed", "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openCamera} style={styles.button}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>

      {uploading && <ActivityIndicator size="large" color="blue" style={{ marginTop: 10 }} />}

      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.image} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 20 },
  button: { padding: 10, backgroundColor: "#007AFF", borderRadius: 5 },
  buttonText: { color: "#fff", fontSize: 16 },
  image: { width: 200, height: 200, borderRadius: 10, marginTop: 20 },
});

export default CameraApp;
