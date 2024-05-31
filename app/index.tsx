import { useState } from "react";
import React from "react";
import {
  Text,
  TextInput,
  View,
  Button,
  Image,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import { Link, router } from "expo-router";
import supabase from "../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  StatusBar.setHidden(true); // Hide the status bar
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const handleUsernameChange = (text: string) => {
    setUsername(text);
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setFormError("Please fill in all the fields");
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from("user_credentials")
        .select()
        .eq("username", username)
        .single();

      if (userError) {
        setFormError("Error retrieving user: " + userError.message);
        return;
      }

      if (!userData) {
        setFormError("No user found with that username.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      if (error) {
        setFormError("Login Error: " + error.message);
        Alert.alert("Login Error", `${error}`);
        return;
      }

      Alert.alert("Login Successful", `Welcome back, ${userData.username}!`);
      setFormError("");
      router.replace("Homepage");
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Image source={require("../assets/Logo.png")} style={styles.image} />
        <Text style={styles.header}>Login</Text>

        {/* Username */}
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

        {/* Password */}
        <View style={styles.loginInputContainer}>
          <Text style={styles.text}>Password</Text>
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

        {/* Don't have an account? / Forgot your password? */}
        <View style={styles.linkContainer}>
          <Link href="Signup" style={styles.leftLink}>
            Don't have an account?
          </Link>

          <Link href="ForgotPassword" style={styles.rightLink}>
            Forgot your password?
          </Link>
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <Button title="LOGIN" onPress={handleLogin} color="#FFFFFF" />
        </View>
      </View>
    </SafeAreaView>
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
  textInput: { fontSize: 15, fontFamily: "Verdana" },
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

export default Login;
