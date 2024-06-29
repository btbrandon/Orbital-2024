import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import supabase from "../config/supabaseClient";

const ForgotPassword = () => {
  StatusBar.setBarStyle("light-content", true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };

  const handleForgotPassword = async () => {
    console.log("Forgot Password button pressed");
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      console.log("Data:", data);
      console.log("Error:", error);
      console.log(email);
      if (error) {
        setMessage("Error: " + error.message);
        return;
      } else {
        Alert.alert("Password reset link has been sent to your email.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/background.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.content}>
          <Image
            source={require("../assets/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.header}>Password Recovery</Text>

          <Text style={styles.text}>
            The link to reset your password will be sent to your email.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Image
                source={require("../assets/email.webp")}
                style={styles.icon}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="white"
                style={styles.input}
                keyboardType="email-address"
                onChangeText={handleEmailChange}
              />
            </View>
          </View>

          <Link href="/" style={styles.leftLink}>
            <Text style={styles.linkText}>Back to Login</Text>
          </Link>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleForgotPassword}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121E26",
  },
  text: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Calibri",
    margin: 10,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover", // or stretch
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Calibri",
    color: "#FFFFFF",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: "left",
    color: "#FFFFFF",
    fontFamily: "Calibri",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: "#FFFFFF",
    fontFamily: "Calibri",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Calibri",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Calibri",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    width: "100%",
  },
  leftLink: {
    marginRight: "auto",
  },
  rightLink: {
    marginLeft: "auto",
  },
  linkText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontFamily: "Calibri",
  },
  buttonContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Calibri",
  },
});

export default ForgotPassword;
