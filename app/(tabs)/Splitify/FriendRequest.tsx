import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import supabase from "../../../config/supabaseClient";
import { format } from "date-fns";

const FriendRequest = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [friendRequests, setFriendRequests] = useState([]);
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

  useEffect(() => {
    if (userId) {
      fetchFriendRequests();
    }
  }, [userId]);

  const fetchFriendRequests = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("friend_request")
        .select("adder, addee")
        .eq("addee", userId);
      if (error) throw error;

      const userIds = data.map((request) => request.adder);

      const { data: users, error: userError } = await supabase
        .from("user_credentials")
        .select("user_id, username")
        .in("user_id", userIds);
      if (userError) throw userError;

      const requests = data.map((request) => {
        const user = users.find((user) => user.user_id === request.adder);
        return {
          adder: request.adder,
          addee: request.addee,
          name: user ? user.username : "Unknown",
        };
      });

      setFriendRequests(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAccept = async (adder) => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");

    if (!userId || !adder) {
      console.error("User ID or Adder is not defined");
      return;
    }

    try {

      const { data, error } = await supabase.from("relationships").insert([
        { user1: userId, user2: adder, created_at: formattedDate },
        { user1: adder, user2: userId, created_at: formattedDate },
      ]);

      if (error) {
        console.error("Error inserting into relationships table:", error);
        return;
      }

      // Delete from friend_request table
      const { error: deleteError } = await supabase
        .from("friend_request")
        .delete()
        .eq("adder", adder)
        .eq("addee", userId);

      if (deleteError) {
        console.error("Error deleting from friend_request table:", deleteError);
        return;
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      fetchFriendRequests();
    }
  };

  const handleDecline = async (adder) => {
    try {
      await supabase
        .from("friend_request")
        .delete()
        .eq("adder", adder)
        .eq("addee", userId);
    } catch (error) {
      console.error("Error declining friend request:", error);
    } finally {
      fetchFriendRequests();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriendRequests();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchFriendRequests}
          />
        }
      >
        {friendRequests.length > 0 ? (
          friendRequests.map((request) => (
            <View key={request.adder} style={styles.requestContainer}>
              <Text style={styles.requestText}>
                <Text style={styles.boldText}>{request.name}</Text> sent you a
                friend request.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(request.adder)}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDecline(request.adder)}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noRequestsContainer}>
            <Text style={styles.noRequestsText}>No current friend requests. Add some!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#284452",
  },
  requestContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  requestText: {
    color: "white",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
  },
  declineButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  boldText: {
    fontWeight: "bold",
  },
  noRequestsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noRequestsText: {
    color: "white",
    fontSize: 18,
  },
});

export default FriendRequest;