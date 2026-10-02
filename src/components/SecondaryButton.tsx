import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  onPress?: () => void;
}

export default function SecondaryButton({
  title,
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFF",
    height: 58,
    borderRadius: 18,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#ECECEC",

    marginBottom: 24,
  },

  text: {
    color: "#111",
    fontWeight: "600",
    fontSize: 17,
  },
});