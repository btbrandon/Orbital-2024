import { Tabs } from "expo-router";
import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#c4c9cf",
        tabBarInactiveTintColor: "#000",
        tabBarStyle: {
          height: 75,
          paddingTop: 20,
          marginHorizontal: 0,
          marginBottom: 0,
          borderRadius: 0,
          position: "absolute",
          backgroundColor: "rgba(255, 255, 255, 1)",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: ({ focused }) => ({
          borderRadius: 30,
          backgroundColor: focused ? "black" : "transparent",
          marginHorizontal: focused ? 5 : 0,
        }),
      }}
    >
      <Tabs.Screen
        name="Homepage"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="NewExpense"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Analysis"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-bar"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="AllTransactions"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="Splitify"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="call-split"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Friends"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
