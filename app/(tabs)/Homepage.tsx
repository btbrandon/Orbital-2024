import React, { useEffect, useState } from "react";
import { View, StyleSheet, RefreshControl, FlatList } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import supabase from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Homepage = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState<number>();
  const [total, setTotal] = useState<number>(0);
  const [expenses, setExpenses] = useState<any[]>([]);

  const fetchUsernameId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.log("Error fetching user:", error);
      return;
    }
    const userEmail = data?.user?.email;

    const { data: userData, error: userError } = await supabase
      .from("user_credentials")
      .select("username, user_id")
      .eq("email", userEmail);

    if (userError) {
      console.error("Error fetching user data:", userError.message);
      return;
    }

    const newUsername = userData[0]?.username;
    const newUserId = userData[0]?.user_id;
    setUsername(newUsername);
    setUserId(newUserId);
    setLoading(false);
  };

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

  const fetchExpenses = async () => {
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("expenses")
      .select("category, itemPrice, itemName, date, time")
      .eq("user_id", userId)
      .eq("date", formattedDate)
      .order("time", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching expenses:", error.message);
    } else {
      setExpenses(data);
    }
  };

  useEffect(() => {
    fetchUsernameId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTotal();
      fetchExpenses();
    }
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsernameId();
    if (userId) {
      await fetchTotal();
      await fetchExpenses();
    }
    setRefreshing(false);
  };

  const categoryIcons: { [key: string]: string } = {
    Food: "food",
    Transport: "car",
    Clothing: "tshirt-crew",
    Shopping: "cart",
    Others: "dots-horizontal",
  };

  const categoryColors: { [key: string]: string } = {
    Food: "white",
    Transport: "white",
    Clothing: "white",
    Shopping: "white",
    Others: "white",
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card
      style={[
        styles.card,
        { backgroundColor: categoryColors[item.category] || "#FFFFFF" },
      ]}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Icon
            name={categoryIcons[item.category] || "dots-horizontal"}
            size={40}
            color="#839dad"
          />
        </View>
        <View style={styles.cardLeft}>
          <Title style={styles.itemName}>{item.itemName}</Title>
          <Paragraph style={styles.itemDetails}>
            {item.time.substring(0, 5)}
          </Paragraph>
        </View>
        <View style={styles.cardRight}>
          <Text
            style={[
              styles.priceText,
              { color: item.itemPrice < 0 ? "#d32c47" : "#d32c47" },
            ]}
          >
            {item.itemPrice < 0
              ? `-$${Math.abs(item.itemPrice).toFixed(2)}`
              : `-$${item.itemPrice.toFixed(2)}`}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <ActivityIndicator animating={true} style={{ alignSelf: "center" }} />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={expenses}
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Welcome back, {username}!</Text>
            <View style={styles.expenseContainer}>
              <Text style={styles.header2}>This Month's Expenses</Text>
              <View style={styles.separator}></View>
              <Text style={styles.text}>${total.toFixed(2)}</Text>
            </View>
            <Text style={{ ...styles.header3, alignSelf: "flex-start" }}>
              Recent Transactions
            </Text>
          </>
        }
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.noTransactionsText}>
            No transactions today! 😄
          </Text>
        }
      />
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
  header2: {
    fontFamily: "Calibri",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 5,
    alignSelf: "center",
    color: "white",
    paddingTop: 5,
  },
  header3: {
    fontFamily: "Calibri",
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginTop: 5,
    alignSelf: "flex-start",
    color: "white",
    paddingTop: 10,
    paddingBottom: 5,
  },
  expenseContainer: {
    backgroundColor: "#121E26",
    padding: 12,
    justifyContent: "flex-start",
    fontWeight: "bold",
    fontFamily: "Calibri",
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    alignSelf: "center",
  },
  text: {
    paddingHorizontal: 5,
    fontSize: 45,
    fontFamily: "Calibri",
    fontWeight: "bold",
    paddingLeft: 18,
    margin: 10,
    color: "white",
  },
  separator: {
    marginVertical: 2,
    width: "100%",
  },
  container2: {
    padding: 4,
    backgroundColor: "#284452",
    flex: 1,
  },
  card: {
    marginBottom: 6,
    height: 70,
    marginTop: 0,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  iconContainer: {
    paddingLeft: 10,
    alignSelf: "center",
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  itemName: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    paddingLeft: 15,
    paddingTop: 4,
    marginBottom: -5,
  },
  itemDetails: {
    color: "black",
    fontSize: 12,
    paddingLeft: 15,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "center",
    paddingRight: 10,
    paddingTop: 4,
  },
  noTransactionsText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
    fontFamily: "Calibri",
  },
});

export default Homepage;
