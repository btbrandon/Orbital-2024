import { Tabs } from "expo-router";
import React from "react";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ff6c00",
        tabBarInactiveTintColor: "#000",
        tabBarActiveBackgroundColor: "white",
        tabBarLabelStyle: {
          fontSize: 10,
        },
        tabBarStyle: {
          height: 80,
          paddingBottom: 30,
          paddingTop: 0,
          marginTop: 5,
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen name="Homepage" options={{ title: "Home" }} />
      <Tabs.Screen name="NewExpense" options={{ title: "New Expense" }} />
      <Tabs.Screen name="Analysis" options={{ title: "Analysis" }} />
      <Tabs.Screen name="AllTransactions" options={{ title: "History" }} />
      <Tabs.Screen name="Settings" />
    </Tabs>
  );
};

export default TabsLayout;
