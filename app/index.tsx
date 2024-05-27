import React from "react";
import { Text, TextInput, View, Button, Image, StyleSheet } from "react-native";
import { Link } from "expo-router";

const Login = () => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/Logo.png")} style={styles.image} />
      <Text style={styles.header}>Login</Text>

      {/* Username */}
      <View style={styles.loginInputContainer}>
        <Text style={styles.text}>Username</Text>
        <View style={styles.row}>
          <Image
            source={require("../assets/username.png")}
            style={styles.icon}
          />
          <TextInput placeholder="Username" style={styles.textInput} />
        </View>
      </View>

      {/* Password */}
      <View style={styles.loginInputContainer}>
        <Text style={styles.text}>Password</Text>
        <View style={styles.row}>
          <Image
            source={require("../assets/password.png")}
            style={styles.icon}
          />
          <TextInput
            secureTextEntry={true}
            placeholder="Password"
            style={styles.textInput}
          />
        </View>
      </View>

      {/* Don't have an account? / Forgot your password? */}
      <View style={styles.linkContainer}>
        <Link href="Signup" style={styles.leftLink}>
          Don't have an account?
        </Link>

        <Link href="ForgotPassword" style={styles.rightLink}>
          Forgot your password?
        </Link>
      </View>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="LOGIN"
          onPress={() => alert("Login pressed!")}
          color="#FFFFFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DDA0DD",
  },

  header: {
    fontWeight: "bold",
    fontFamily: "Verdana",
    fontSize: 35,
    height: 50,
    textAlign: "center",
    justifyContent: "center",
  },

  buttonContainer: {
    backgroundColor: "#212121",
    padding: 10,
    justifyContent: "center",
    fontWeight: "bold",
    fontFamily: "Verdana",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 15,
  },

  loginInputContainer: {
    backgroundColor: "white",
    fontSize: 20,
    margin: 10,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "white",
    textAlign: "left",
    fontFamily: "Verdana",
  },

  row: {
    flexDirection: "row",
    margin: 5,
  },

  text: {
    marginLeft: 10,
    backgroundColor: "white",
    fontSize: 18,
    textAlign: "left",
    fontFamily: "Verdana",
  },

  image: {
    width: 100,
    height: 100,
    margin: 30,
    marginTop: 70,
    alignSelf: "center",
  },

  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },

  textInput: { fontSize: 15, fontFamily: "Verdana" },

  linkContainer: {
    flexDirection: "row",
    margin: 5,
    marginBottom: 30,
    justifyContent: "space-between",
  },

  leftLink: {
    textAlign: "left",
    marginLeft: 10,
  },

  rightLink: {
    textAlign: "right",
    marginRight: 10,
  },
});

export default Login;
