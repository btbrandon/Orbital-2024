import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import supabase from "../config/supabaseClient";
import { format } from "date-fns";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Import the icon library

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

const RecentExpenses = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userId, setUserId] = useState<number>();

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
        .select()
        .eq("email", userEmail)
        .select("user_id");

      if (userError) {
        console.error("Error fetching user ID:", userError.message);
        return;
      }

      const newUserId = userData[0]?.user_id;
      setUserId(newUserId);
    };

    fetchUserId();
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");

  const fetchExpenses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("category, itemPrice, itemName, date, time")
      .eq("user_id", userId)
      .eq("date", today)
      .order("time", { ascending: false })
      .limit(5);

    if (error) {
      console.log(userId);
      console.error("fetchExpenses: " + error + error.message);
    } else {
      setExpenses(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  useEffect(() => {
    if (userId) {
      fetchExpenses();
    }
  }, [userId]);

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
              { color: item.itemPrice < 0 ? "#d32c47" : "#d32c47" }, //to do
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
    <View style={styles.container}>
      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    backgroundColor: "#284452",
    flex: 1,
  },
  card: {
    marginBottom: 6,
    height: 80,

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
    paddingLeft: 15
  },
  itemDetails: {
    color: "black",
    fontSize: 12,
    paddingLeft: 15
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "center",
    paddingRight: 10,

  },
});

export default RecentExpenses;
