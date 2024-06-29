import { Stack } from "expo-router";
import React = require("react");

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AllTransactionsMain"
        options={{ title: "All Transactions" }}
      />
      <Stack.Screen name="EditExpense" options={{ title: "Edit Expense" }} />
    </Stack>
  );
};

export default StackLayout;
