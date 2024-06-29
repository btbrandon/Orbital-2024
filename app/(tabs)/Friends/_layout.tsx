import { Stack } from "expo-router";

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}> 
      <Stack.Screen name="FriendsMain" options={{ title: "Friends" }} />
      <Stack.Screen name="AddFriend" options={{ title: "Add Friend" }} />
    </Stack>
  );
};

export default StackLayout;