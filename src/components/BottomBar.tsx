import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  active?: "home" | "sessions" | "upload" | "settings";
  onHome?: () => void;
  onSessions?: () => void;
  onUpload?: () => void;
  onSettings?: () => void;
}

export default function BottomBar({
  active = "home",
  onHome,
  onSessions,
  onUpload,
  onSettings,
}: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onHome}>
        <Ionicons
          name={active === "home" ? "home" : "home-outline"}
          size={26}
          color={active === "home" ? "#111" : "#A8A8A8"}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onSessions}>
        <Ionicons
          name={active === "sessions" ? "folder" : "folder-outline"}
          size={26}
          color={active === "sessions" ? "#111" : "#A8A8A8"}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onUpload}>
        <Ionicons
          name={active === "upload" ? "cloud-upload" : "cloud-upload-outline"}
          size={26}
          color={active === "upload" ? "#111" : "#A8A8A8"}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onSettings}>
        <Ionicons
          name={active === "settings" ? "settings" : "settings-outline"}
          size={26}
          color={active === "settings" ? "#111" : "#A8A8A8"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 82,
    backgroundColor: "#FFF",

    borderTopWidth: 1,
    borderTopColor: "#ECECEC",

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    paddingBottom: 12,
    paddingTop: 8,
  },
});