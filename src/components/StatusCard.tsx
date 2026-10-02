import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StatusCard() {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <View style={styles.blueDot} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>8 of 8 sensors connected</Text>
          <Text style={styles.subtitle}>Ready for calibration</Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#B0B0B0"
      />
    </TouchableOpacity>
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

    marginBottom: 18,

    borderWidth: 1,
    borderColor: "#ECECEC",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  blueDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#3B82F6",
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },
});