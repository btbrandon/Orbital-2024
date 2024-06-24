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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import supabase from "../config/supabaseClient";

const Signup = () => {
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
    <View style={styles.container}>
      <ScrollView>
        <Image source={require("../assets/Logo.png")} style={styles.image} />
        <Text style={styles.header}>Sign Up</Text>

        <View style={styles.loginInputContainer}>
          <Text style={styles.text}>Email</Text>
          <View style={styles.row}>
            <Image
              source={require("../assets/email.webp")}
              style={styles.icon}
            />
            <TextInput
              placeholder="Email"
              style={styles.textInput}
              keyboardType="email-address"
              onChangeText={handleEmailChange}
            />
          </View>
        </View>

        <View style={styles.loginInputContainer}>
          <Text style={styles.text}>Username</Text>
          <View style={styles.row}>
            <Image
              source={require("../assets/username.png")}
              style={styles.icon}
            />
            <TextInput
              placeholder="Username"
              style={styles.textInput}
              onChangeText={handleUsernameChange}
            />
          </View>
        </View>

        <View style={styles.loginInputContainer}>
          <Text style={styles.text}>Password (min 6 char.)</Text>
          <View style={styles.row}>
            <Image
              source={require("../assets/password.png")}
              style={styles.icon}
            />
            <TextInput
              secureTextEntry={true}
              placeholder="Password"
              style={styles.textInput}
              onChangeText={handlePasswordChange}
            />
          </View>
        </View>

        <View style={styles.linkContainer}>
          <Link href="/" style={styles.leftLink}>
            Already have an account?
          </Link>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="SIGN UP" onPress={handleSignup} color="#FFFFFF" />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    // #DDA0DD
  },
  header: {
    fontWeight: "bold",
    fontFamily: "Verdana",
    fontSize: 35,
    height: 50,
    textAlign: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    backgroundColor: "#274653",
    padding: 10,
    justifyContent: "center",
    fontWeight: "bold",
    fontFamily: "Verdana",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 15,
  },
  loginInputContainer: {
    backgroundColor: "white",
    fontSize: 20,
    margin: 10,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
    textAlign: "left",
    fontFamily: "Verdana",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
  },
  row: {
    flexDirection: "row",
    margin: 5,
  },
  text: {
    marginLeft: 10,
    backgroundColor: "white",
    fontSize: 18,
    textAlign: "left",
    fontFamily: "Verdana",
  },
  image: {
    width: 100,
    height: 100,
    margin: 30,
    marginTop: 45,
    alignSelf: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  textInput: { fontSize: 15, height: 20, width: 270 },
  linkContainer: {
    flexDirection: "row",
    margin: 5,
    marginBottom: 30,
    justifyContent: "space-between",
  },
  leftLink: {
    textAlign: "left",
    marginLeft: 10,
    marginVertical: 10,
  },
  rightLink: {
    textAlign: "right",
    marginRight: 10,
    marginVertical: 10,
  },
});

export default Signup;
