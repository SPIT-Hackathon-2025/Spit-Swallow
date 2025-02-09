import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import Signup from "../../components/Signup";
import Ionicons from "react-native-vector-icons/Ionicons"; // Import bell icon


type Activity = {
  id: number;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  description: string;
};

const activitiesNearAndheri: Activity[] = [
  { id: 1, name: "Hiking", type: "adventure", latitude: 19.1195, longitude: 72.8466, description: "A scenic hiking trail with a great view of the city." },
  { id: 2, name: "Roadblock", type: "issue", latitude: 19.1195, longitude: 72.8496, description: "A roadblock due to ongoing construction. Avoid this route." },
  { id: 10, name: "Jogging Track", type: "adventure", latitude: 19.1238, longitude: 72.8365, description: "A well-maintained jogging track in a peaceful environment." },
  { id: 11, name: "Local Market", type: "leisure", latitude: 19.1245, longitude: 72.8370, description: "A bustling local market with fresh produce and street food." },
  { id: 12, name: "Pothole Alert", type: "issue", latitude: 19.1240, longitude: 72.8358, description: "A large pothole reported. Drive carefully in this area." },
  { id: 9, name: "Traffic Congestion", type: "issue", latitude: 19.1231, longitude: 72.8359, description: "Heavy traffic congestion reported during peak hours." },
];

const LandingPage = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 19.1196,
    longitude: 72.8465,
    latitudeDelta: 0.01,
    longitudeDelta: 0.05,
  });

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [verificationImage, setVerificationImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const mapRef = useRef<MapView>(null);

  // Fetch User ID from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userid");
        if (storedUserId) setUserId(storedUserId);
        // console.log("User ID:", storedUserId);
      } catch (error) {
        console.error("Error fetching userId:", error);
      }
    };
    fetchUserId();
  }, []);

  // Get User Location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  // Move Map to User Location
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateCamera({
        center: { latitude: userLocation.latitude, longitude: userLocation.longitude },
        pitch: 60,
        heading: 30,
        zoom: 18,
      });
    }
  }, [userLocation]);

  // Open Image Picker
  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: "photo", quality: 1 });
      if (result.didCancel) return;
      if (result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        if (fileUri) {
          setVerificationImage({
            uri: fileUri,
            name: `verification_${Date.now()}.jpg`,
            type: "image/jpeg",
          });
        }
      }
    } catch (error) {
      console.log("Error picking image:", error);
    }
  };

  // Check if the user is within 50 meters of an activity
  const isWithin50m = (activity: { latitude: number; longitude: number }) => {
    if (!userLocation) return false;
    const distance = Math.sqrt(
      Math.pow(activity.latitude - userLocation.latitude, 2) +
      Math.pow(activity.longitude - userLocation.longitude, 2)
    ) * 111139; // Convert degrees to meters
    return distance <= 50;
  };

  if (userId === null) {
    return <Signup />;
  }

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} provider={PROVIDER_GOOGLE} region={mapRegion}>
        {activitiesNearAndheri.map((activity) => (
          <Marker
            key={activity.id}
            coordinate={{ latitude: activity.latitude, longitude: activity.longitude }}
            title={activity.name}
            pinColor={activity.type === "adventure" ? "green" : activity.type === "issue" ? "red" : "blue"}
            onPress={() => {
              setSelectedActivity(activity);
              setModalVisible(true);
            }}
          />
        ))}

        {userLocation && (
          <>
            <Marker coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }} title="You are here" pinColor="gold" />
            <Circle center={{ latitude: userLocation.latitude, longitude: userLocation.longitude }} radius={50} strokeWidth={1} strokeColor="rgba(0, 128, 255, 0.5)" fillColor="rgba(0, 128, 255, 0.2)" />
          </>
        )}
      </MapView>

      <TouchableOpacity style={styles.notificationButton} onPress={() => alert("No new notifications!")}>
        <Ionicons name="notifications-outline" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for Activity Details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedActivity && (
              <>
                <Text style={styles.modalTitle}>{selectedActivity.name}</Text>
                <Text>Type: {selectedActivity.type}</Text>
                <Text>Description: {selectedActivity.description}</Text>

                {isWithin50m(selectedActivity) && (
                  <>
                    <TouchableOpacity style={styles.verifyButton} onPress={pickImage}>
                      <Text style={styles.verifyButtonText}>Verify Issue</Text>
                    </TouchableOpacity>
                    {verificationImage && <Image source={{ uri: verificationImage.uri }} style={styles.uploadedImage} />}
                  </>
                )}

                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 320, backgroundColor: "white", padding: 20, borderRadius: 12, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  closeButton: { marginTop: 15, padding: 10, backgroundColor: "red", borderRadius: 10, width: "80%", alignItems: "center" },
  closeButtonText: { color: "white", fontWeight: "bold" },
  verifyButton: { marginTop: 15, padding: 10, backgroundColor: "green", borderRadius: 10, width: "80%", alignItems: "center" },
  verifyButtonText: { color: "white", fontWeight: "bold" },
  uploadedImage: { marginTop: 10, width: 200, height: 150, borderRadius: 10 },
  notificationButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  }
});

export default LandingPage;
