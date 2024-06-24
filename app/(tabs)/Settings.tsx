import { router } from "expo-router";
import { View, ScrollView, Button, StyleSheet } from "react-native";
import supabase from "../../config/supabaseClient";

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
    <ScrollView style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.buttonContainer}>
          <Button title="Sign Out" onPress={handleSignOut} color="#ffffff" />
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
  inputContainer: {
    backgroundColor: "#DDA0DD",
    flex: 1,
    fontSize: 20,
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
    textAlign: "left",
    fontFamily: "Verdana",
    marginVertical: 30,
  },
});

export default Settings;
