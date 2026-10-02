import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Activity,
} from "lucide-react-native";

const sessions = [
  {
    id: "1",
    title: "Walking Trial A",
    date: "Today • 10:42 AM",
    size: "24 MB",
  },
  {
    id: "2",
    title: "Walking Trial B",
    date: "Yesterday • 4:18 PM",
    size: "27 MB",
  },
  {
    id: "3",
    title: "Running Trial",
    date: "July 7 • 2:30 PM",
    size: "31 MB",
  },
  {
    id: "4",
    title: "Patient Session",
    date: "July 5 • 11:10 AM",
    size: "22 MB",
  },
];

export default function SessionsScreen() {
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="#111" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Sessions</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* Session List */}

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>

            <View style={styles.iconContainer}>
              <Activity size={28} color="#2563EB" />
            </View>

            <View style={{ flex: 1, marginLeft: 16 }}>

              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.subtitle}>
                {item.date}
              </Text>

            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.size}>
                {item.size}
              </Text>

              <ChevronRight
                size={22}
                color="#888"
                style={{ marginTop: 8 }}
              />
            </View>

          </TouchableOpacity>
        )}
      />
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

  card: {
    backgroundColor: "#FFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#777",
  },

  size: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
  },

});