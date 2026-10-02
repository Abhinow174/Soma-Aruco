import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Circle,
  HardDrive,
  ArrowLeft,
} from "lucide-react-native";

export default function LiveScreen() {
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Live Capture</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* Preview */}

      <View style={styles.preview}>

        <View style={styles.previewHeader}>

          <Text style={styles.fps}>60 FPS</Text>

          <View style={styles.sensorBadge}>
            <Text style={styles.sensorText}>8/8 sensors</Text>
          </View>

        </View>

        {/* Stick Figure Placeholder */}

        <View style={styles.figureContainer}>

          <Circle size={18} color="white" />

          <View style={styles.body} />

          <View style={styles.armRow}>
            <View style={styles.arm} />
            <View style={styles.arm} />
          </View>

          <View style={styles.legRow}>
            <View style={styles.leg} />
            <View style={styles.leg} />
          </View>

        </View>

      </View>

      {/* Timer */}

      <Text style={styles.timer}>00:00:12</Text>

      {/* Record */}

      <TouchableOpacity style={styles.recordButton}>
        <View style={styles.recordCircle} />
      </TouchableOpacity>

      {/* Storage */}

      <View style={styles.storageCard}>

        <HardDrive size={22} color="#555" />

        <Text style={styles.storageTitle}>
          Storage Remaining
        </Text>

        <View style={{ flex: 1 }} />

        <Text style={styles.storageValue}>
          3.8 GB
        </Text>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 20,
  },

  header: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111",
  },

  preview: {
    backgroundColor: "#111",
    borderRadius: 30,
    height: 500,
    padding: 20,
  },

  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fps: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  sensorBadge: {
    backgroundColor: "#222",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  sensorText: {
    color: "white",
    fontSize: 16,
  },

  figureContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  body: {
    width: 6,
    height: 110,
    backgroundColor: "white",
    marginTop: 8,
  },

  armRow: {
    flexDirection: "row",
    marginTop: -70,
  },

  arm: {
    width: 90,
    height: 5,
    backgroundColor: "white",
    marginHorizontal: 5,
  },

  legRow: {
    flexDirection: "row",
    marginTop: 60,
  },

  leg: {
    width: 6,
    height: 90,
    backgroundColor: "white",
    marginHorizontal: 22,
    transform: [{ rotate: "18deg" }],
  },

  timer: {
    marginTop: 24,
    alignSelf: "center",
    fontSize: 42,
    fontWeight: "700",
    color: "#111",
  },

  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#111",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  recordCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E53935",
  },

  storageCard: {
    marginTop: 30,
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  storageTitle: {
    marginLeft: 12,
    fontSize: 20,
    color: "#555",
  },

  storageValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },

});