import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import supabase from "../../../config/supabaseClient";
import React from "react";
import { Snackbar } from "react-native-paper";

const ChangePassword = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Error fetching user:", error);
        return;
      }
      const userEmail = data?.user?.email;

      const { data: userData, error: userError } = await supabase
        .from("user_credentials")
        .select("user_id")
        .eq("email", userEmail)
        .single();

      if (userError) {
        console.error("Error fetching user ID:", userError.message);
        return;
      }

      const newUserId = userData?.user_id;
      setUserId(newUserId);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchUserDetails = async () => {
        const { data, error } = await supabase
          .from("user_credentials")
          .select("username, email")
          .eq("user_id", userId)
          .single();

        if (error) {
          setSnackbarMessage(error.message);
          setSnackbarVisible(true);
        } else {
          setUsername(data.username);
          setEmail(data.email);
        }
      };

      fetchUserDetails();
    }
  }, [userId]);

  const handleUpdateCredentials = async () => {
    if (password !== confirmPassword) {
      setSnackbarMessage("Passwords do not match.");
      setSnackbarVisible(true);
      return;
    } else if (password.length < 6) {
      setSnackbarMessage("Password should be at least 6 characters")
      setSnackbarVisible(true);
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
      return;
    }

    const updates = {
      password: password,
    };

    const { error: updateError } = await supabase.auth.updateUser(updates);

    const { error: userTableError } = await supabase
    .from('user_credentials')
    .update({
      password: password,
    })
    .eq('user_id', userId);

      
    if (updateError) {
      setSnackbarMessage(updateError.message);
    } else {
      setSnackbarMessage('Password updated successfully!');
    }
    
    setSnackbarVisible(true);

  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text style={styles.header}>Change Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="New Password"
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateCredentials}
        >
          <Text style={styles.buttonText}>Update</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#284452",
  },
  formContainer: {
    width: "80%",
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
  input: {
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    color: "#000",
    marginHorizontal: 20,
  },
  button: {
    backgroundColor: "#121E26",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 15,
  },
  messageText: {
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default ChangePassword;
