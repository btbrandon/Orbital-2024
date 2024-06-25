import { useEffect, useState } from "react";
import { Platform, View, StyleSheet, ScrollView } from "react-native";
import PieChart from "react-native-pie-chart";
import supabase from "../../config/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";

const Analysis = () => {
  const widthAndHeight = 200;
  const series = [123, 321, 123, 789, 537];
  const sliceColor = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6BCB77", "#C44536"];
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

    fetchUsername();
  }, []);

  const [foodAmount, setFoodAmount] = useState<number>();
  const [transportAmount, setTransportAmount] = useState<number>();
  const [clothingAmount, setClothingAmount] = useState<number>();
  const [otherAmount, setOtherAmount] = useState<number>();
  const [dailyTotal, setDailyTotal] = useState<number>();

  // const foodAmount = 150;
  // const transportAmount = 75;
  // const clothingAmount = 100;
  // const otherAmount = 50;
  // const dailyTotalAmount = 25;
  // const monthlyTotal =
  //   foodAmount + transportAmount + clothingAmount + otherAmount;

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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default Analysis;
