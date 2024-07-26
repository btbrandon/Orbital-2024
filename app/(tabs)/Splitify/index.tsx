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
import { Feather } from "@expo/vector-icons";


const Index = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>();
  const [username, setUsername] = useState<number>();
  const [ioUsTotal, setIoUsTotal] = useState<number>(0);
  const [uomEsTotal, setUomEsTotal] = useState<number>(0);
  const [uomEsDetails, setUomEsDetails] = useState<any[]>([]);
  const [ioUsDetails, setIoUsDetails] = useState<any[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [userBadge, setUserBadge] = useState<string>("");

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAmounts();
    setRefreshing(false);
  };

  const handleSplitBill = () => {
    router.push("../(tabs)/Splitify/SplitBill");
  };

  const handleNotification = () => {
    router.push("../(tabs)/Splitify/Notification")
  }

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

      const fetchUserDetailsById = async (userId) => {
        const { data, error } = await supabase
          .from("user_credentials")
          .select("username, badge, user_id")
          .eq("user_id", userId)
          .single();
  
        if (error) {
          console.error("Error fetching user details:", error.message);
          return null;
        }
  
        return data;
      };
  
      for (const bill of data) {
        let userResponse;
        let userData;
        let username;
        let badge;

        if (bill.owee === userId) {
          uomEs += bill.amount;
          userResponse = await fetchUserDetailsById(bill.ower);
          userData = userResponse;
        username = userData?.username;
        badge = userData?.badge || "No badge yet";
  
          if (uomEsDetailsMap[username]) {
            uomEsDetailsMap[username].amount += bill.amount;
          } else {
            uomEsDetailsMap[username] = { amount: bill.amount, badge, id: userData?.user_id };
          }
        } else if (bill.ower === userId) {
          ioUs += bill.amount;
          userResponse = await fetchUserDetailsById(bill.owee);
          userData = userResponse;
          username = userData?.username;
          badge = userData?.badge || "No badge yet";
  
          if (ioUsDetailsMap[username]) {
            ioUsDetailsMap[username].amount += bill.amount;
          } else {
            ioUsDetailsMap[username] = { amount: bill.amount, badge, id: userData?.user_id };
          }
        }
      }
  
      setIoUsTotal(ioUs);
      setUomEsTotal(uomEs);
      setUomEsDetails(
        Object.entries(uomEsDetailsMap)
          .filter(([_, detail]) => detail.amount > 0)
          .map(([username, detail]) => ({
            username,
            amount: detail.amount,
            badge: detail.badge,
            id: detail.id,
          }))
      );
      setIoUsDetails(
        Object.entries(ioUsDetailsMap).map(([username, detail]) => ({
          username,
          amount: detail.amount,
          badge: detail.badge,
          id: detail.id,
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

      await updateBadgeStatus(oweeId);
      await fetchUserBadge();

    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  const fetchUserBadge = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("user_credentials")
        .select("badge")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      setUserBadge(data?.badge || "No badge yet");
    } catch (error) {
      console.error("Error fetching user badge:", error);
    }
  };

  const updateBadgeStatus = async (userId) => {
    try {
      // Fetch all bills where the user is the owee
      const { data, error } = await supabase
        .from("bill")
        .select("created_at, paid_at")
        .eq("owee", userId);

      if (error) throw error;

      if (data.length === 0) return;

      let totalDays = 0;
      data.forEach((bill) => {
        if (bill.paid_at) {
          const createdAt = new Date(bill.created_at);
          const paidAt = new Date(bill.paid_at);
          totalDays += (paidAt - createdAt) / (1000 * 60 * 60 * 24);
        }
      });
  
      const averageDays = totalDays / data.length;
  
      let badge = "No badge yet";
      if (averageDays <= 1) {
        badge = "gold";
      } else if (averageDays <= 3) {
        badge = "silver";
      }
  
      const { error: updateError } = await supabase
        .from("user_credentials")
        .update({ badge })
        .eq("user_id", userId);
  
      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error updating badge status:", error);
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
        console.error("Error fetching user ID:", IDerror.message);
        return;
      }

      const newUserId = IDdata[0]?.user_id;
      setUserId(newUserId);
      setLoading(false);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Error fetching username:", error);
        return;
      }
      const userEmail = data?.user?.email;

      const { data: IDdata, error: IDerror } = await supabase
        .from("user_credentials")
        .select("username")
        .eq("email", userEmail);

      if (IDerror) {
        console.error("Error fetching username:", IDerror.message);
        return;
      }

      const newUsername = IDdata[0]?.username;
      setUsername(newUsername);
      setLoading(false);
    };

    fetchUsername();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchAmounts();
      fetchUserBadge();
    }
  }, [userId]);

  const renderBadge = (badge) => {
    switch (badge) {
      case "gold":
        return <Feather name="award" size={30} color="gold" />;
      case "silver":
        return <Feather name="award" size={30} color="grey" />;
      case "bronze":
        return <Feather name="award" size={30} color="brown" />;
      default:
        return <Text style={styles.noBadgeText}>{"No badge yet"}</Text>;
    }
  };

return (
  <SafeAreaView style={styles.container}>
    <ScrollView
      contentContainerStyle={{ paddingBottom: 60, flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.header}>Splitify</Text>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>Your Badge: </Text>
        {renderBadge(userBadge)}
      </View>
      <Title style={styles.header2}>I Owe</Title>
        <View>
          {loading ? (
            <ActivityIndicator animating={true} style={styles.loading} />
          ) : (
            <>
              {ioUsDetails.length === 0 ? (
                <Text style={styles.noMoneyText}>You don't owe any money!</Text>
              ) : (
                ioUsDetails.map((detail, index) => (
                  <Card key={index} style={styles.detailItem}>
                    <Card.Content style={styles.cardContent}>
                      <Text style={styles.detailText}>{detail.username}</Text>
                      <Text style={styles.amountTextIOwe}>
                        ${detail.amount.toFixed(2)}
                      </Text>
                    </Card.Content>
                  </Card>
                ))
              )}
              {ioUsTotal > 0 && (
                <Text style={styles.totalText}>
                  Total: ${ioUsTotal.toFixed(2)}
                </Text>
              )}
            </>
          )}
        </View>
        <Title style={styles.header2}>Friends Owe</Title>
        <View>
          {loading ? (
            <ActivityIndicator animating={true} style={styles.loading} />
          ) : (
            <>
              {uomEsDetails.length === 0 ? (
                <Text style={styles.noMoneyText}>No one owes you money!</Text>
              ) : (
                uomEsDetails.map((detail, index) => (
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
                ))
              )}
              {uomEsTotal > 0 && (
                <Text style={styles.totalText}>
                  Total: ${uomEsTotal.toFixed(2)}
                </Text>
              )}
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
    marginVertical: -8,
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
  noMoneyText: {
    color: "#ffffff",
    fontSize: 20,
    alignSelf: "center",
    marginTop: 10,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  noBadgeText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold"
  },
};

export default Index;
