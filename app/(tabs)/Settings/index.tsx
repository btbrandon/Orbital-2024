import { router } from "expo-router";
import {
  View,
  ScrollView,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import supabase from "../../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

const index = () => {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      router.replace("/");
    }
  };

  const handleUpdateInfo = () => {
    router.push("../Settings/ConfirmPassword");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Settings</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleUpdateInfo}>
            <Text style={styles.buttonText}>Update Info</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 15,
    color: "white",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 5,
    color: "white",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    marginHorizontal: 15,
    alignItems: "center",
    shadowOpacity: 1,
    shadowOffset: { height: 5, width: 0 },
  },
  buttonText: {
    color: "#00000",
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 15,
  },
});

export default index;
