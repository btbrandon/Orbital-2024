import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  Text,
  Title,
  ActivityIndicator,
  IconButton,
  Snackbar,
} from "react-native-paper";
import supabase from "../../../config/supabaseClient";

const Index = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>();
  const [ioUsTotal, setIoUsTotal] = useState<number>(0);
  const [uomEsTotal, setUomEsTotal] = useState<number>(0);
  const [uomEsDetails, setUomEsDetails] = useState<any[]>([]);
  const [ioUsDetails, setIoUsDetails] = useState<any[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAmounts();
    setRefreshing(false);
  };

  const handleSplitBill = () => {
    router.push("../(tabs)/Splitify/SplitBill");
  };

  const fetchAmounts = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("bill")
        .select("owee, ower, amount")
        .or(`owee.eq.${userId},ower.eq.${userId}`);

      if (error) throw error;

      let ioUs = 0;
      let uomEs = 0;
      const uomEsDetailsMap = {};
      const ioUsDetailsMap = {};

      for (const bill of data) {
        if (bill.owee === userId) {
          uomEs += bill.amount;
          const userResponse = await supabase
            .from("user_credentials")
            .select("username")
            .eq("user_id", bill.ower);

          const username = userResponse.data[0]?.username;

          if (uomEsDetailsMap[username]) {
            uomEsDetailsMap[username] += bill.amount;
          } else {
            uomEsDetailsMap[username] = bill.amount;
          }
        } else if (bill.ower === userId) {
          ioUs += bill.amount;
          const userResponse = await supabase
            .from("user_credentials")
            .select("username")
            .eq("user_id", bill.owee);

          const username = userResponse.data[0]?.username;
          if (ioUsDetailsMap[username]) {
            ioUsDetailsMap[username] += bill.amount;
          } else {
            ioUsDetailsMap[username] = bill.amount;
          }
        }
      }

      setIoUsTotal(ioUs);
      setUomEsTotal(uomEs);
      setUomEsDetails(
        Object.entries(uomEsDetailsMap)
          .filter(([_, amount]) => amount > 0)
          .map(([username, amount]) => ({
            username,
            amount,
          }))
      );
      setIoUsDetails(
        Object.entries(ioUsDetailsMap).map(([username, amount]) => ({
          username,
          amount,
        }))
      );
    } catch (error) {
      console.error("Error fetching amounts:", error);
    }
  };

  const fetchUserIdByUsername = async (username: String) => {
    const { data, error } = await supabase
      .from("user_credentials")
      .select("user_id")
      .eq("username", username)
      .single();

    if (error) {
      console.error("Error fetching user ID:", error.message);
      return null;
    }

    return data?.user_id || null;
  };

  const deleteBill = async (oweeId: number, owerId: number) => {
    const { error } = await supabase
      .from("bill")
      .delete()
      .eq("owee", oweeId)
      .eq("ower", owerId);

    if (error) {
      console.error("Error deleting bill:", error.message);
      throw error;
    }
  };

  const handleDelete = async (username: String, amount: number) => {
    try {
      const oweeId = await fetchUserIdByUsername(username);

      if (!oweeId) {
        console.error("User ID to delete is undefined or null.");
        return;
      }

      await deleteBill(userId, oweeId);

      setUomEsDetails(
        uomEsDetails.filter((detail) => detail.username !== username)
      );
      setUomEsTotal(uomEsTotal - amount);
      setSnackbarMessage("Bill deleted successfully!");
      setSnackbarVisible(true);
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Error fetching user:", error);
        return;
      }
      const userEmail = data?.user?.email;

      const { data: IDdata, error: IDerror } = await supabase
        .from("user_credentials")
        .select("user_id")
        .eq("email", userEmail);

      if (IDerror) {
        console.error("Error fetching username:", IDerror.message);
        return;
      }

      const newUserId = IDdata[0]?.user_id;
      setUserId(newUserId);
      setLoading(false);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAmounts();
    }
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Title style={styles.header}>Splitify</Title>
        <Title style={styles.header2}>I Owe</Title>
        <View>
          {loading ? (
            <ActivityIndicator animating={true} style={styles.loading} />
          ) : (
            <>
              {ioUsDetails.map((detail, index) => (
                <Card key={index} style={styles.detailItem}>
                  <Card.Content style={styles.cardContent}>
                    <Text style={styles.detailText}>{detail.username}</Text>
                    <Text style={styles.amountTextIOwe}>
                      ${detail.amount.toFixed(2)}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
              <Text style={styles.totalText}>
                Total: ${ioUsTotal.toFixed(2)}
              </Text>
            </>
          )}
        </View>
        <Title style={styles.header2}>Friends Owe</Title>
        <View>
          {loading ? (
            <ActivityIndicator animating={true} style={styles.loading} />
          ) : (
            <>
              {uomEsDetails.map((detail, index) => (
                <Card key={index} style={styles.detailItem}>
                  <Card.Content style={styles.cardContent}>
                    <Text style={styles.detailText}>{detail.username}</Text>
                    <Text style={styles.amountTextFriendsOwe}>
                      ${detail.amount.toFixed(2)}
                      <IconButton
                        icon="delete"
                        color="red"
                        size={15}
                        style={styles.iconButton}
                        onPress={() =>
                          handleDelete(detail.username, detail.amount)
                        }
                      />
                    </Text>
                  </Card.Content>
                </Card>
              ))}
              <Text style={styles.totalText}>
                Total: ${uomEsTotal.toFixed(2)}
              </Text>
            </>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSplitBill}>
            <Text style={styles.buttonText}>New Bill</Text>
          </TouchableOpacity>
        </View>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#284452",
  },
  header: {
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 25,
    height: 50,
    alignSelf: "center",
    marginTop: 12,
    color: "white",
  },
  header2: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  amountTextFriendsOwe: {
    color: "#d32c47",
    fontWeight: "bold",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: -8,
    marginRight: -20,
  },
  amountTextIOwe: {
    color: "#d32c47",
    fontWeight: "bold",
    alignSelf: "center",
    justifyContent: "center",
    marginRight: 24,
  },
  totalText: {
    marginTop: 10,
    marginRight: 30,
    color: "#ffffff",
    fontWeight: "bold",
    alignSelf: "flex-end",
  },
  loading: {
    marginLeft: "auto",
    marginRight: "auto",
    color: "#ffffff",
  },
  detailItem: {
    margin: 5,
    backgroundColor: "#ffffff",
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 10,
  },
  detailText: {
    color: "#000000",
    fontWeight: "bold",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    color: "white",
  },
  button: {
    backgroundColor: "#121E26",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Calibri",
    fontSize: 12,
  },
  iconButton: {
    marginVertical: -5,
    color: "#ff0000",
  },
};

export default Index;
