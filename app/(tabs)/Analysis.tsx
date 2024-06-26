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
import { Card, Paragraph, Title } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const Analysis = () => {
  const widthAndHeight = 200;
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
  const [foodAmount, setFoodAmount] = useState<number>();
  const [transportAmount, setTransportAmount] = useState<number>();
  const [clothingAmount, setClothingAmount] = useState<number>();
  const [otherAmount, setOtherAmount] = useState<number>();
  const [dailyTotal, setDailyTotal] = useState<number>();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsername = async () => {
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

    fetchUsername();
  }, []);

  const fetchAmounts = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const fetchCategoryAmount = async (category: string) => {
        const { data, error } = await supabase
          .from("expenses")
          .select("itemPrice")
          .eq("user_id", userId)
          .eq("category", category);

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
  }, [userId]);

  const series = [foodAmount, transportAmount, clothingAmount, otherAmount];

  if (loading) {
    return (
      <ActivityIndicator animating={true} style={{ alignSelf: "center" }} />
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAmounts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ alignItems: "center", margin: 10, marginTop: 0 }}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={sliceColor}
            doughnut={true}
            coverRadius={0.5}
            coverFill={"#284452"}
          />
        </View>
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
                { backgroundColor: categoryColors[category] || "#FFFFFF" },
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
                          series[index].toFixed(2) < 0 ? "#d32c47" : "#d32c47",
                      }, //to do
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
                      color: dailyTotal.toFixed(2) < 0 ? "#d32c47" : "#d32c47",
                    }, //to do
                  ]}
                >
                  {`$${dailyTotal.toFixed(2)}`}
                </Text>
              </View>
            </Card.Content>
          </Card>
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
    fontFamily: "Verdana",
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
});

export default Analysis;
