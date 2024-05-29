import { Link } from "expo-router";
import React from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import PieChart from "react-native-pie-chart";

const Homepage = () => {
  const widthAndHeight = 250;
  const series = [123, 321, 123, 789, 537];
  const sliceColor = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#a0c4ff"];

  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.header}>Expenses</Text>
        <View style={{ alignItems: "center" }}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={sliceColor}
          />
        </View>
      </View>

      {/* Login */}
      <Link href="/">Login</Link>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc6ff",
  },
  header: {
    fontWeight: "bold",
    fontFamily: "Verdana",
    fontSize: 35,
    height: 50,
    textAlign: "center",
    justifyContent: "center",
    margin: 10,
  },
});

export default Homepage;
