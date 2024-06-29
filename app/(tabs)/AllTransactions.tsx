import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  Platform,
} from "react-native";
import {
  IconButton,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import supabase from "../../config/supabaseClient";
import { format, subMonths, addMonths } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";
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

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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
      fetchTransactions();
    }
  }, [userId, currentMonth]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("transactionId", { ascending: false });

    if (error) {
      console.error("Error fetching transactions:", error.message);
      setLoading(false);
      return;
    }

    setTransactions(data);
    setLoading(false);
  };

  const filterTransactionsByMonth = (transactions: any[], month: Date) => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    });
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card
      style={[
        styles.card,
        { backgroundColor: categoryColors[item.category] || "#EBD2B4" },
      ]}
    >
      <Card.Content>
        <View style={styles.cardContent}>
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
              Date: {item.date.substring(5, 15)}
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
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <ActivityIndicator animating={true} style={{ alignSelf: "center" }} />
    );
  }

  const filteredTransactions = filterTransactionsByMonth(
    transactions,
    currentMonth
  );

  return loading ? (
    <ActivityIndicator
      animating={true}
      size="large"
      color="#4ECDC4"
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    />
  ) : (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Monthly Transactions</Text>
      <View style={styles.navigation}>
        <IconButton
          icon="chevron-left"
          size={30}
          onPress={handlePrevMonth}
          iconColor="white"
        />
        <Text style={styles.monthLabel}>
          {format(currentMonth, "MMMM yyyy")}
        </Text>
        <IconButton
          icon="chevron-right"
          size={30}
          onPress={handleNextMonth}
          iconColor="white"
        />
      </View>
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: "#284452",
    flex: 1,
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
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    color: "white",
  },
  monthLabel: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#ffffff",
  },
  card: {
    marginBottom: 6,
    height: 80,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    paddingRight: 10,
    paddingBottom: 16,
  },
  cardLeft: {
    flex: 1,
    justifyContent: "center",
  },
  cardRight: {
    justifyContent: "center",
  },
  itemName: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  itemDetails: {
    color: "#000000",
    fontSize: 14,
    paddingBottom: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    paddingBottom: 12,
  },
});

export default TransactionScreen;
