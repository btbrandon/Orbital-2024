import { router } from "expo-router";
import {
  View,
  ScrollView,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import supabase from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import React from "react";

const Settings = () => {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      router.replace("/");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Settings</Text>
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
    color: "white",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    color: "white",
  },
  button: {
    backgroundColor: "#121E26",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 15,
  },
});

export default Settings;
