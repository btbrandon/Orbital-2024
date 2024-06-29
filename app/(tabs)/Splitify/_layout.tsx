import { Stack } from "expo-router";
import React = require("react");

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Splitify" }} />
      <Stack.Screen name="SplitBill" options={{ title: "Split Bill" }} />
    </Stack>
  );
};

export default StackLayout;
