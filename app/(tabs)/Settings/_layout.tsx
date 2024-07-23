import { Stack } from "expo-router";
import React = require("react");

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen
        name="ConfirmPassword"
        options={{ title: "Confirm Password" }}
      />
      <Stack.Screen
        name="ChangeCredentials"
        options={{ title: "Change Credentials" }}
      />
    </Stack>
  );
};

export default StackLayout;
