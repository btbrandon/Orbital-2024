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

const AddFriend = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [username, setFriendUsername] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Implement refresh logic here if needed
    setRefreshing(false);
  };

  const handleSendFriendRequest = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your friend's username");
      return;
    }

    // Check if the user exists in the user_credentials table
    const { data: userData, error: userError } = await supabase
      .from("user_credentials")
      .select("user_id")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      Alert.alert("Error", "User not found");
      return;
    }

    const friendUserId = userData.user_id;

    // Check if users are already friends
    const { data: existingRelationship, error: relationshipError } = await supabase
      .from("relationships")
      .select("*")
      .or(`user1.eq.${userId},user2.eq.${userId}`)
      .or(`user1.eq.${friendUserId},user2.eq.${friendUserId}`);

    if (relationshipError) {
      console.error("Error checking existing relationships:", relationshipError.message);
      Alert.alert("Error", "Failed to check existing relationships");
      return;
    }

    if (existingRelationship.length > 0) {
      Alert.alert("Error", "User is already added as friend");
      setFriendUsername("");
      return;
    }

    // Check if there is already a pending friend request
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
      Alert.alert("Error", "Failed to check existing friend requests");
      return;
    }

    if (existingRequests.length > 0) {
      Alert.alert(
        "Error",
        "You already have a pending friend request to this user"
      );
      setFriendUsername("");
      return;
    }

    // Adding a friend request to the Supabase database
    try {
      const { data, error } = await supabase
        .from("friend_request")
        .insert([{ adder: userId, addee: friendUserId }]);

      if (error) {
        console.error("Error adding friend request:", error.message);
        Alert.alert("Error", "Failed to add friend request");
        return;
      }

      Alert.alert("Success", `Friend request sent to ${username} successfully`);
      setFriendUsername(""); // Clear the input field after successful addition
    } catch (error) {
      console.error("Error adding friend request:", error.message);
      Alert.alert("Error", "Failed to add friend request");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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