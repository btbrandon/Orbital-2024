import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Platform, ActivityIndicator } from "react-native";
import RecentTransactions from "../../components/RecentTransactions";
import supabase from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns/format";

const Homepage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<number>();
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchUsernameId = async () => {
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

      const { data: IDdata, error: IDerror } = await supabase
        .from("user_credentials")
        .select()
        .eq("email", userEmail)
        .select("user_id");

      if (IDerror) {
        console.error("Error fetching username:", IDerror.message);
        return;
      }

      const newUserId = IDdata[0]?.user_id;
      setUserId(newUserId);
      setLoading(false);
    };
    fetchUsernameId();
  }, []);

  useEffect(() => {
    const fetchTotal = async () => {
      const today = new Date();
      const formattedDate = format(today, "yyyy-MM");
      const { data, error } = await supabase
        .from("expenses")
        .select("itemPrice")
        .eq("user_id", userId)
        .ilike("date", `${formattedDate}%`);

      if (error) {
        console.error("Error fetching transactions:", error.message);
        return;
      }

      const total = data.reduce((acc, expense) => acc + expense.itemPrice, 0);
      setTotal(total);
    };
    if (userId) {
      fetchTotal();
    }
  });

  if (loading) {
    return (
      <ActivityIndicator animating={true} style={{ alignSelf: "center" }} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome back, {username}!</Text>
      <View style={styles.expenseContainer}>
        <Text style={styles.header2}>This Month's Expenses</Text>
        <View style={styles.separator}></View>
        <Text style={styles.text}>${total.toFixed(2)}</Text>
      </View>
      <Text style={{ ...styles.header3, alignSelf: "flex-start" }}>Recent Transactions</Text>
      <RecentTransactions />
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
    marginTop: 10,
    color: "white"
  },
  header2: {
    fontFamily: "Calibri",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 5,
    alignSelf: "center",
    color: "white",
    paddingTop: 5
  },
  header3: {
    fontFamily: "Calibri",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 5,
    alignSelf: "flex-start",
    color: "white",
    paddingTop: 30
  },
  expenseContainer: {
    backgroundColor: "#121E26",
    padding: 12,
    justifyContent: "flex-start",
    fontWeight: "bold",
    fontFamily: "Verdana",
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  text: {
    paddingHorizontal: 5,
    fontSize: 45,
    fontFamily: "CALIBRI",
    fontWeight: "bold",
    paddingLeft: 18,
    margin: 10,
    color: "white",
    },
  separator: {
    marginVertical: 2,
    width: "100%",
  },
});

export default Homepage;