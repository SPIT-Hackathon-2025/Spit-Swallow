import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface Item {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  type: "lost" | "found";
}

const dummyItems: Item[] = [
  { id: 1, name: "Wallet", description: "Black leather wallet", location: "Park", date: "2024-02-08", type: "lost" },
  { id: 2, name: "Phone", description: "iPhone 12, blue case", location: "Mall", date: "2024-02-06", type: "lost" },
  { id: 3, name: "Keys", description: "Car keys with a red keychain", location: "Office", date: "2024-02-05", type: "found" },
  { id: 4, name: "Backpack", description: "Blue Adidas backpack with books", location: "Library", date: "2024-02-04", type: "lost" },
  { id: 5, name: "Glasses", description: "Ray-Ban glasses in a black case", location: "Cafe", date: "2024-02-03", type: "found" },
  { id: 6, name: "Watch", description: "Silver Fossil watch", location: "Gym", date: "2024-02-02", type: "lost" },
  { id: 7, name: "Earrings", description: "Gold hoop earrings", location: "Bus Stop", date: "2024-02-01", type: "found" },
  { id: 8, name: "Laptop", description: "Dell XPS 13, black", location: "University", date: "2024-01-31", type: "lost" },
  { id: 9, name: "Hat", description: "Red Nike cap", location: "Restaurant", date: "2024-01-30", type: "found" },
  { id: 10, name: "Earphones", description: "AirPods Pro", location: "Metro Station", date: "2024-01-29", type: "lost" },
  { id: 11, name: "Teddy Bear", description: "Small brown teddy bear", location: "Playground", date: "2024-01-28", type: "lost" },
  { id: 12, name: "Umbrella", description: "Black umbrella", location: "Supermarket", date: "2024-01-27", type: "found" },
  { id: 13, name: "Credit Card", description: "Visa card, ending 4321", location: "Gas Station", date: "2024-01-26", type: "found" },
  { id: 14, name: "Sunglasses", description: "Ray-Ban Aviators", location: "Beach", date: "2024-01-25", type: "lost" },
  { id: 15, name: "Notebook", description: "Blue spiral notebook", location: "School", date: "2024-01-24", type: "lost" },
];

const LostFound: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
  const [items, setItems] = useState<Item[]>(dummyItems);
  const [newItem, setNewItem] = useState({ name: "", description: "", location: "", date: "" });

  const addItem = () => {
    if (!newItem.name || !newItem.description || !newItem.location || !newItem.date) {
      alert("Please fill all fields.");
      return;
    }

    const newItemObj: Item = {
      id: items.length + 1,
      name: newItem.name,
      description: newItem.description,
      location: newItem.location,
      date: newItem.date,
      type: activeTab,
    };

    setItems([...items, newItemObj]);
    setNewItem({ name: "", description: "", location: "", date: "" });
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab("lost")} style={[styles.tab, activeTab === "lost" && styles.activeTab]}>
          <Text style={styles.tabText}>Lost Items</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("found")} style={[styles.tab, activeTab === "found" && styles.activeTab]}>
          <Text style={styles.tabText}>Found Items</Text>
        </TouchableOpacity>
      </View>

      {/* List of Items */}
      <FlatList
        data={items.filter((item) => item.type === activeTab)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.itemLocation}>📍 {item.location} - {item.date}</Text>
          </View>
        )}
      />

      {/* Add Item Section */}
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Item Name" value={newItem.name} onChangeText={(text) => setNewItem({ ...newItem, name: text })} />
        <TextInput style={styles.input} placeholder="Description" value={newItem.description} onChangeText={(text) => setNewItem({ ...newItem, description: text })} />
        <TextInput style={styles.input} placeholder="Location" value={newItem.location} onChangeText={(text) => setNewItem({ ...newItem, location: text })} />
        <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={newItem.date} onChangeText={(text) => setNewItem({ ...newItem, date: text })} />
        <Button title={`Add ${activeTab === "lost" ? "Lost" : "Found"} Item`} onPress={addItem} />
      </View>
    </View>
  );
};

export default LostFound;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  tabContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  tab: { padding: 10, borderBottomWidth: 2, borderColor: "transparent" },
  activeTab: { borderColor: "#007bff" },
  tabText: { fontSize: 16, fontWeight: "bold", color: "#007bff" },
  item: { padding: 10, backgroundColor: "white", marginVertical: 5, borderRadius: 5 },
  itemTitle: { fontSize: 16, fontWeight: "bold" },
  itemLocation: { fontSize: 12, color: "gray" },
  inputContainer: { marginTop: 20 },
  input: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10, backgroundColor: "white" },
});
