import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function DenoiserCard() {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name="tune"
            size={22}
            color="#444"
          />
        </View>

        <Text style={styles.title}>Denoiser mode</Text>
      </View>

      <Text style={styles.value}>Algorithmic</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#ECECEC",

    marginBottom: 22,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
  },

  value: {
    fontSize: 15,
    color: "#666",
  },
});