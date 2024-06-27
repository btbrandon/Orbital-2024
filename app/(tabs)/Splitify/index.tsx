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

// 1. Add Friends
// 2. Accept Friends
// 3. Create Bill
// 4. Track how much I owe people
// 5. Track how much people owe me
// 6. Way to remove bills once paid

const index = () => {
  
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>();

  const onRefresh = async () => {
    
    setRefreshing(true);
    // await fetchAmounts();
    setRefreshing(false);
  };

  const handleAddFriend = () => {
    router.push('../(tabs)/Splitify/AddFriend');
  };

  const handleFriendRequest = () => {
    router.push('../(tabs)/Splitify/FriendRequest');
  };

  const handleSplitBill = () => {
    router.push('../(tabs)/Splitify/SplitBill');
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleAddFriend}>
            <Text style={styles.buttonText}>Add Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleFriendRequest}>
            <Text style={styles.buttonText}>View Friend Requests</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>IoUs</Text>
        <View>
        </View>
          <Text style={styles.header}>UoMEs</Text>
        <View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.newBillButton} onPress={handleSplitBill}>
            <Text style={styles.newBillButtonText}>Split New Bill</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#284452"
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
  newBillButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Verdana",
    fontSize: 16,
  },
  newBillButton: {
    backgroundColor: "#121E26",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 10,
    alignItems: "center",
  },
  header: {
    fontFamily: "Calibri",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 5,
    alignSelf: "flex-start",
    color: "white",
    paddingTop: 30
  },
});

export default index;