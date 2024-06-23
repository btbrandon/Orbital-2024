import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  TextInput,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

const NewExpense = () => {
  const [category, setCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const handleAddExpense = () => {
    if (!category || !itemName || !itemPrice) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (parseFloat(itemPrice) <= 0) {
      Alert.alert("Amount must be greater than 0");
      return;
    }
    if (isNaN(parseFloat(itemPrice))) {
      Alert.alert("Amount must be a number");
      return;
    }
    if (category === null) {
      Alert.alert("Please select the category");
      return;
    }

    // Perform the action to save the expense
    console.log({ category, itemName, itemPrice });

    // Reset fields after adding the expense
    setCategory("");
    setItemName("");
    setItemPrice("");
    Alert.alert("Success", "Expense added successfully");
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <RNPickerSelect
            onValueChange={(value) => setCategory(value)}
            items={[
              { label: "Food", value: "food" },
              { label: "Transport", value: "transport" },
              { label: "Clothing", value: "clothing" },
              { label: "Others", value: "others" },
            ]}
            style={pickerSelectStyles}
            value={category}
            placeholder={{
              label: "Select a category...",
              value: null,
            }}
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setItemName(text)}
            value={itemName}
            placeholder="Enter item name"
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setItemPrice(text)}
            value={itemPrice}
            placeholder="Enter price"
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Add Expense"
              onPress={handleAddExpense}
              color="#ffffff"
            />
          </View>

          {/* Homepage */}
          <Link href="Homepage">Home</Link>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    fontWeight: "bold",
    fontFamily: "Verdana",
    fontSize: 35,
    height: 50,
    textAlign: "center",
    justifyContent: "center",
    margin: 10,
    marginTop: 50,
    marginBottom: 30,
  },
  buttonContainer: {
    backgroundColor: "#274653",
    padding: 5,
    justifyContent: "center",
    fontWeight: "bold",
    fontFamily: "Verdana",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignContent: "center",
    padding: 5,
  },
  label: {
    fontSize: 20,
    margin: 5,
    padding: 10,
    textAlign: "left",
    fontFamily: "Verdana",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  inputContainer: {
    backgroundColor: "#DDA0DD",
    fontSize: 20,
    margin: 10,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
    textAlign: "left",
    fontFamily: "Verdana",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: "white",
  },
  inputAndroid: {
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: "white",
  },
});

export default NewExpense;
