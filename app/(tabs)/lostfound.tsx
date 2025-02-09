import React, { useState, useCallback, useEffect } from 'react';
import {
 StyleSheet,
 Text,
 View,
 ScrollView,
 TouchableOpacity,
 TextInput,
 Image,
 Button,
 Alert,
 FlatList,
 Modal,
 Animated,
 Easing,
} from 'react-native';
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';


interface LostItem {
 id: string;
 username: string;
 flair: string;
 title: string;
 description: string;
 imageUri: string | null;
 location: {
 latitude: number | null;
 longitude: number | null;
 };
 landmark: string;
 replies?: { text: string; imageUri?: string | null; isHelpful?: boolean }[];
}


const defaultImage = "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSM07g6Xt1XG0pi_eUnz1zaJAjfebLdnv83tdKDE5YPhEV-88WWLZVRVeDGpGDRNUcHKMUhEZbhOXkJb7CiUCXs0Tn_2FX5i2PsUy7AKCYgXWvIo5c7UucF&usqp=CAc"


const LostFound: React.FC = () => {
 const [lostItems, setLostItems] = useState<LostItem[]>([
 {
 id: '1',
 username: 'TestUser1',
 flair: 'Lost',
 title: 'Lost Keys',
 description: 'Lost my keys near the library.',
 imageUri: defaultImage,
 location: { latitude: 34.0522, longitude: -118.2437 },
 landmark: 'Near the main entrance',
 },
 {
 id: '2',
 username: 'TestUser2',
 flair: 'Found',
 title: 'Found Phone',
 description: 'Found a phone near the coffee shop.',
 imageUri: defaultImage,
 location: { latitude: 34.0522, longitude: -118.2437 },
 landmark: 'Next to Starbucks',
 },
 {
 id: '3',
 username: 'CurrentUser',
 flair: 'Lost',
 title: 'Lost Wallet',
 description: 'Black leather wallet lost near the park.',
 imageUri: defaultImage,
 location: { latitude: null, longitude: null },
 landmark: 'Near the fountain',
 replies: [
 { text: 'I think I found something similar!', imageUri: null },
 { text: 'Is it brown?', imageUri: defaultImage },
 ],
 },
 {
 id: '4',
 username: 'CurrentUser',
 flair: 'Found',
 title: 'Found Watch',
 description: 'Silver watch found on the street.',
 imageUri: defaultImage,
 location: { latitude: null, longitude: null },
 landmark: 'Near the bus stop',
 replies: [
 { text: 'That might be my watch!', imageUri: null },
 { text: 'I lost a silver watch recently.', imageUri: defaultImage },
 ],
 },
 ]);


 const [isSubmittingFound, setIsSubmittingFound] = useState(false);
 const [isSubmittingLost, setIsSubmittingLost] = useState(false);
 const [selectedSection, setSelectedSection] = useState<'general' | 'myLost' | 'myFound'>('general');
 const [modalVisible, setModalVisible] = useState(false);
 const [animation] = useState(new Animated.Value(0)); // Initial value for animation


 const [itemNameFound, setItemNameFound] = useState('');
 const [itemImageFound, setItemImageFound] = useState<string | null>(null);
 const [locationFound, setLocationFound] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });
 const [landmarkFound, setLandmarkFound] = useState('');


 const [itemNameLost, setItemNameLost] = useState('');
 const [itemImageLost, setItemImageLost] = useState<string | null>(null);
 const [descriptionLost, setDescriptionLost] = useState('');


 const [itemsCount, setItemsCount] = useState(lostItems.length);


 // Gamification
 const [points, setPoints] = useState(0);
 const [level, setLevel] = useState('Newbie');
 const [badges, setBadges] = useState<string[]>([]);


 const levels = ['Newbie', 'Explorer', 'Investigator', 'Finder', 'Guardian'];


 // Image Picker
 const pickImage = async (setter: (imageUri: string | null) => void) => {
 let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();


 if (permissionResult.granted === false) {
 Alert.alert('Permission to access camera roll is required!');
 return;
 }


 let pickerResult = await ImagePicker.launchImageLibraryAsync({
 mediaTypes: ImagePicker.MediaTypeOptions.All,
 allowsEditing: true,
 aspect: [4, 3],
 quality: 1,
 });


 if (!pickerResult.canceled) {
 setter(pickerResult.assets[0].uri);
 }
 };


 // Get Location
 const getLocation = async () => {
 let { status } = await Location.requestForegroundPermissionsAsync();
 if (status !== 'granted') {
 Alert.alert('Permission to access location is required!');
 return;
 }


 let location = await Location.getCurrentPositionAsync({});
 setLocationFound({ latitude: location.coords.latitude, longitude: location.coords.longitude });
 };


 // Function to update user level
 const updateLevel = useCallback(() => {
 if (points >= 100 && level === 'Newbie') {
 setLevel('Explorer');
 } else if (points >= 200 && level === 'Explorer') {
 setLevel('Investigator');
 } else if (points >= 500 && level === 'Investigator') {
 setLevel('Finder');
 } else if (points >= 1000 && level === 'Finder') {
 setLevel('Guardian');
 }
 }, [points, level]);


 // Function to handle badge achievements
 const handleBadgeAchievement = useCallback((badge: string) => {
 if (!badges.includes(badge)) {
 setBadges(prevBadges => [...prevBadges, badge]);
 Alert.alert('Badge Earned!', `You earned the "${badge}" badge!`);
 }
 }, [badges]);


 useEffect(() => {
 updateLevel();
 }, [updateLevel]);


 // Function to report lost item and increase points
 const reportLostItem = useCallback(() => {
 setPoints(prevPoints => prevPoints + 5);
 }, [])


 // Function to report found item and increase points
 const reportFoundItem = useCallback(() => {
 setPoints(prevPoints => prevPoints + 10);
 }, [])


 const handleSubmitFoundItem = () => {
 if (!itemNameFound || !itemImageFound || !locationFound.latitude || !locationFound.longitude || !landmarkFound) {
 Alert.alert('Please fill in all fields');
 return;
 }


 const newItem: LostItem = {
 id: String(itemsCount + 1),
 username: 'CurrentUser', // Replace with actual user
 flair: 'Found',
 title: `Found: ${itemNameFound}`,
 description: `Found near ${landmarkFound}`,
 imageUri: itemImageFound,
 location: { latitude: locationFound.latitude, longitude: locationFound.longitude },
 landmark: landmarkFound,
 };


 setLostItems(prevItems => [...prevItems, newItem]);
 setItemsCount(itemsCount + 1);
 setItemNameFound('');
 setItemImageFound(null);
 setLocationFound({ latitude: null, longitude: null });
 setLandmarkFound('');
 setIsSubmittingFound(false);
 setModalVisible(false); // Close the modal
 reportFoundItem()
 Alert.alert('Item submitted!');
 };


 const handleSubmitLostItem = () => {
 if (!itemNameLost || !itemImageLost || !descriptionLost) {
 Alert.alert('Please fill in all fields');
 return;
 }


 const newItem: LostItem = {
 id: String(itemsCount + 1),
 username: 'CurrentUser', // Replace with actual user
 flair: 'Lost',
 title: `Lost: ${itemNameLost}`,
 description: descriptionLost,
 imageUri: itemImageLost,
 location: { latitude: null, longitude: null },
 landmark: '',
 };


 setLostItems(prevItems => [...prevItems, newItem]);
 setItemsCount(itemsCount + 1);
 setItemNameLost('');
 setItemImageLost(null);
 setDescriptionLost('');
 setIsSubmittingLost(false);
 setModalVisible(false); // Close the modal
 reportLostItem()
 Alert.alert('Item submitted!');
 };


 const openMap = (latitude: number | null, longitude: number | null) => {
 if (latitude && longitude) {
 const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
 Linking.openURL(url).catch((err) => console.error("An error occurred", err));
 } else {
 Alert.alert('Location not available');
 }
 };


 const renderItem = ({ item }: { item: LostItem }) => {
 const showInteractButton =
 selectedSection === 'general' &&
 (item.flair === 'Lost' || item.flair === 'Found');


 const showReplies =
 (selectedSection === 'myFound' && item.flair === 'Found' && item.username === 'CurrentUser') ||
 (selectedSection === 'myLost' && item.flair === 'Lost' && item.username === 'CurrentUser');


 return (
 <View style={styles.card}>
 <View style={styles.header}>
 <Text style={styles.username}>{item.username}</Text>
 <Text style={styles.flair}>{item.flair}</Text>
 </View>
 <Text style={styles.issueTitle}>{item.title}</Text>
 {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.itemImage} />}
 <Text style={styles.issueText}>{item.description}</Text>
 <Text style={styles.issueText}>Landmark: {item.landmark}</Text>
 {item.location.latitude && item.location.longitude && (
 <TouchableOpacity onPress={() => openMap(item.location.latitude, item.location.longitude)}>
 <Text style={styles.mapLink}>Navigate to Location</Text>
 </TouchableOpacity>
 )}
 {showInteractButton && (
 <TouchableOpacity
 style={styles.interactButton}
 onPress={() => Alert.alert('Interact', 'You can implement interaction logic here.')}
 >
 <Text style={styles.interactButtonText}>Interact</Text>
 </TouchableOpacity>
 )}
 {showReplies && item.replies && item.replies.length > 0 && (
 <View style={styles.repliesContainer}>
 <Text style={styles.repliesTitle}>Replies:</Text>
 {item.replies.map((reply, index) => (
 <View key={index} style={styles.replyContainer}>
 <Text style={styles.replyText}>{reply.text}</Text>
 {reply.imageUri && (
 <Image
 source={{ uri: reply.imageUri }}
 style={styles.replyImage}
 />
 )}
 </View>
 ))}
 </View>
 )}
 </View>
 );
 };


 const keyExtractor = (item: LostItem) => item.id;


 const startAnimation = useCallback(() => {
 Animated.timing(animation, {
 toValue: 1,
 duration: 300, // You can adjust the duration
 easing: Easing.ease, // You can adjust the easing function
 useNativeDriver: false, // Important for transforms
 }).start();
 }, [animation]);


 const resetAnimation = useCallback(() => {
 Animated.timing(animation, {
 toValue: 0,
 duration: 300,
 easing: Easing.ease,
 useNativeDriver: false,
 }).start();
 }, [animation]);


 // Filter items based on selected section
 const filteredItems = () => {
 if (selectedSection === 'general') {
 return lostItems;
 } else if (selectedSection === 'myLost') {
 return lostItems.filter(item => item.flair === 'Lost' && item.username === 'CurrentUser');
 } else {
 return lostItems.filter(item => item.flair === 'Found' && item.username === 'CurrentUser');
 }
 };


 const handleLostItemPress = () => {
 setIsSubmittingLost(true);
 setIsSubmittingFound(false);
 setModalVisible(true);
 startAnimation();
 };


 const handleFoundItemPress = () => {
 setIsSubmittingFound(true);
 setIsSubmittingLost(false);
 setModalVisible(true);
 startAnimation();
 };


 const closeModal = () => {
 resetAnimation();
 setTimeout(() => {
 setModalVisible(false);
 setIsSubmittingFound(false);
 setIsSubmittingLost(false);
 }, 300); // Delay to match the animation duration
 };


 const modalTranslateY = animation.interpolate({
 inputRange: [0, 1],
 outputRange: [600, 0], // Start from bottom and slide up
 });


 return (
 <View style={styles.container}>
 <Text style={styles.title}>Lost & Found Items</Text>
 <View style={styles.gamificationHeader}>
 <Text style={styles.gamificationText}>Points: {points}</Text>
 <Text style={styles.gamificationText}>Level: {level}</Text>
 <Text style={styles.gamificationText}>Badges: {badges.join(', ') || 'None'}</Text>
 </View>
 {/* Section Buttons */}
 <View style={styles.sectionButtons}>
 <TouchableOpacity
 style={[
 styles.sectionButton,
 selectedSection === 'general' && styles.selectedSectionButton,
 ]}
 onPress={() => setSelectedSection('general')}
 >
 <Text style={styles.sectionButtonText}>General</Text>
 </TouchableOpacity>
 <TouchableOpacity
 style={[
 styles.sectionButton,
 selectedSection === 'myLost' && styles.selectedSectionButton,
 ]}
 onPress={() => setSelectedSection('myLost')}
 >
 <Text style={styles.sectionButtonText}>My Lost Items</Text>
 </TouchableOpacity>
 <TouchableOpacity
 style={[
 styles.sectionButton,
 selectedSection === 'myFound' && styles.selectedSectionButton,
 ]}
 onPress={() => setSelectedSection('myFound')}
 >
 <Text style={styles.sectionButtonText}>My Found Items</Text>
 </TouchableOpacity>
 </View>
 <View style={styles.actionButtonsContainer}>
 {selectedSection === 'myLost' && (
 <TouchableOpacity style={styles.actionButton} onPress={handleLostItemPress}>
 <Text style={styles.actionButtonText}>Lost Item?</Text>
 </TouchableOpacity>
 )}
 {selectedSection === 'myFound' && (
 <TouchableOpacity style={styles.actionButton} onPress={handleFoundItemPress}>
 <Text style={styles.actionButtonText}>Found Item?</Text>
 </TouchableOpacity>
 )}
 </View>


 {/* Modal for Forms */}
 <Modal
 animationType="none"
 transparent={true}
 visible={modalVisible}
 onRequestClose={closeModal}
 >
 <View style={styles.modalOverlay}>
 <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalTranslateY }] }]}>
 <ScrollView showsVerticalScrollIndicator={false}>
 {/* Submit Found Item Form */}
 {isSubmittingFound && (
 <View style={styles.formContainer}>
 <Text style={styles.formTitle}>Submit Found Item</Text>
 <TextInput
 style={styles.input}
 placeholder="Item Name"
 value={itemNameFound}
 onChangeText={setItemNameFound}
 />
 <Button title="Pick an image" onPress={() => pickImage(setItemImageFound)} />
 {itemImageFound && <Image source={{ uri: itemImageFound }} style={styles.image} />}
 <Button title="Get Location" onPress={getLocation} />
 <Text style={styles.locationText}>
 Latitude: {locationFound.latitude}, Longitude: {locationFound.longitude}
 </Text>
 <TextInput
 style={styles.input}
 placeholder="Landmark"
 value={landmarkFound}
 onChangeText={setLandmarkFound}
 />
 <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFoundItem}>
 <Text style={styles.submitButtonText}>Submit Found Item</Text>
 </TouchableOpacity>
 </View>
 )}


 {/* Submit Lost Item Form */}
 {isSubmittingLost && (
 <View style={styles.formContainer}>
 <Text style={styles.formTitle}>Submit Lost Item</Text>
 <TextInput
 style={styles.input}
 placeholder="Item Name"
 value={itemNameLost}
 onChangeText={setItemNameLost}
 />
 <Button title="Pick an image" onPress={() => pickImage(setItemImageLost)} />
 {itemImageLost && <Image source={{ uri: itemImageLost }} style={styles.image} />}
 <TextInput
 style={styles.input}
 placeholder="Description"
 value={descriptionLost}
 onChangeText={setDescriptionLost}
 multiline
 />
 <TouchableOpacity style={styles.submitButton} onPress={handleSubmitLostItem}>
 <Text style={styles.submitButtonText}>Submit Lost Item</Text>
 </TouchableOpacity>
 </View>
 )}
 <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
 <Text style={styles.closeButtonText}>Close</Text>
 </TouchableOpacity>
 </ScrollView>
 </Animated.View>
 </View>
 </Modal>


 <FlatList
 data={filteredItems()}
 renderItem={renderItem}
 keyExtractor={keyExtractor}
 ListEmptyComponent={<Text style={styles.emptyListText}>No items found in this section.</Text>}
 />
 </View>
 );
};


const styles = StyleSheet.create({
 container: {
 flex: 1,
 padding: 20,
 backgroundColor: "#f8f8f8",
 },
 title: {
 fontSize: 28,
 fontWeight: "bold",
 marginBottom: 10,
 textAlign: 'center',
 color: '#333',
 },
 card: {
 padding: 15,
 marginBottom: 15,
 backgroundColor: "#fff",
 borderRadius: 10,
 elevation: 3,
 shadowColor: '#000',
 shadowOffset: { width: 0, height: 2 },
 shadowOpacity: 0.1,
 shadowRadius: 2,
 },
 header: {
 flexDirection: "row",
 justifyContent: "space-between",
 alignItems: "center",
 marginBottom: 8,
 },
 username: {
 fontSize: 16,
 fontWeight: "bold",
 color: "#555",
 },
 flair: {
 fontSize: 14,
 backgroundColor: "#007AFF",
 color: "#fff",
 paddingVertical: 4,
 paddingHorizontal: 10,
 borderRadius: 12,
 overflow: "hidden",
 },
 issueTitle: {
 fontSize: 20,
 fontWeight: "bold",
 marginBottom: 8,
 color: '#333',
 },
 issueText: {
 fontSize: 16,
 color: "#444",
 lineHeight: 24,
 },
 mapLink: {
 color: '#007AFF',
 marginTop: 10,
 fontSize: 16,
 textDecorationLine: 'underline',
 },
 button: {
 backgroundColor: '#2196F3',
 borderRadius: 8,
 paddingVertical: 12,
 marginBottom: 10,
 alignItems: 'center',
 },
 buttonText: {
 color: 'white',
 fontSize: 18,
 fontWeight: 'bold',
 },
 formContainer: {
 padding: 20,
 marginBottom: 15,
 backgroundColor: "#fff",
 borderRadius: 10,
 elevation: 3,
 },
 formTitle: {
 fontSize: 22,
 fontWeight: 'bold',
 marginBottom: 15,
 textAlign: 'center',
 color: '#333',
 },
 input: {
 height: 48,
 borderColor: '#ccc',
 borderWidth: 1,
 marginBottom: 15,
 paddingHorizontal: 12,
 borderRadius: 8,
 fontSize: 16,
 color: '#333',
 backgroundColor: '#f8f8f8',
 },
 submitButton: {
 backgroundColor: '#4CAF50',
 borderRadius: 8,
 paddingVertical: 12,
 alignItems: 'center',
 },
 submitButtonText: {
 color: 'white',
 fontSize: 18,
 fontWeight: 'bold',
 },
 image: {
 width: 120,
 height: 120,
 borderRadius: 60,
 marginBottom: 15,
 alignSelf: 'center',
 },
 itemImage: {
 width: '100%',
 height: 220,
 resizeMode: 'cover',
 borderRadius: 10,
 marginBottom: 10,
 },
 subtleButton: {
 padding: 12,
 marginBottom: 12,
 alignItems: 'center',
 borderRadius: 8,
 backgroundColor: '#007AFF',
 },
 subtleButtonText: {
 color: 'white',
 fontSize: 18,
 fontWeight: 'bold',
 },
 modalOverlay: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: 'rgba(0, 0, 0, 0.6)',
 },
 modalContainer: {
 backgroundColor: '#fff',
 borderRadius: 12,
 padding: 25,
 width: '90%',
 maxHeight: '85%',
 alignItems: 'center',
 overflow: 'hidden',
 },
 closeButton: {
 marginTop: 25,
 backgroundColor: '#ddd',
 paddingVertical: 10,
 paddingHorizontal: 15,
 borderRadius: 8,
 },
 closeButtonText: {
 fontSize: 18,
 color: '#555',
 },
 sectionButtons: {
 flexDirection: 'row',
 justifyContent: 'space-around',
 marginBottom: 20,
 },
 sectionButton: {
 paddingVertical: 12,
 paddingHorizontal: 16,
 borderRadius: 8,
 backgroundColor: '#eee',
 },
 selectedSectionButton: {
 backgroundColor: '#ddd',
 },
 sectionButtonText: {
 fontSize: 16,
 color: '#444',
 fontWeight: 'bold',
 },
 actionButtonsContainer: {
 flexDirection: 'row',
 justifyContent: 'center',
 marginBottom: 20,
 },
 actionButton: {
 backgroundColor: '#007AFF',
 borderRadius: 8,
 paddingVertical: 12,
 paddingHorizontal: 16,
 alignItems: 'center',
 },
 actionButtonText: {
 color: 'white',
 fontSize: 18,
 fontWeight: 'bold',
 },
 interactButton: {
 backgroundColor: '#007AFF',
 borderRadius: 8,
 paddingVertical: 10,
 alignItems: 'center',
 marginTop: 12,
 },
 interactButtonText: {
 color: 'white',
 fontSize: 16,
 fontWeight: 'bold',
 },
 repliesContainer: {
 marginTop: 12,
 padding: 15,
 backgroundColor: '#f0f0f0',
 borderRadius: 10,
 },
 repliesTitle: {
 fontSize: 18,
 fontWeight: 'bold',
 marginBottom: 8,
 color: '#333',
 },
 replyContainer: {
 flexDirection: 'row',
 alignItems: 'center',
 marginBottom: 10,
 },
 replyText: {
 fontSize: 16,
 marginRight: 10,
 color: '#444',
 },
 replyImage: {
 width: 60,
 height: 60,
 borderRadius: 30,
 },
 emptyListText: {
 fontSize: 18,
 color: '#777',
 textAlign: 'center',
 marginTop: 20,
 },
 locationText: {
 fontSize: 16,
 marginBottom: 15,
 color: '#555',
 },
 gamificationHeader: {
 flexDirection: 'row',
 justifyContent: 'space-around',
 marginBottom: 15,
 },
 gamificationText: {
 fontSize: 16,
 color: '#555',
 },
});


export default LostFound;
