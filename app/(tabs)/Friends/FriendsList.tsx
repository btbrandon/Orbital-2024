import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  RefreshControl,
} from "react-native";
import { Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import supabase from "../../../config/supabaseClient";

const FriendsList = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [friends, setFriends] = useState([]);
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
      fetchFriends();
    }
  }, [userId]);

  const fetchFriends = async () => {
    setRefreshing(true);
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
    } finally {
      setRefreshing(false);
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
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View>
          <Text style={styles.sectionTitle}>Friends List</Text>
          {refreshing ? (
            <ActivityIndicator animating={true} color="#fff" />
          ) : friends.length > 0 ? (
            friends.map((friend) => (
              <Card key={friend.user_id} style={styles.card}>
                <Card.Content>
                  <Title>{friend.username}</Title>
                </Card.Content>
              </Card>
            ))
          ) : (
            <View style={styles.noFriendsContainer}>
              <Text style={styles.noFriendsText}>No friends added yet. Add some!</Text>
            </View>
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
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 30,
    marginLeft: 20,
  },
  card: {
    margin: 10,
    backgroundColor: "white",
  },
  noFriendsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noFriendsText: {
    color: "white",
    fontSize: 16,
  },
});

export default FriendsList;