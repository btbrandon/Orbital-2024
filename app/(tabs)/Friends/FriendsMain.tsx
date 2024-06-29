import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import supabase from "../../../config/supabaseClient";

const index = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>();
  const [friends, setFriends] = useState([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  };

  const handleAddFriend = () => {
    router.push("/(tabs)/Friends/AddFriend");
  };

  const handleFriendRequest = () => {
    router.push("/(tabs)/Friends/FriendRequest");
  };

  const fetchFriends = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("relationships")
        .select("user2")
        .eq("user1", userId);

      if (error) throw error;

      const friendIds = data.map((relationship) => relationship.user2);

      const { data: friendsData, error: friendsError } = await supabase
        .from("user_credentials")
        .select("user_id, username")
        .in("user_id", friendIds);

      if (friendsError) throw friendsError;

      setFriends(friendsData);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // get this User's ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Error fetching user:", error);
        return;
      }
      const userEmail = data?.user?.email;

      const { data: IDdata, error: IDerror } = await supabase
        .from("user_credentials")
        .select("user_id")
        .eq("email", userEmail);

      if (IDerror) {
        console.error("Error fetching username:", IDerror.message);
        return;
      }

      const newUserId = IDdata[0]?.user_id;
      setUserId(newUserId);
      setLoading(false);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFriends();
    }
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.header}>Friends</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleAddFriend}>
            <Text style={styles.buttonText}>Add Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleFriendRequest}>
            <Text style={styles.buttonText}>Friend Requests</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header2}>Friends List</Text>
        <View>
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <View key={friend.user_id} style={styles.friendItem}>
                <Text style={styles.friendText}>{friend.username}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noFriendsText}>No friends added yet.</Text>
          )}
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
  header: {
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 25,
    height: 50,
    alignSelf: "center",
    marginTop: 12,
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#121E26",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Verdana",
    fontSize: 12,
  },
  header2: {
    fontFamily: "Calibri",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 5,
    alignSelf: "flex-start",
    color: "white",
    paddingTop: 30,
  },
  friendItem: {
    backgroundColor: "#121E26",
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 15,
    borderRadius: 5,
  },
  friendText: {
    color: "#FFF",
    fontFamily: "Verdana",
    fontSize: 16,
  },
  loadingText: {
    color: "white",
    fontFamily: "Verdana",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  noFriendsText: {
    color: "white",
    fontFamily: "Verdana",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});

export default index;