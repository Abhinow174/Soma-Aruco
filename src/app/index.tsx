import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import StatusCard from "../components/StatusCard";
import DenoiserCard from "../components/DenoiserCard";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import SmallStatCard from "../components/SmallStatCard";
import BottomBar from "../components/BottomBar";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Greeting */}

          <Text style={styles.greeting}>Good evening</Text>

          <Text style={styles.heading}>
            Ready to{"\n"}capture
          </Text>

          {/* Status */}

          <StatusCard />

          {/* Denoiser */}

          <DenoiserCard />

          {/* Buttons */}

          <PrimaryButton
            title="Start calibration"
            onPress={() => router.push("/calibration")}
          />

          <SecondaryButton
            title="Go to live preview"
            onPress={() => router.push("/live")}
          />

          {/* Stats */}

          <View style={styles.statsRow}>
            <SmallStatCard
              title="Sessions"
              value="12"
            />

            <View style={{ width: 16 }} />

            <SmallStatCard
              title="Storage free"
              value="3.8 GB"
            />
          </View>
        </ScrollView>
      </View>

      <BottomBar
        active="home"
        onHome={() => {}}
        onSessions={() => router.push("/sessions")}
        onUpload={() => router.push("/live")}
        onSettings={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },

  body: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },

  greeting: {
    fontSize: 18,
    color: "#777",
    marginBottom: 6,
    fontWeight: "500",
  },

  heading: {
    fontSize: 42,
    fontWeight: "700",
    color: "#111",
    lineHeight: 48,
    marginBottom: 28,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
});