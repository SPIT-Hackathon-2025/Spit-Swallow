import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";

interface Spot {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  popularity: number;
}

const spots: Spot[] = [
  { id: 1, name: "Marine Drive", description: "Scenic seaside promenade.", latitude: 18.943, longitude: 72.823, popularity: 4.8 },
  { id: 2, name: "Gateway of India", description: "Historic arch monument.", latitude: 18.922, longitude: 72.834, popularity: 4.7 },
  { id: 3, name: "Sanjay Gandhi National Park", description: "Expansive green space with wildlife.", latitude: 19.228, longitude: 72.869, popularity: 4.5 },
  { id: 4, name: "Juhu Beach", description: "Popular beach known for street food.", latitude: 19.0988, longitude: 72.8267, popularity: 4.4 },
  { id: 5, name: "Haji Ali Dargah", description: "Iconic mosque located on an islet.", latitude: 18.9823, longitude: 72.808, popularity: 4.6 },
  { id: 6, name: "Chhatrapati Shivaji Maharaj Terminus", description: "Historic railway station with Victorian Gothic architecture.", latitude: 18.9402, longitude: 72.8355, popularity: 4.7 },
  { id: 7, name: "Elephanta Caves", description: "UNESCO World Heritage site with rock-cut sculptures.", latitude: 18.9633, longitude: 72.9316, popularity: 4.5 },
  { id: 8, name: "Bandra-Worli Sea Link", description: "Cable-stayed bridge offering panoramic sea views.", latitude: 19.0176, longitude: 72.817, popularity: 4.6 },
  { id: 9, name: "Colaba Causeway", description: "Bustling street market with diverse shopping options.", latitude: 18.9218, longitude: 72.8328, popularity: 4.3 },
  { id: 10, name: "Hanging Gardens", description: "Terraced gardens with topiary and sunset views.", latitude: 18.954, longitude: 72.8025, popularity: 4.4 },
];


const AdventurePlanner: React.FC = () => {
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ id: number; text: string; sender: "user" | "bot" }[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sortedSpots, setSortedSpots] = useState<Spot[]>(spots);
  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required to sort by distance.");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortSpots = (criteria: "popularity" | "distance") => {
    if (criteria === "popularity") {
      setSortedSpots([...spots].sort((a, b) => b.popularity - a.popularity));
    } else if (criteria === "distance" && userLocation) {
      const updatedSpots = spots.map(spot => ({
        ...spot,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, spot.latitude, spot.longitude),
      }));
      setSortedSpots([...updatedSpots].sort((a, b) => (a.distance || 0) - (b.distance || 0)));
    }
  };

  const getResponseFromAI = async (question: string) => {
    try {
      const response = await axios.post("http://10.10.119.145:8000/ai/ask", { question });
      return response.data;
    } catch (error) {
      console.error("AI API Error:", error);
      return "Sorry, I couldn't process that.";
    }
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  const openDirections = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
    Linking.openURL(url);
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() === "") return;

    const newUserMessage: { id: number; text: string; sender: "user" | "bot" } = { id: chatMessages.length + 1, text: messageInput, sender: "user" };
    setChatMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setMessageInput("");
    const botResponse = await getResponseFromAI(messageInput);
    const newBotMessage: { id: number; text: string; sender: "user" | "bot" } = { id: chatMessages.length + 2, text: botResponse, sender: "bot" };
    setChatMessages((prevMessages) => [...prevMessages, newBotMessage]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sortButtonsContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={() => sortSpots("popularity")}>
          <Text style={styles.sortButtonText}>Sort by Popularity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => sortSpots("distance")}>
          <Text style={styles.sortButtonText}>Sort by Distance</Text>
        </TouchableOpacity>
      </View>


      <FlatList
  data={sortedSpots}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTextContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
      <TouchableOpacity onPress={() => openDirections(item.latitude, item.longitude)} style={styles.mapButton}>
        <Icon name="map" size={30} color="blue" />
      </TouchableOpacity>
    </View>
  )}
/>


      <TouchableOpacity style={styles.chatbotButton} onPress={() => setChatbotVisible(true)}>
        <Icon name="comment" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={chatbotVisible} animationType="slide" transparent>
        <View style={styles.chatbotModal}>
          <View style={styles.chatbotContainer}>
            <Text style={styles.chatbotTitle}>Chat with AdventureBot</Text>
            <ScrollView ref={scrollViewRef} style={styles.chatMessages} contentContainerStyle={styles.scrollView}>
              {chatMessages.map((msg) => (
                <View key={msg.id} style={[styles.chatBubble, msg.sender === "user" ? styles.userMessage : styles.botMessage]}>
                  <Text style={msg.sender === "user" ? styles.userText : styles.botText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputContainer}>
              <TextInput style={styles.chatInput} placeholder="Type a message..." value={messageInput} onChangeText={setMessageInput} multiline />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setChatbotVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  card: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "white", padding: 15, marginVertical: 5, borderRadius: 10 },
  cardTextContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: "bold" },
  description: { fontSize: 14, color: "gray" },
  mapIcon: { marginLeft: 10 },
  chatbotButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#007AFF", padding: 15, borderRadius: 50 },
  chatbotModal: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  chatbotContainer: { width: "90%", backgroundColor: "white", borderRadius: 10, padding: 15 },
  chatbotTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  chatMessages: { maxHeight: 300 },
  scrollView: { paddingVertical: 10 },
  chatBubble: { padding: 10, borderRadius: 10, marginVertical: 5 },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#007AFF" },
  botMessage: { alignSelf: "flex-start", backgroundColor: "#E5E5EA" },
  userText: { color: "white" },
  botText: { color: "black" },
  chatInputContainer: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, padding: 10 },
  chatInput: { flex: 1, backgroundColor: "#F5F5F5", padding: 10, borderRadius: 8 },
  sendButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 8 },
  sendButtonText: { color: "white" },
  closeButton: { backgroundColor: "red", padding: 10, marginTop: 10, borderRadius: 8, alignItems: "center" },
  closeButtonText: { color: "white", fontWeight: "bold" },
  sortButtonsContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sortButton: { backgroundColor: "#007AFF", padding: 10, borderRadius: 5 },
  sortButtonText: { color: "white", fontWeight: "bold" },
  mapButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
});

export default AdventurePlanner;
