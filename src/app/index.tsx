import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Paths } from "expo-file-system";
import StatusCard from "../components/StatusCard";
import DenoiserCard from "../components/DenoiserCard";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import SmallStatCard from "../components/SmallStatCard";
import BottomBar from "../components/BottomBar";
import { SessionRecorder } from "../aruco/session-recorder";

export default function HomeScreen() {
  const [sessionCount, setSessionCount] = useState("0");
  const [freeStorage, setFreeStorage] = useState("3.8 GB");

  useEffect(() => {
    try {
      const recorder = new SessionRecorder();
      const ids = recorder.getSessionIds();
      setSessionCount(String(ids.length));
    } catch {
      setSessionCount("0");
    }

    try {
      const bytes = Paths.availableDiskSpace;
      if (bytes > 0) {
        const gb = bytes / (1024 * 1024 * 1024);
        setFreeStorage(`${gb.toFixed(1)} GB`);
      }
    } catch {}
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.greeting}>Good evening</Text>

          <Text style={styles.heading}>
            Ready to{"\n"}capture
          </Text>

          <StatusCard />

          <DenoiserCard />

          <PrimaryButton
            title="Start calibration"
            onPress={() => router.push("/calibration")}
          />

          <SecondaryButton
            title="Go to live preview"
            onPress={() => router.push("/live")}
          />

          <View style={styles.statsRow}>
            <SmallStatCard
              title="Sessions"
              value={sessionCount}
            />

            <View style={{ width: 16 }} />

            <SmallStatCard
              title="Storage free"
              value={freeStorage}
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