import { Link, router } from "expo-router";
import React from "react";
import { Text, View, StyleSheet, ScrollView, Button } from "react-native";
import PieChart from "react-native-pie-chart";

const Homepage = () => {
  const widthAndHeight = 250;
  const series = [123, 321, 123, 789, 537];
  const sliceColor = ["#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", "#a0c4ff"];

  const handleNewExpense = async () => {
    router.replace("NewExpense");
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <View style={{ alignItems: "center", margin: 10 }}>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={sliceColor}
          />
        </View>
      </View>

      {/* Add Expense */}
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <Button
            title="New Expense"
            color="#FFFFFF"
            onPress={handleNewExpense}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="others" color="#FFFFFF" />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  buttonContainer: {
    backgroundColor: "#274653",
    padding: 5,
    justifyContent: "center",
    fontWeight: "bold",
    fontFamily: "Verdana",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignContent: "center",
    padding: 5,
  },
});

export default Homepage;
