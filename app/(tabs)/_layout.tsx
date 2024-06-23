import { Tabs } from "expo-router";
import React from "react";
import { BlurView } from "expo-blur";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ff6c00", // Set the active tint color
        tabBarInactiveTintColor: "#000", // Set the inactive tint color (optional)
        tabBarBackground: () => <BlurView tint="light" intensity={100} />,
        tabBarLabelStyle: {
          fontSize: 14, // Adjust the label size
        },
        tabBarStyle: {
          height: 60, // Adjust the tab bar height
          paddingBottom: 10,
          paddingTop: 10,
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen name="Homepage" options={{ title: "Home" }} />
      <Tabs.Screen name="NewExpense" options={{ title: "New Expense" }} />
      <Tabs.Screen name="Profile" />
    </Tabs>
  );
};

export default TabsLayout;
