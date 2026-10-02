import React from "react";
import {
  SafeAreaView,
  ScrollView,
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Calibrating sensors</Text>
          <Text style={styles.subtitle}>6 of 8 connected</Text>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },

  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 18,
    color: "#6B6B6B",
    marginBottom: 24,
  },

  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  sensorBox: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: "700",
  },

  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginBottom: 24,
  },

  stepTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  description: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  button: {
    width: "100%",
    height: 60,
    backgroundColor: "#111",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },
});