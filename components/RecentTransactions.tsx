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

const categoryColors: { [key: string]: string } = {
  Food: "#FF6B6B",
  Transport: "#4ECDC4",
  Clothing: "#FFE66D",
  Shopping: "#6BCB77",
  Others: "#C44536",
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
      .limit(3);

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
      <Card.Content>
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Title style={styles.itemName}>{item.itemName}</Title>
            <Paragraph style={styles.itemDetails}>
              Type: {item.category}
            </Paragraph>
            <Paragraph style={styles.itemDetails}>
              Time: {item.time.substring(0, 5)}
            </Paragraph>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.priceText}>-${item.itemPrice.toFixed(2)}</Text>
          </View>
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
    padding: 16,
    backgroundColor: "white",
    flex: 1,
  },
  card: {
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  itemName: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "bold",
  },
  itemDetails: {
    color: "#000000",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000F",
  },
});

export default RecentExpenses;
