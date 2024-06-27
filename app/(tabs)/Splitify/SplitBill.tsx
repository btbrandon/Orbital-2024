import { useState } from "react";
import { Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from "react-native";

const SplitBill = () => {

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const onRefresh = async () => {
    
    setRefreshing(true);
    // await fetchAmounts();
    setRefreshing(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <Text>Split Bill Page</Text>

      </ScrollView>
    </SafeAreaView>

  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#284452"
  },
});

export default SplitBill;