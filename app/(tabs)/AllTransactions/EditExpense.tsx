import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { TextInput, Button, Snackbar } from "react-native-paper";
import supabase from "../../../config/supabaseClient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditExpense = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { expense } = route.params;

  const [itemName, setItemName] = useState(expense.itemName);
  const [itemPrice, setItemPrice] = useState(expense.itemPrice.toString());
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSave = async () => {
    if (!itemName || !itemPrice) {
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
    if (parseFloat(itemPrice) > 1e8) {
      setSnackbarMessage("Expense too large");
      setSnackbarVisible(true);
      return;
    }

    try {
      const { error } = await supabase
        .from("expenses")
        .update({ itemName, itemPrice: parseFloat(itemPrice) })
        .eq("transactionId", expense.transactionId);

      if (error) {
        console.error("Error updating data:", error);
        setSnackbarMessage(error.message || "Error updating data");
        setSnackbarVisible(true);
        return;
      }

      setSnackbarMessage("Expense updated successfully");
      setSnackbarVisible(true);
      navigation.goBack();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Unexpected error:", error);
        setSnackbarMessage(error.message || "An unexpected error occurred");
        setSnackbarVisible(true);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("transactionId", expense.transactionId);

      if (error) {
        console.error("Error deleting expense:", error);
        setSnackbarMessage(error.message || "Error deleting expense");
        setSnackbarVisible(true);
        return;
      }

      setSnackbarMessage("Expense deleted successfully");
      setSnackbarVisible(true);
      navigation.goBack();
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
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.header}>Edit Expense</Text>
        <TextInput
          label="Name"
          style={styles.input}
          onChangeText={(text) => setItemName(text)}
          value={itemName}
          placeholder="Enter item name"
        />

        <TextInput
          label="Price"
          style={styles.input}
          onChangeText={(text) => setItemPrice(text)}
          value={itemPrice}
          placeholder="Enter price"
          keyboardType="numeric"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleDelete}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: "Close",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#284452",
  },
  header: {
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 25,
    height: 50,
    alignSelf: "center",
    marginTop: 12,
    color: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#ffffff",
    fontSize: 16,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },
  buttonContainer: {
    justifyContent: "center",
    marginTop: 5,
    color: "white",
  },
  button: {
    backgroundColor: "#121E26",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 15,
  },
});

export default EditExpense;
