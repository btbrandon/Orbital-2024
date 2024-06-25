import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Button,
  Provider as PaperProvider,
  TextInput,
  Snackbar,
} from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import supabase from "../../config/supabaseClient";
import moment from "moment-timezone";
import { SafeAreaView } from "react-native-safe-area-context";

const NewExpense = () => {
  const [categoryOptions] = useState([
    { label: "Food", value: "Food" },
    { label: "Transport", value: "Transport" },
    { label: "Clothing", value: "Clothing" },
    { label: "Others", value: "Others" },
  ]);
  const [category, setCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [userId, setUserId] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Error fetching user:", error);
        return;
      }
      const userEmail = data?.user?.email;

      const { data: userData, error: userError } = await supabase
        .from("user_credentials")
        .select()
        .eq("email", userEmail)
        .select("user_id");

      if (userError) {
        console.error("Error fetching user ID:", userError.message);
        return;
      }

      const newUserId = userData[0]?.user_id;
      setUserId(newUserId);
    };

    fetchUserId();
  }, []);

  const handleAddExpense = async () => {
    if (!category || !itemName || !itemPrice) {
      setSnackbarMessage("Please fill in all fields");
      setSnackbarVisible(true);
      return;
    }
    if (parseFloat(itemPrice) <= 0) {
      setSnackbarMessage("Amount must be greater than 0");
      setSnackbarVisible(true);
      return;
    }
    if (isNaN(parseFloat(itemPrice))) {
      setSnackbarMessage("Amount must be a number");
      setSnackbarVisible(true);
      return;
    }
    if (category === null) {
      setSnackbarMessage("Please select the category");
      setSnackbarVisible(true);
      return;
    }

    const singaporeTime = moment().tz("Asia/Singapore");
    const today = singaporeTime.format("YYYY-MM-DD");
    const timeNow = singaporeTime.format("HH:mm:ss");

    try {
      const { data, error } = await supabase.from("expenses").insert([
        {
          category,
          itemName,
          itemPrice: parseFloat(itemPrice),
          user_id: userId,
          date: today,
          time: timeNow,
        },
      ]);

      if (error) {
        console.error("Error inserting data:", error);
        setSnackbarMessage(error.message || "Error inserting data");
        setSnackbarVisible(true);
        return;
      }

      // Reset fields after adding the expense
      setCategory("");
      setItemName("");
      setItemPrice("");
      setSnackbarMessage("Expense added successfully");
      setSnackbarVisible(true);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Unexpected error:", error);
        setSnackbarMessage(error.message || "An unexpected error occurred");
        setSnackbarVisible(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PaperProvider>
        <ScrollView>
          <Text style={styles.label}>Category</Text>
          <RNPickerSelect
            onValueChange={(value) => setCategory(value)}
            items={categoryOptions}
            placeholder={{
              label: "Select a category",
              color: "black",
              value: null,
            }}
            style={{
              ...pickerSelectStyles,
              inputAndroid: {
                ...pickerSelectStyles.inputAndroid,
                marginBottom: 10,
              },
              inputIOS: {
                ...pickerSelectStyles.inputIOS,
                marginBottom: 10,
              },
            }}
            value={category}
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            label="Name"
            style={styles.input}
            onChangeText={(text) => setItemName(text)}
            value={itemName}
            placeholder="Enter item name"
          />

          <Text style={styles.label}>Price</Text>
          <TextInput
            label="Price"
            style={styles.input}
            onChangeText={(text) => setItemPrice(text)}
            value={itemPrice}
            placeholder="Enter price"
            keyboardType="numeric"
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              style={styles.button}
              onPress={handleAddExpense}
              color="#ffffff"
            >
              Add Item
            </Button>
          </View>

          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
          >
            {snackbarMessage}
          </Snackbar>
        </ScrollView>
      </PaperProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 20,
    marginVertical: 10,
    fontFamily: "Verdana",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "white",
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#274653",
    padding: 5,
    justifyContent: "center",
    fontWeight: "bold",
    fontFamily: "Verdana",
    margin: 10,
    borderRadius: 10,
    width: 150,
    alignSelf: "center",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "white",
    marginBottom: 10,
    width: 335,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "white",
    marginBottom: 10,
    marginHorizontal: 10,
  },
});

export default NewExpense;
