import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Activity,
  Trash2,
  X,
  Clock,
  Film,
} from "lucide-react-native";
import { SessionRecorder } from "../aruco/session-recorder";
import type { RecordingSession } from "../aruco/types";

type SessionSummary = {
  id: string;
  title: string;
  date: string;
  frameCount: number;
};

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<RecordingSession | null>(null);
  const [recorder] = useState(() => new SessionRecorder());

  const loadSessions = useCallback(async () => {
    try {
      const ids = recorder.getSessionIds();
      const loaded: SessionSummary[] = [];

      for (const id of ids) {
        const ts = parseInt(id, 10);
        const dateStr = !isNaN(ts) ? new Date(ts).toLocaleString() : id;
        const sessionData = await recorder.loadSession(id);
        loaded.push({
          id,
          title: `Trial ${id.slice(-4)}`,
          date: dateStr,
          frameCount: sessionData?.frames?.length ?? 0,
        });
      }

      loaded.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
      setSessions(loaded);
    } catch {
      setSessions([]);
    }
  }, [recorder]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSelectSession = async (id: string) => {
    try {
      const data = await recorder.loadSession(id);
      setSelectedSession(data);
    } catch {}
  };

  const handleDeleteSession = (id: string) => {
    Alert.alert("Delete Trial", "Are you sure you want to delete this recorded session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          recorder.deleteSession(id);
          setSelectedSession(null);
          loadSessions();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sessions</Text>

        <View style={{ width: 28 }} />
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Activity size={48} color="#A8A8A8" />
          <Text style={styles.emptyTitle}>No Recorded Sessions</Text>
          <Text style={styles.emptySubtitle}>
            Go to Live Capture and tap Record to capture and save ArUco motion data.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSelectSession(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Activity size={28} color="#2563EB" />
              </View>

              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.date}</Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.framesText}>{item.frameCount} frames</Text>
                <ChevronRight
                  size={20}
                  color="#888"
                  style={{ marginTop: 6 }}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedSession && (
        <Modal
          visible={!!selectedSession}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedSession(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Trial {selectedSession.id.slice(-4)}</Text>
                <TouchableOpacity onPress={() => setSelectedSession(null)}>
                  <X size={24} color="#111" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalRow}>
                <Clock size={18} color="#666" />
                <Text style={styles.modalLabel}>Started:</Text>
                <Text style={styles.modalValue}>
                  {new Date(selectedSession.startedAt).toLocaleString()}
                </Text>
              </View>

              <View style={styles.modalRow}>
                <Film size={18} color="#666" />
                <Text style={styles.modalLabel}>Total Frames:</Text>
                <Text style={styles.modalValue}>
                  {selectedSession.frames?.length ?? 0} frames
                </Text>
              </View>

              <View style={styles.modalRow}>
                <Activity size={18} color="#666" />
                <Text style={styles.modalLabel}>Duration:</Text>
                <Text style={styles.modalValue}>
                  {(((selectedSession.frames?.length ?? 0) / 30)).toFixed(1)}s (~30 FPS)
                </Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSession(selectedSession.id)}
              >
                <Trash2 size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.deleteButtonText}>Delete Trial</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#111",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginTop: 16,
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 15,
    color: "#777",
    textAlign: "center",
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#777",
  },

  framesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },

  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  modalLabel: {
    fontSize: 16,
    color: "#555",
    marginLeft: 8,
    marginRight: 6,
  },

  modalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },

  deleteButton: {
    marginTop: 20,
    height: 54,
    backgroundColor: "#EF4444",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});