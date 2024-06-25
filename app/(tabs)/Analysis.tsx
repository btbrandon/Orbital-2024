import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import PieChart from "react-native-pie-chart";
import supabase from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";

const Analysis = () => {
  const widthAndHeight = 200;
  const sliceColor = ["#D6F6DD", "#4ECDC4", "#DAC4F7", "#EBD2B4"];
  // "#C44536"
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>();

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

  const [foodAmount, setFoodAmount] = useState<number>();
  const [transportAmount, setTransportAmount] = useState<number>();
  const [clothingAmount, setClothingAmount] = useState<number>();
  const [otherAmount, setOtherAmount] = useState<number>();
  const [dailyTotal, setDailyTotal] = useState<number>();

  useEffect(() => {
    const fetchFoodAmount = async () => {
      setLoading(true);
      const { data: FoodData, error: FoodError } = await supabase
        .from("expenses")
        .select("itemPrice")
        .eq("user_id", userId)
        .eq("category", "Food");

      if (FoodError) {
        console.log("Unexpected error retrieving Food Expenses:" + FoodError);
        setLoading(false);
        return;
      }
      const foodTotal = FoodData[1].itemPrice;
      console.log(foodTotal);
      setFoodAmount(foodTotal);
      setLoading(false);
    }});

    useEffect(() => {
      const fetchAmounts = async () => {
        if (!userId) return;
  
        setLoading(true);
  
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
  
        setLoading(false);
      };
  
      fetchAmounts();
    }, [userId]);
  
    const series = [foodAmount, transportAmount, clothingAmount, otherAmount];
    const categories = ["Food", "Transport", "Clothing", "Others"];
    
    if (loading) {
      return (
        <ActivityIndicator animating={true} style={{ alignSelf: "center" }} />
      );
    }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{ alignItems: "center", margin: 10, marginTop: 0 }}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={sliceColor}
          />
        </View>
        <View style={styles.legend}>
            {categories.map((category, index) => (
              <View key={category} style={styles.legendItem}>
                <View
                  style={[styles.legendColor, { backgroundColor: sliceColor[index] }]}
                />
                <Text style={styles.legendText}>{category}</Text>
              </View>
            ))}
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
    marginTop: 20,
    alignItems: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  legendText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Verdana",
  },
});

export default Analysis;
