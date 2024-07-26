import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Link, router } from "expo-router";
import supabase from "../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Snackbar } from "react-native-paper";

const Signup = () => {
  StatusBar.setBarStyle("light-content", true);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleEmailChange = (text: string) => {
    setEmail(text);
  };
  const handleUsernameChange = (text: string) => {
    setUsername(text);
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleSignup = async (e: { preventDefault: () => void }) => {
    if (!email || !username || !password) {
      setSnackbarMessage("Please fill in all the fields.");
      setSnackbarVisible(true);
      return;
    }

    try {
      const { data: existingUserByUsername, error: usernameError } =
        await supabase
          .from("user_credentials")
          .select("user_id")
          .eq("username", username)
          .single();

      if (usernameError && usernameError.code !== "PGRST116") {
        throw usernameError;
      }

      const { data: existingUserByEmail, error: emailError } = await supabase
        .from("user_credentials")
        .select("user_id")
        .eq("email", email)
        .single();

      if (emailError && emailError.code !== "PGRST116") {
        throw emailError;
      }

      if (existingUserByUsername) {
        setSnackbarMessage("Username already taken.");
        setSnackbarVisible(true);
        return;
      }

      if (existingUserByEmail) {
        setSnackbarMessage("Email already linked to an existing user.");
        setSnackbarVisible(true);
        return;
      }

      if (password.length < 6) {
        setSnackbarMessage("Password should at least be 6 characters long.");
        setSnackbarVisible(true);
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        throw error;
      }

      const { data: credData, error: credError } = await supabase
        .from("user_credentials")
        .insert([{ email, username, password }]);

      setSnackbarMessage("Welcome! Your account has been created.");
      setSnackbarVisible(true);
      router.replace("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      setSnackbarMessage("An unexpected error occurred.");
      setSnackbarVisible(true);
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
          <Text style={styles.header}>Sign Up</Text>

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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputRow}>
              <Image
                source={require("../assets/username.png")}
                style={styles.icon}
              />
              <TextInput
                placeholder="Username"
                placeholderTextColor="white"
                style={styles.input}
                onChangeText={handleUsernameChange}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password (min 6 char.)</Text>
            <View style={styles.inputRow}>
              <Image
                source={require("../assets/password.png")}
                style={styles.icon}
              />
              <TextInput
                secureTextEntry={true}
                placeholder="Password"
                placeholderTextColor="white"
                style={styles.input}
                onChangeText={handlePasswordChange}
              />
            </View>
          </View>

          <View style={styles.linkContainer}>
            <Link href="/" style={styles.leftLink}>
              <Text style={styles.linkText}>Already have an account?</Text>
            </Link>
          </View>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
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
    marginBottom: 10,
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

export default Signup;
