import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import PieChart from "react-native-pie-chart";
import RecentTransactions from "../../components/RecentTransactions";
import supabase from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";

const Homepage = () => {
  const widthAndHeight = 250;
  const series = [123, 321, 123, 789, 537];
  const sliceColor = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#a0c4ff"];
  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Error fetching user:", error);
        return;
      }
      const userEmail = data?.user?.email;

      const { data: userData, error: userError } = await supabase
        .from("user_credentials")
        .select()
        .eq("email", userEmail)
        .select("username");

      if (userError) {
        console.error("Error fetching username:", userError.message);
        return;
      }

      const newUsername = userData[0]?.username;
      setUsername(newUsername);
      setLoading(false);
    };

    fetchUsername();
  }, []);

  if (loading) {
    return <Text style={styles.header}>Welcome back!</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome back {username}!</Text>
      <View style={{ alignItems: "center", margin: 10, marginTop: 0 }}>
        <PieChart
          widthAndHeight={widthAndHeight}
          series={series}
          sliceColor={sliceColor}
        />
      </View>
      <Text style={styles.header2}>Recent Transactions</Text>
      <RecentTransactions />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    fontWeight: "bold",
    fontFamily: "Verdana",
    fontSize: 20,
    height: 50,
    alignSelf: "center",
  },
  header2: {
    fontFamily: "Verdana",
    fontSize: 13,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 5,
  },
});

export default Homepage;
