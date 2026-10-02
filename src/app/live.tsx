import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import {
  ArrowLeft,
  Camera,
  HardDrive,
  Settings,
} from "lucide-react-native";
import { Paths } from "expo-file-system";
import { useArucoTracking } from "../aruco/use-aruco-tracking";
import { SessionRecorder } from "../aruco/session-recorder";
import { ArucoCameraView } from "../../modules/aruco-detector";
import type { ProcessedMarker } from "../aruco/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PREVIEW_HORIZONTAL_PADDING = 20;
const PREVIEW_WIDTH = SCREEN_WIDTH - PREVIEW_HORIZONTAL_PADDING * 2;
const PREVIEW_HEIGHT = 500;

export default function LiveScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [recording, setRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [storageRemaining, setStorageRemaining] = useState("3.8 GB");
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recorderRef = useRef(new SessionRecorder());
  const lastRecordedTimeRef = useRef(0);

  const {
    markers,
    fps,
    frameDimensions,
    isTracking,
    startTracking,
    stopTracking,
    onCameraViewMarkers,
    markerCount,
    isNativeAvailable,
  } = useArucoTracking(30, 500, 5, 20);

  const mapPoint = useCallback(
    (p: { x: number; y: number }): { x: number; y: number } => {
      const fw = frameDimensions.width > 0 ? frameDimensions.width : 480;
      const fh = frameDimensions.height > 0 ? frameDimensions.height : 640;

      const scale = Math.max(PREVIEW_WIDTH / fw, PREVIEW_HEIGHT / fh);
      const offsetX = (PREVIEW_WIDTH - fw * scale) / 2;
      const offsetY = (PREVIEW_HEIGHT - fh * scale) / 2;

      return {
        x: p.x * scale + offsetX,
        y: p.y * scale + offsetY,
      };
    },
    [frameDimensions.width, frameDimensions.height]
  );

  const activeMarker = useMemo(() => {
    if (markers.length === 0) return null;
    if (selectedMarkerId !== null) {
      const found = markers.find((m) => m.id === selectedMarkerId);
      if (found) return found;
    }
    return markers[0];
  }, [markers, selectedMarkerId]);

  const updateStorageInfo = useCallback(() => {
    try {
      const freeSpace = Paths.availableDiskSpace;
      if (freeSpace > 0) {
        const gb = freeSpace / (1024 * 1024 * 1024);
        setStorageRemaining(`${gb.toFixed(1)} GB`);
      }
    } catch {}
  }, []);

  useEffect(() => {
    updateStorageInfo();
  }, [updateStorageInfo]);

  useEffect(() => {
    if (recording && isTracking) {
      const now = Date.now();
      if (now - lastRecordedTimeRef.current >= 30) {
        lastRecordedTimeRef.current = now;
        recorderRef.current.addFrame({
          timestamp: now,
          markers,
          fps,
        });
      }
    }
  }, [markers, recording, isTracking, fps]);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [recording]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return (
      `${String(hours).padStart(2, "0")}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(secs).padStart(2, "0")}`
    );
  };

  const handleRecord = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }

    if (!recording) {
      setElapsedSeconds(0);
      recorderRef.current.startSession();
      await startTracking();
      setRecording(true);
      return;
    }

    setRecording(false);
    await stopTracking();
    recorderRef.current.stopAndSaveSession();
    updateStorageInfo();
  };

  const renderMarkerOverlay = (marker: ProcessedMarker) => {
    const c0 = mapPoint(marker.corners[0]);
    const c1 = mapPoint(marker.corners[1]);
    const c2 = mapPoint(marker.corners[2]);
    const c3 = mapPoint(marker.corners[3]);

    const minX = Math.min(c0.x, c1.x, c2.x, c3.x);
    const maxX = Math.max(c0.x, c1.x, c2.x, c3.x);
    const minY = Math.min(c0.y, c1.y, c2.y, c3.y);
    const maxY = Math.max(c0.y, c1.y, c2.y, c3.y);

    const markerWidth = Math.max(maxX - minX, 12);
    const markerHeight = Math.max(maxY - minY, 12);
    const isSelected = activeMarker?.id === marker.id;

    return (
      <TouchableOpacity
        key={marker.id}
        activeOpacity={0.8}
        onPress={() => setSelectedMarkerId(marker.id)}
        style={[
          styles.markerBox,
          {
            left: minX,
            top: minY,
            width: markerWidth,
            height: markerHeight,
            borderColor: isSelected ? "#32FF5A" : "#00E5FF",
          },
        ]}
      >
        <View
          style={[
            styles.markerLabel,
            { backgroundColor: isSelected ? "#32FF5A" : "#00E5FF" },
          ]}
        >
          <Text style={styles.markerLabelText}>ID: {marker.id}</Text>
        </View>

        <View style={[styles.cornerDot, styles.topLeft, { backgroundColor: isSelected ? "#32FF5A" : "#00E5FF" }]} />
        <View style={[styles.cornerDot, styles.topRight, { backgroundColor: isSelected ? "#32FF5A" : "#00E5FF" }]} />
        <View style={[styles.cornerDot, styles.bottomLeft, { backgroundColor: isSelected ? "#32FF5A" : "#00E5FF" }]} />
        <View style={[styles.cornerDot, styles.bottomRight, { backgroundColor: isSelected ? "#32FF5A" : "#00E5FF" }]} />
      </TouchableOpacity>
    );
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#999999" />
          <Text style={styles.permissionTitle}>
            Checking Camera Permission
          </Text>
          <Text style={styles.permissionDescription}>
            Please wait while we check camera access.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={28} color="#111111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Live Capture
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.permissionContainer}>
          <View style={styles.cameraIconCircle}>
            <Camera size={42} color="#111111" />
          </View>
          <Text style={styles.permissionTitle}>
            Camera Access Needed
          </Text>
          <Text style={styles.permissionDescription}>
            Allow ArUco to access your camera so you can
            detect and track markers.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Allow Camera Access
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Live Capture
        </Text>
        <TouchableOpacity>
          <Settings size={25} color="#111111" />
        </TouchableOpacity>
      </View>

      <View style={styles.preview}>
        <ArucoCameraView
          style={styles.camera}
          isTracking={recording}
          targetFps={30}
          onMarkersDetected={onCameraViewMarkers}
        />

        <View
          style={styles.cameraOverlay}
          pointerEvents="box-none"
        >
          <View style={styles.previewHeader} pointerEvents="box-none">
            <View style={styles.fpsBadge}>
              <View
                style={[
                  styles.liveDot,
                  { backgroundColor: isTracking ? "#32FF5A" : "#FF3B30" },
                ]}
              />
              <Text style={styles.fps}>
                {isTracking ? `${fps} FPS` : "IDLE"}
              </Text>
            </View>

            <View style={styles.sensorBadge}>
              <Text style={styles.sensorText}>
                {markerCount}{" "}
                {markerCount === 1 ? "marker" : "markers"}
              </Text>
            </View>
          </View>

          {markers.map(renderMarkerOverlay)}

          {!isNativeAvailable && isTracking && (
            <View style={styles.nativeUnavailableBadge}>
              <Text style={styles.nativeUnavailableText}>
                Running in preview mode — install native build for ArUco suit tracking
              </Text>
            </View>
          )}

          {activeMarker && (
            <View style={styles.trackingCard}>
              <Text style={styles.trackingTitle}>
                Tracking {markerCount > 1 ? `(#${activeMarker.id})` : ""}
              </Text>

              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>ID</Text>
                <Text style={styles.trackingValue}>
                  {activeMarker.id}
                </Text>
              </View>

              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Position</Text>
                <Text style={styles.trackingValue}>
                  {Math.round(activeMarker.center.x)},{" "}
                  {Math.round(activeMarker.center.y)}
                </Text>
              </View>

              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Velocity</Text>
                <Text style={styles.trackingValue}>
                  {activeMarker.velocityX.toFixed(1)},{" "}
                  {activeMarker.velocityY.toFixed(1)} px/s
                </Text>
              </View>

              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Speed</Text>
                <Text style={styles.trackingValue}>
                  {activeMarker.speed.toFixed(1)} px/s
                </Text>
              </View>

              <View style={styles.trackingRow}>
                <Text style={styles.trackingLabel}>Direction</Text>
                <Text style={styles.directionValue}>
                  {activeMarker.direction}
                </Text>
              </View>

              {markerCount > 1 && (
                <View style={styles.trackingRow}>
                  <Text style={styles.trackingLabel}>Active</Text>
                  <Text style={styles.trackingValue}>
                    {markerCount} total
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <Text style={styles.timer}>
        {formatTime(elapsedSeconds)}
      </Text>

      <TouchableOpacity
        style={styles.recordButton}
        onPress={handleRecord}
        activeOpacity={0.8}
      >
        <View style={styles.recordCircle}>
          {recording ? (
            <View style={styles.stopSquare} />
          ) : (
            <View style={styles.innerRecordCircle} />
          )}
        </View>
      </TouchableOpacity>

      <Text style={styles.recordLabel}>
        {recording ? "Stop Recording" : "Record"}
      </Text>

      <View style={styles.storageCard}>
        <HardDrive size={22} color="#555555" />
        <Text style={styles.storageTitle}>
          Storage Remaining
        </Text>
        <View style={styles.storageSpacer} />
        <Text style={styles.storageValue}>
          {storageRemaining}
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
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111111",
  },

  headerSpacer: {
    width: 28,
  },

  preview: {
    height: PREVIEW_HEIGHT,
    backgroundColor: "#111111",
    borderRadius: 30,
    overflow: "hidden",
    position: "relative",
  },

  camera: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },

  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fpsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20,20,20,0.75)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  fps: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  sensorBadge: {
    backgroundColor: "rgba(20,20,20,0.75)",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },

  sensorText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  markerBox: {
    position: "absolute",
    borderWidth: 2.5,
    borderRadius: 4,
  },

  markerLabel: {
    position: "absolute",
    left: -2,
    top: -26,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },

  markerLabelText: {
    color: "#111111",
    fontSize: 12,
    fontWeight: "800",
  },

  cornerDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  topLeft: {
    left: -5,
    top: -5,
  },

  topRight: {
    right: -5,
    top: -5,
  },

  bottomLeft: {
    left: -5,
    bottom: -5,
  },

  bottomRight: {
    right: -5,
    bottom: -5,
  },

  nativeUnavailableBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "rgba(255,59,48,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  nativeUnavailableText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  trackingCard: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 190,
    backgroundColor: "rgba(15,15,15,0.88)",
    borderRadius: 16,
    padding: 14,
  },

  trackingTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  trackingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  trackingLabel: {
    color: "#BDBDBD",
    fontSize: 12,
  },

  trackingValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  directionValue: {
    color: "#32FF5A",
    fontSize: 12,
    fontWeight: "800",
  },

  timer: {
    marginTop: 20,
    alignSelf: "center",
    fontSize: 42,
    fontWeight: "700",
    color: "#111111",
  },

  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#111111",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  recordCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
  },

  innerRecordCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
  },

  stopSquare: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  recordLabel: {
    alignSelf: "center",
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
  },

  storageCard: {
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  storageTitle: {
    marginLeft: 12,
    fontSize: 18,
    color: "#555555",
  },

  storageSpacer: {
    flex: 1,
  },

  storageValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  cameraIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  permissionTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
    marginBottom: 12,
  },

  permissionDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666666",
    textAlign: "center",
    marginBottom: 28,
  },

  permissionButton: {
    backgroundColor: "#111111",
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 14,
  },

  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});