import React, { useState, useEffect, useCallback } from "react";
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
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import * as Linking from "expo-linking";
import Icon from 'react-native-vector-icons/FontAwesome';


interface Spot {
 id: number;
 name: string;
 latitude: number;
 longitude: number;
 rating: number | null;
 ratingsCount: number;
 visits: number;
 points: number;
 distance?: number;
 totalScore?: number;
}


interface Event {
 id: number;
 spotId: number;
 name: string;
 date: string;
 time: string;
 organizer: string;
 attendees: number;
}


const initialSpots: Spot[] = [
  { id: 1, name: "Marine Drive Viewpoint", latitude: 18.943, longitude: 72.823, rating: null, ratingsCount: 0, visits: 0, points: 0 },
  { id: 2, name: "Gateway of India", latitude: 18.922, longitude: 72.834, rating: null, ratingsCount: 0, visits: 0, points: 0 },
  { id: 3, name: "Sanjay Gandhi National Park", latitude: 19.228, longitude: 72.869, rating: null, ratingsCount: 0, visits: 0, points: 0 },
];


const AdventurePlanner: React.FC = () => {
 const [communitySpots, setCommunitySpots] = useState<Spot[]>(initialSpots);
 const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
 const [eventModalVisible, setEventModalVisible] = useState(false);
 const [eventDetailsModalVisible, setEventDetailsModalVisible] = useState(false);
 const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
 const [eventName, setEventName] = useState("");
 const [eventDate, setEventDate] = useState("");
 const [eventTime, setEventTime] = useState("");
 const [organizer, setOrganizer] = useState("");
 const [attendeeCount, setAttendeeCount] = useState("");
 const [events, setEvents] = useState<Event[]>([]);
 const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
 const [sortedSpots, setSortedSpots] = useState<Spot[]>([]);


 useEffect(() => {
 const getLoc = async () => {
 try {
 let { status } = await Location.requestForegroundPermissionsAsync();
 if (status !== "granted") {
 Alert.alert("Location Error", "Location permission denied.");
 return;
 }
 let locationData = await Location.getCurrentPositionAsync({});
 setLocation(locationData.coords);
 } catch (error) {
 console.error("Error getting location:", error);
 Alert.alert("Location Error", "Unable to fetch your location.");
 setLocation(null);
 }
 };


 getLoc();
 }, []);


 const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
 const R = 6371;
 const dLat = deg2rad(lat2 - lat1);
 const dLon = deg2rad(lon2 - lon1);
 const a =
 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
 Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
 Math.sin(dLon / 2) * Math.sin(dLon / 2);
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 const distance = R * c;
 return distance;
 }, []);


 const deg2rad = (deg: number) => {
 return deg * (Math.PI / 180)
 };


 useEffect(() => {
 if (location) {
 const DISTANCE_WEIGHT = -0.4;
 const RATING_WEIGHT = 0.3;
 const VISITS_WEIGHT = 0.3;


 const scoredSpots = communitySpots.map(spot => {
 const distance = calculateDistance(location.latitude, location.longitude, spot.latitude, spot.longitude);
 const distanceScore = distance * DISTANCE_WEIGHT;
 const ratingScore = (spot.rating || 0) * RATING_WEIGHT;
 const visitsScore = (spot.visits / 1000) * VISITS_WEIGHT;
 const totalScore = distanceScore + ratingScore + visitsScore;


 return { ...spot, distance, totalScore };
 });


 scoredSpots.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
 setSortedSpots(scoredSpots);
 }
 }, [communitySpots, location, calculateDistance]);


 const openDirections = (latitude: number, longitude: number) => {
 if (location) {
 const url = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude},${location.longitude}&destination=${latitude},${longitude}&travelmode=walking`;
 Linking.openURL(url).catch((err) => console.error("An error occurred", err));
 } else {
 Alert.alert('Location not available');
 }
 };


 const renderSpotItem = ({ item }: { item: Spot }) => (
 <TouchableOpacity key={item.id} style={styles.spotCard} onPress={() => setSelectedSpot(item)}>
 <Text style={styles.spotName}>{item.name}</Text>
 <View style={styles.infoContainer}>
 {item.rating !== null ? (
 <View style={styles.ratingContainer}>
 <Icon name="star" size={16} color="#FFC107" />
 <Text style={styles.ratingText}>{item.rating} ({item.ratingsCount} ratings)</Text>
 </View>
 ) : (
 <Text style={styles.noRatingText}>No ratings yet</Text>
 )}
 <Text style={styles.visitsText}>Visits: {item.visits}</Text>
 <Text style={styles.pointsText}>Points: +{item.points}</Text>
 {location && item.distance !== undefined && <Text style={styles.distanceText}>Distance: {item.distance.toFixed(2)} km</Text>}
 <TouchableOpacity style={styles.directionsButton} onPress={() => openDirections(item.latitude, item.longitude)}>
 <Text style={styles.directionsButtonText}>Directions</Text>
 </TouchableOpacity>
 </View>
 </TouchableOpacity>
 );


 const renderMap = () => {
 if (!location) {
 return <Text>Loading map...</Text>;
 }
 return (
 <MapView
 style={styles.map}
 initialRegion={{
 latitude: location.latitude,
 longitude: location.longitude,
 latitudeDelta: 0.15,
 longitudeDelta: 0.15,
 }}
 >
 {communitySpots.map((spot) => (
 <Marker
 key={spot.id}
 coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
 title={spot.name}
 />
 ))}
 {events.map((event) => {
 const spot = communitySpots.find((s) => s.id === event.spotId);
 return (
 spot && (
 <Marker
 key={event.id}
 coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
 title={event.name}
 pinColor="red"
 onPress={() => {
 setSelectedEvent(event);
 setEventDetailsModalVisible(true);
 }}
 />
 )
 );
 })}
 <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title="Your Location" pinColor="blue" />
 </MapView>
 );
 };


 const createEvent = () => {
 if (!eventName || !eventDate || !eventTime || !organizer || !attendeeCount) {
 Alert.alert("All fields are required!");
 return;
 }


 if (selectedSpot) {
 const newEvent: Event = {
 id: events.length + 1,
 spotId: selectedSpot.id,
 name: eventName,
 date: eventDate,
 time: eventTime,
 organizer,
 attendees: parseInt(attendeeCount, 10),
 };
 setEvents([...events, newEvent]);
 setEventName("");
 setEventDate("");
 setEventTime("");
 setOrganizer("");
 setAttendeeCount("");
 setEventModalVisible(false);
 }
 };


 return (
 <View style={styles.container}>
 {/* Map Section */}
 <View style={styles.mapContainer}>
 {renderMap()}
 </View>


      {/* Scrollable List */}
      <ScrollView style={styles.listContainer}>
        {communitySpots.map((item) => (
          <TouchableOpacity key={item.id} style={styles.spotItem} onPress={() => setSelectedSpot(item)}>
            <Text style={styles.spotText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Event Creation Modal */}
      <Modal visible={eventModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>Create Event at {selectedSpot?.name}</Text>
            <TextInput style={styles.input} placeholder="Event Name" value={eventName} onChangeText={setEventName} />
            <TextInput style={styles.input} placeholder="Date" value={eventDate} onChangeText={setEventDate} />
            <TextInput style={styles.input} placeholder="Time" value={eventTime} onChangeText={setEventTime} />
            <TextInput style={styles.input} placeholder="Organizer" value={organizer} onChangeText={setOrganizer} />
            <TextInput style={styles.input} placeholder="Attendee Count" value={attendeeCount} onChangeText={setAttendeeCount} keyboardType="numeric" />
            <TouchableOpacity style={styles.eventButton} onPress={createEvent}>
              <Text style={styles.eventButtonText}>Add Event</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setEventModalVisible(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Event Details Modal */}
      <Modal visible={eventDetailsModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContentLarge}>
            {selectedEvent && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.name}</Text>
                <Text>Date: {selectedEvent.date}</Text>
                <Text>Time: {selectedEvent.time}</Text>
                <Text>Organizer: {selectedEvent.organizer}</Text>
                <Text>Attendees: {selectedEvent.attendees}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setEventDetailsModalVisible(false)}>
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
  mapContainer: { height: "65%", width: "100%" },
  map: { flex: 1 },
  listContainer: { flex: 1, backgroundColor: "#f9f9f9", paddingHorizontal: 10, paddingVertical: 5 },
  spotItem: { padding: 15, backgroundColor: "white", borderRadius: 8, marginBottom: 10, elevation: 3 },
  spotCard: { padding: 15, backgroundColor: "white", borderRadius: 8, marginBottom: 10, elevation: 3 },
  spotText: { fontSize: 16, fontWeight: "bold" },
  spotName: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  infoContainer: { marginTop: 10 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContentLarge: { width: 350, backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  closeButton: { marginTop: 10, padding: 10, backgroundColor: "red", borderRadius: 10, alignItems: "center" },
  eventButton: { marginTop: 10, padding: 10, backgroundColor: "green", borderRadius: 10, alignItems: "center" },
  closeButtonText: { color: "white", fontWeight: "bold" },
  eventButtonText: { color: "white", fontWeight: "bold" },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10 },
  noRatingText: { color: "gray", fontStyle: "italic" },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  visitsText: { fontSize: 14, color: "black" },
  pointsText: { fontSize: 14, color: "black" },
  distanceText: { fontSize: 14, color: "black" },
  ratingText: { fontSize: 14, color: "black" },
  directionsButton: { marginTop: 10, padding: 10, backgroundColor: "blue", borderRadius: 10, alignItems: "center" },
  directionsButtonText: { color: "white", fontWeight: "bold" },
});


export default AdventurePlanner;


