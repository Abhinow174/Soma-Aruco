import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  value: string;
}

export default function SmallStatCard({
  title,
  value,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    backgroundColor: "#FFF",

    borderRadius: 22,

    borderWidth: 1,

    borderColor: "#ECECEC",

    padding: 18,

    height: 120,
  },

  title: {
    color: "#777",

    fontSize: 14,
  },

  value: {
    marginTop: 12,

    fontSize: 30,

    fontWeight: "700",

    color: "#111",
  },
});