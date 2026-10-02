import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

const sensors = [
  { id: "01", connected: true },
  { id: "02", connected: true },
  { id: "03", connected: true },
  { id: "04", connected: false },
  { id: "05", connected: true },
  { id: "06", connected: true },
  { id: "07", connected: false },
  { id: "08", connected: true },
];

export default function CalibrationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Calibrating sensors</Text>

        <Text style={styles.subtitle}>6 of 8 connected</Text>

        {/* Sensor Grid */}
        <View style={styles.grid}>
          {sensors.map((sensor) => (
            <View
              key={sensor.id}
              style={[
                styles.sensorBox,
                sensor.connected
                  ? styles.connectedBox
                  : styles.disconnectedBox,
              ]}
            >
              <Text
                style={[
                  styles.sensorText,
                  {
                    color: sensor.connected ? "#1F5DAA" : "#808080",
                  },
                ]}
              >
                {sensor.id}
              </Text>
            </View>
          ))}
        </View>

        {/* Human Placeholder */}
        <View style={styles.circle} />

        <Text style={styles.stepTitle}>Step 1 — T-pose</Text>

        <Text style={styles.description}>
          Extend your arms horizontally and hold still.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/live")}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const BOX_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    padding: 20,
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 34,
    alignItems: "center",
  },

  title: {
    fontSize: 42,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 22,
    color: "#6B6B6B",
    marginBottom: 28,
  },

  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 40,
  },

  sensorBox: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  connectedBox: {
    backgroundColor: "#CFE4FF",
    borderWidth: 1,
    borderColor: "#8DBAFF",
  },

  disconnectedBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },

  sensorText: {
    fontSize: 24,
    fontWeight: "700",
  },

  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginBottom: 48,
  },

  stepTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111",
  },

  description: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 20,
    color: "#555",
    lineHeight: 30,
    paddingHorizontal: 20,
  },

  button: {
    marginTop: "auto",
    width: "100%",
    height: 72,
    backgroundColor: "#111",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "700",
  },
});