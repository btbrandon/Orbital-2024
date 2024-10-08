import { useState } from 'react';
import React from 'react';
import {
  Text,
  TextInput,
  View,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Link, router } from 'expo-router';
import supabase from '../config/supabaseClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar } from 'react-native-paper';


const Login = () => {
  StatusBar.setBarStyle("light-content", true);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleUsernameChange = (text: string) => {
    setUsername(text);
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setSnackbarMessage("Please fill in all the fields.");
      setSnackbarVisible(true);
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from("user_credentials")
        .select()
        .eq("username", username)
        .single();

      if (userError) {
        setSnackbarMessage("No user found with that username.");
        setSnackbarVisible(true);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      if (error) {
        setSnackbarMessage(error.message + ".");
        setSnackbarVisible(true);
        return;
      }

      router.replace("./(tabs)/Homepage");
    } catch (error: any) {
      setSnackbarMessage("An unexpected error occurred.");
      console.log(error.message);
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
          <Text style={styles.header}>Piggify</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputRow}>
              <Image
                source={require("../assets/username.png")}
                style={styles.icon}
                resizeMode="contain"
              />
              <TextInput
                placeholder="Username"
                placeholderTextColor="#afc1cd"
                style={styles.input}
                onChangeText={handleUsernameChange}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Image
                source={require("../assets/password.png")}
                style={styles.icon}
                resizeMode="contain"
              />
              <TextInput
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="#afc1cd"
                style={styles.input}
                onChangeText={handlePasswordChange}
              />
            </View>
          </View>
          <View style={styles.linkContainer}>
            <Link href="Signup" style={styles.leftLink}>
              <Text style={styles.linkText}>Don't have an account?</Text>
            </Link>
            {/* <Link href="ForgotPassword" style={styles.rightLink}>
              <Text style={styles.linkText}>Forgot your password?</Text>
            </Link> */}
          </View>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleLogin}
            activeOpacity={0.4}
          >
            <Text style={styles.buttonText}>Login</Text>
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
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
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
    fontSize: 50,
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

export default Login;
