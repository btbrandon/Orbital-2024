import React from "react";
import {
  TouchableOpacity,
  Text,
  GestureResponderEvent,
  StyleSheet,
} from "react-native";

interface SmallCustomButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
}

const SmallCustomButton: React.FC<SmallCustomButtonProps> = ({
  title,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    fontFamily: "Verdana",
    fontSize: 12,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default SmallCustomButton;
