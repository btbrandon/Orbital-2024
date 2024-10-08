import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import supabase from "../../../config/supabaseClient";
import { format } from "date-fns";
import { Snackbar } from "react-native-paper";
import { router } from "expo-router";

const SplitBill = () => {
  type Friend = {
    user_id: string;
    username: string;
  };

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [amounts, setAmounts] = useState({});
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
      fetchFriends();
    }
  }, [userId]);

  const fetchFriends = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("relationships")
        .select("user1, user2")
        .or(`user1.eq.${userId},user2.eq.${userId}`);
      if (error) throw error;

      const friendIds = data.map((relationship) =>
        relationship.user1 === userId ? relationship.user2 : relationship.user1
      );

      const { data: friendsData, error: friendsError } = await supabase
        .from("user_credentials")
        .select("user_id, username")
        .in("user_id", friendIds);
      if (friendsError) throw friendsError;

      setFriends(friendsData);
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAmountChange = (userId, amount) => {
    setAmounts((prevAmounts) => ({
      ...prevAmounts,
      [userId]: amount,
    }));
  };

  const handleSubmit = async () => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");

    const isAnyFieldFilled = friends.some(
      (friend) =>
        amounts[friend.user_id] && parseFloat(amounts[friend.user_id]) > 0
    );

    if (!isAnyFieldFilled) {
      setSnackbarMessage("Please fill in at least one field");
      setSnackbarVisible(true);
      return;
    }

    try {
      const bills = friends.map((friend) => ({
        owee: userId,
        ower: friend.user_id,
        amount: amounts[friend.user_id]
          ? parseFloat(amounts[friend.user_id])
          : 0,
        created_at: formattedDate,
      }));

      const { data, error } = await supabase.from("bill").insert(bills);
      if (error) {
        console.error("Error inserting into bill table:", error);
        return;
      }

      setSnackbarMessage("Bill added successfully");
      setSnackbarVisible(true);
      router.replace(".");
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Split New Bill</Text>
        {friends.map((friend) => (
          <View key={friend.user_id} style={styles.friendContainer}>
            <Text style={styles.friendName}>{friend.username}</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              onChangeText={(text) => handleAmountChange(friend.user_id, text)}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
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
  title: {
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 25,
    height: 50,
    alignSelf: "center",
    marginTop: 12,
    color: "white",
  },
  friendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  friendName: {
    color: "white",
    fontSize: 18,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    width: "40%",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    margin: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SplitBill;
