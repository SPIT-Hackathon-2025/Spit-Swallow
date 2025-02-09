import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState('');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log(permissionResult);
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    console.log(result);
    
    if (!result.canceled) {
        console.log(result.assets[0].uri);
        
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ alignItems: "center", marginTop: 20 }}>
      <TouchableOpacity onPress={pickImage} style={{ padding: 10, backgroundColor: "#007AFF", borderRadius: 5 }}>
        <Text style={{ color: "#fff" }}>Pick Image</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={{ width: 100, height: 100, borderRadius: 50, marginTop: 10 }} />
      )}
    </View>
  );
};

export default ImageUploader;
