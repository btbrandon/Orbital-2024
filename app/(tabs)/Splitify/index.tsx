import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { Button, Card, Text, Title, ActivityIndicator } from 'react-native-paper';
import supabase from "../../../config/supabaseClient";

const Index = () => {
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<number>();
  const [ioUsTotal, setIoUsTotal] = useState<number>(0);
  const [uomEsTotal, setUomEsTotal] = useState<number>(0);
  const [uomEsDetails, setUomEsDetails] = useState<any[]>([]);

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
      const details = {};

      for (const bill of data) {
        if (bill.owee === userId) {
          ioUs += bill.amount;
        } else if (bill.ower === userId) {
          uomEs += bill.amount;
          const userResponse = await supabase
            .from("user_credentials")
            .select("username")
            .eq("user_id", bill.owee);

          const username = userResponse.data[0]?.username;

          if (details[username]) {
            details[username] += bill.amount;
          } else {
            details[username] = bill.amount;
          }
        }
      }

      setIoUsTotal(ioUs);
      setUomEsTotal(uomEs);
      setUomEsDetails(Object.entries(details).map(([username, amount]) => ({ username, amount })));
    } catch (error) {
      console.error("Error fetching amounts:", error);
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
        <Title style={styles.header2}>IoUs</Title>
        <View>
          {loading ? (
            <ActivityIndicator animating={true} style={styles.loading} />
          ) : (
            <Text style={styles.amountText}>${ioUsTotal.toFixed(2)}</Text>
          )}
        </View>
        <Title style={styles.header2}>UoMEs</Title>
        <View>
          {loading ? (
            <ActivityIndicator animating={true} style={styles.loading} />
          ) : (
            <>
              <Text style={styles.amountText}>${uomEsTotal.toFixed(2)}</Text>
              {uomEsDetails.map((detail, index) => (
                <Card key={index} style={styles.detailItem}>
                  <Card.Content>
                    <Text style={styles.detailText}>
                      {detail.username}: ${detail.amount.toFixed(2)}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSplitBill}
            style={styles.newBillButton}
          >
            Split New Bill
          </Button>
        </View>
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
    marginTop: 20,
    marginBottom: 10,
    color: "#ffffff",
  },
  amountText: {
    marginLeft: 15,
    color: "#ffffff",
  },
  loading: {
    marginLeft: 'auto',
    marginRight: 'auto',
    color: "#ffffff",
  },
  detailItem: {
    margin: 10,
    backgroundColor: "#121E26",
    color: "#ffffff",
  },
  detailText: {
    color: "#ffffff",
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: "white"
  },
  newBillButton: {
    color: "#ffffff",
  },
};

export default Index;