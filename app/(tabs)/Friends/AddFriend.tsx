import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import supabase from "../../../config/supabaseClient";
import { Snackbar } from "react-native-paper";
import { router } from "expo-router";

const AddFriend = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [username, setFriendUsername] = useState<string>("");
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

  const handleSendFriendRequest = async () => {
    if (!username.trim()) {
      setSnackbarMessage("Please enter your friend's username.");
      setSnackbarVisible(true);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("user_credentials")
      .select("user_id")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      setSnackbarMessage("User not found.");
      setSnackbarVisible(true);
      return;
    }

    const friendUserId = userData.user_id;

    const { data: existingRelationship, error: relationshipError } =
      await supabase
        .from("relationships")
        .select("*")
        .or(`user1.eq.${userId},user2.eq.${userId}`)
        .or(`user1.eq.${friendUserId},user2.eq.${friendUserId}`);

    if (relationshipError) {
      console.error(
        "Error checking existing relationships:",
        relationshipError.message
      );
      setSnackbarMessage("Failed to check existing relationships.");
      setSnackbarVisible(true);
      return;
    }

    if (existingRelationship.length > 0) {
      setSnackbarMessage("User is already added as friend.");
      setSnackbarVisible(true);
      setFriendUsername("");
      return;
    }

    const { data: existingRequests, error: existingRequestsError } =
      await supabase
        .from("friend_request")
        .select("*")
        .eq("adder", userId)
        .eq("addee", friendUserId);

    if (existingRequestsError) {
      console.error(
        "Error checking existing friend requests:",
        existingRequestsError.message
      );
      setSnackbarMessage("Failed to check existing friend requests.");
      setSnackbarVisible(true);
      return;
    }

    if (existingRequests.length > 0) {
      setSnackbarMessage(
        "You already have a pending friend request to this user."
      );
      setSnackbarVisible(true);
      setFriendUsername("");
      return;
    }

    const { data: pendingRequests, error: pendingRequestsError } =
      await supabase
        .from("friend_request")
        .select("*")
        .eq("addee", userId)
        .eq("adder", friendUserId);

    if (pendingRequests.length > 0) {
      setSnackbarMessage(
        "You already have a pending friend request from this user."
      );
      setSnackbarVisible(true);
      setFriendUsername("");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("friend_request")
        .insert([{ adder: userId, addee: friendUserId }]);

      router.replace("./FriendsMain");

      if (error) {
        console.error("Error adding friend request:", error.message);
        setSnackbarMessage(`Failed to add friend request` + error);
        setSnackbarVisible(true);
        return;
      }

      setFriendUsername("");
      setSnackbarMessage(
        `Friend request sent to ${username} successfully` + error
      );
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error adding friend request:", error.message);
      setSnackbarMessage("Error adding friend request" + error);
      setSnackbarVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Friend's Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(text) => setFriendUsername(text)}
            placeholder="Enter friend's username"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSendFriendRequest}
          >
            <Text style={styles.buttonText}>Send Friend Request</Text>
          </TouchableOpacity>
        </View>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
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
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  label: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
    fontFamily: "Calibri",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#121E26",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddFriend;
