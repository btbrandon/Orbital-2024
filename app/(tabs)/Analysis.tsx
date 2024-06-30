import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import PieChart from "react-native-pie-chart";
import supabase from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Title, IconButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import React from "react";
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";

const Analysis = () => {
  const widthAndHeight = 185;
  const sliceColor = ["#B2DFFB", "#4ECDC4", "#DAC4F7", "#EBD2B4"];
  const categories = ["Food", "Transport", "Clothing", "Others"];

  const categoryColors: { [key: string]: string } = {
    Food: "white",
    Transport: "white",
    Clothing: "white",
    Shopping: "white",
    Others: "white",
  };

  const categoryIcons: { [key: string]: string } = {
    Food: "food",
    Transport: "car",
    Clothing: "tshirt-crew",
    Shopping: "cart",
    Others: "dots-horizontal",
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>();
  const [foodAmount, setFoodAmount] = useState<number>(0);
  const [transportAmount, setTransportAmount] = useState<number>(0);
  const [clothingAmount, setClothingAmount] = useState<number>(0);
  const [otherAmount, setOtherAmount] = useState<number>(0);
  const [dailyTotal, setDailyTotal] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

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

  const fetchAmounts = async () => {
    if (!userId) return;

    setLoading(true);

    const startOfSelectedMonth = startOfMonth(currentMonth);
    const endOfSelectedMonth = endOfMonth(currentMonth);

    try {
      const fetchCategoryAmount = async (category: string) => {
        const { data, error } = await supabase
          .from("expenses")
          .select("itemPrice")
          .eq("user_id", userId)
          .eq("category", category)
          .gte("date", startOfSelectedMonth.toISOString())
          .lte("date", endOfSelectedMonth.toISOString());

        if (error) {
          console.log(`Error fetching ${category} Expenses:`, error);
          return 0;
        }

        return data.reduce((total, item) => total + item.itemPrice, 0);
      };

      const foodTotal = await fetchCategoryAmount("Food");
      const transportTotal = await fetchCategoryAmount("Transport");
      const clothingTotal = await fetchCategoryAmount("Clothing");
      const otherTotal = await fetchCategoryAmount("Others");

      setFoodAmount(foodTotal);
      setTransportAmount(transportTotal);
      setClothingAmount(clothingTotal);
      setOtherAmount(otherTotal);
      setDailyTotal(foodTotal + transportTotal + clothingTotal + otherTotal);
    } catch (error) {
      console.error("Error fetching amounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmounts();
  }, [userId, currentMonth]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAmounts();
    setRefreshing(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const series = [foodAmount, transportAmount, clothingAmount, otherAmount];
  const hasTransactions = series.some((amount) => amount > 0);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          color="#4ECDC4"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.header}>Analytics</Text>
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
          <View style={{ alignItems: "center", margin: 10, marginTop: 0 }}>
            {hasTransactions ? (
              <PieChart
                widthAndHeight={widthAndHeight}
                series={series}
                sliceColor={sliceColor}
                doughnut={true}
                coverRadius={0.5}
                coverFill={"#284452"}
              />
            ) : (
              <Text style={styles.noTransactionsText}>
                No transactions this month.
              </Text>
            )}
          </View>
          {hasTransactions && (
            <>
              <View style={styles.legend}>
                {categories.map((category, index) => (
                  <View key={category} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: sliceColor[index] },
                      ]}
                    />
                    <Text style={styles.legendText}>{category}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.cardSection}>
                {categories.map((category, index) => (
                  <Card
                    key={category}
                    style={[
                      styles.card,
                      {
                        backgroundColor: categoryColors[category] || "#FFFFFF",
                      },
                    ]}
                  >
                    <Card.Content style={styles.cardContent}>
                      <View style={styles.iconContainer}>
                        <Icon
                          name={categoryIcons[category] || "dots-horizontal"}
                          size={40}
                          color="#839dad"
                        />
                      </View>
                      <View style={styles.cardLeft}>
                        <Title style={styles.itemName}>{category}</Title>
                      </View>
                      <View style={styles.cardRight}>
                        <Text
                          style={[
                            styles.priceText,
                            {
                              color:
                                series[index].toFixed(2) < 0
                                  ? "#d32c47"
                                  : "#d32c47",
                            },
                          ]}
                        >
                          {`$${series[index].toFixed(2)}`}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
                <Card style={styles.totalCard}>
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      <Icon name="currency-usd" size={40} color="#839dad" />
                    </View>
                    <View style={styles.cardLeft}>
                      <Title style={styles.itemName}>Total</Title>
                    </View>
                    <View style={styles.cardRight}>
                      <Text
                        style={[
                          styles.priceText,
                          {
                            color:
                              dailyTotal.toFixed(2) < 0 ? "#d32c47" : "#d32c47",
                          },
                        ]}
                      >
                        {`$${dailyTotal.toFixed(2)}`}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            </>
          )}
        </ScrollView>
      )}
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
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#ffffff",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
    paddingVertical: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    marginRight: 5,
  },
  legendColor: {
    borderRadius: 10,
    width: 15,
    height: 15,
    marginRight: 5,
  },
  legendText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Calibri",
  },
  cardSection: {
    padding: 10,
  },
  card: {
    marginBottom: 6,
    height: 55,
  },
  totalCard: {
    marginBottom: 6,
    height: 55,
    backgroundColor: "#FFF",
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
  itemName: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
    paddingLeft: 15,
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
  },
  cardRight: {
    alignItems: "flex-end",
  },
  noTransactionsText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Analysis;
