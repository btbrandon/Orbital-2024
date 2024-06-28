import { router } from "expo-router";
import { View, ScrollView, Button, StyleSheet, Text } from "react-native";
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
          <Button title="Sign Out" onPress={handleSignOut} color="#ffffff" />
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
    backgroundColor: "#121E26",
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
});

export default Settings;
