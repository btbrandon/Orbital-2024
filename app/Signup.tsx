import React, { useState } from "react";
import {
  Text,
  TextInput,
  View,
  Button,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Link, router } from "expo-router";
import supabase from "../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";

const Signup = () => {
  StatusBar.setBarStyle("light-content", true);
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

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
      setFormError("Please fill in all the fields");
      Alert.alert(formError);
      return;
    }

    try {
      // Check if username is already taken
      const { data: existingUserByUsername, error: usernameError } =
        await supabase
          .from("user_credentials")
          .select("user_id")
          .eq("username", username)
          .single();

      if (usernameError && usernameError.code !== "PGRST116") {
        // PGRST116 indicates no rows found, ignore this error
        throw usernameError;
      }

      // Check if email is already taken
      const { data: existingUserByEmail, error: emailError } = await supabase
        .from("user_credentials")
        .select("user_id")
        .eq("email", email)
        .single();

      if (emailError && emailError.code !== "PGRST116") {
        throw emailError;
      }

      if (existingUserByUsername) {
        setFormError("Username is taken.");
        Alert.alert(formError);
        return;
      }

      if (existingUserByEmail) {
        setFormError("Email already linked to an existing user.");
        Alert.alert(formError);
        return;
      }

      if (password.length < 6) {
        setFormError("Password should at least be 6 characters long.");
        Alert.alert(formError);
        return;
      }

      // If no errors and both email and username are unique, proceed with insertion
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        throw error;
      }

      const { data: credData, error: credError } = await supabase
        .from("user_credentials")
        .insert([{ email, username, password }]);

      Alert.alert(
        "Signup Successful",
        "Welcome! Your account has been created."
      );
      router.replace("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      setFormError(error.message || "An unexpected error occurred");
      Alert.alert(formError);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require("../assets/background.jpg")} // Replace with your background image path
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

        {/* Error Message */}
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>SIGN UP</Text>
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
    fontFamily: "Verdana",
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
    fontFamily: "Verdana",
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
    fontFamily: "Verdana",
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
    fontFamily: "Verdana",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
    fontSize: 16,
    fontFamily: "Verdana",
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
    fontFamily: "Verdana",
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
    fontFamily: "Verdana",
  },
});

export default Signup;
