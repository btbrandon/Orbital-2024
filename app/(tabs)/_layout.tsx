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
          fontSize: 14,
        },
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen name="Homepage" options={{ title: "Home" }} />
      <Tabs.Screen name="NewExpense" options={{ title: "New Expense" }} />
      <Tabs.Screen name="AllTransactions" options={{ title: "History" }} />
      <Tabs.Screen name="Settings" />
    </Tabs>
  );
};

export default TabsLayout;
