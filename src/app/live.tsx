import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  DeviceEventEmitter,
  NativeModules,
  requireNativeComponent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type {
  StyleProp,
  ViewStyle,
} from "react-native";

import { useCameraPermissions } from "expo-camera";
import { router } from "expo-router";

import {
  ArrowLeft,
  Camera,
  HardDrive,
  Settings,
} from "lucide-react-native";

/* =========================================================
   NATIVE ARUCO MODULE
   ========================================================= */

const { ArucoModule } = NativeModules;

/* =========================================================
   NATIVE ARUCO CAMERA VIEW
   ========================================================= */

type ArucoCameraViewProps = {
  style?: StyleProp<ViewStyle>;
};

const ArucoCameraView =
  requireNativeComponent<ArucoCameraViewProps>(
    "ArucoCameraView"
  );

/* =========================================================
   TYPES
   ========================================================= */

type Point = {
  x: number;
  y: number;
};

type Marker = {
  id: number;
  corners: [Point, Point, Point, Point];
  center: Point;
  velocityX: number;
  velocityY: number;
  direction: string;
};

/* =========================================================
   MAIN SCREEN
   ========================================================= */

export default function LiveScreen() {
  /* =======================================================
     CAMERA PERMISSION
     ======================================================= */

  const [
    permission,
    requestPermission,
  ] = useCameraPermissions();

  /* =======================================================
     STATE
     ======================================================= */

  const [
    recording,
    setRecording,
  ] = useState(false);

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(0);

  const [
    markers,
    setMarkers,
  ] = useState<Marker[]>([]);

  const [
    opencvStatus,
    setOpencvStatus,
  ] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  /* =======================================================
     RECEIVE ARUCO DETECTIONS FROM NATIVE
     ======================================================= */

  useEffect(() => {
    console.log(
      "Registering ArUco marker listener..."
    );

    const subscription =
      DeviceEventEmitter.addListener(
        "onMarkersDetected",
        (event) => {
          try {
            const nativeMarkers =
              event?.markers ?? [];

            /*
             * Convert native marker data
             * into our React Native Marker type.
             */

            const convertedMarkers: Marker[] =
              nativeMarkers.map(
                (marker: any) => {
                  const corners =
                    marker.corners ?? [];

                  return {
                    id: Number(marker.id),

                    corners: [
                      {
                        x: Number(
                          corners[0]?.x ?? 0
                        ),
                        y: Number(
                          corners[0]?.y ?? 0
                        ),
                      },
                      {
                        x: Number(
                          corners[1]?.x ?? 0
                        ),
                        y: Number(
                          corners[1]?.y ?? 0
                        ),
                      },
                      {
                        x: Number(
                          corners[2]?.x ?? 0
                        ),
                        y: Number(
                          corners[2]?.y ?? 0
                        ),
                      },
                      {
                        x: Number(
                          corners[3]?.x ?? 0
                        ),
                        y: Number(
                          corners[3]?.y ?? 0
                        ),
                      },
                    ],

                    center: {
                      x: Number(
                        marker.center?.x ?? 0
                      ),
                      y: Number(
                        marker.center?.y ?? 0
                      ),
                    },

                    /*
                     * Velocity will be calculated
                     * in the tracking stage.
                     */
                    velocityX: 0,
                    velocityY: 0,

                    /*
                     * Direction will also be calculated
                     * from consecutive positions.
                     */
                    direction: "Stationary",
                  };
                }
              );

            setMarkers(
              convertedMarkers
            );
          } catch (error) {
            console.error(
              "Error processing native marker data:",
              error
            );
          }
        }
      );

    return () => {
      console.log(
        "Removing ArUco marker listener..."
      );

      subscription.remove();
    };
  }, []);

  /* =======================================================
     TIMER
     ======================================================= */

  useEffect(() => {
    if (recording) {
      timerRef.current =
        setInterval(() => {
          setElapsedSeconds(
            (previous) =>
              previous + 1
          );
        }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current = null;
      }
    };
  }, [recording]);

  /* =======================================================
     FORMAT TIMER
     ======================================================= */

  const formatTime = (
    seconds: number
  ) => {
    const hours =
      Math.floor(
        seconds / 3600
      );

    const minutes =
      Math.floor(
        (seconds % 3600) / 60
      );

    const secs =
      seconds % 60;

    return (
      `${String(hours).padStart(
        2,
        "0"
      )}:` +
      `${String(minutes).padStart(
        2,
        "0"
      )}:` +
      `${String(secs).padStart(
        2,
        "0"
      )}`
    );
  };

  /* =======================================================
     TEST OPENCV
     ======================================================= */

  const testOpenCV =
    async () => {
      try {
        console.log(
          "Testing native OpenCV..."
        );

        setOpencvStatus(
          "testing"
        );

        if (!ArucoModule) {
          console.error(
            "ArucoModule is not available"
          );

          setOpencvStatus(
            "error"
          );

          return;
        }

        const result =
          await ArucoModule.isOpenCVReady();

        console.log(
          "OpenCV ArUco:",
          result
        );

        if (
          result === true
        ) {
          setOpencvStatus(
            "success"
          );
        } else {
          setOpencvStatus(
            "error"
          );
        }
      } catch (error) {
        console.error(
          "OpenCV ArUco error:",
          error
        );

        setOpencvStatus(
          "error"
        );
      }
    };

  /* =======================================================
     RECORD BUTTON
     ======================================================= */

  const handleRecord =
    async () => {
      /*
       * Make sure camera permission exists.
       */

      if (
        !permission?.granted
      ) {
        const result =
          await requestPermission();

        if (
          !result.granted
        ) {
          return;
        }
      }

      /* =================================================
         START RECORDING
         ================================================= */

      if (!recording) {
        setRecording(
          true
        );

        setElapsedSeconds(
          0
        );

        /*
         * No mock marker.
         *
         * Real markers are received
         * from native CameraX/OpenCV.
         */

        setMarkers([]);

        return;
      }

      /* =================================================
         STOP RECORDING
         ================================================= */

      setRecording(
        false
      );

      setMarkers([]);
    };

  /* =======================================================
     CHECKING PERMISSION
     ======================================================= */

  if (!permission) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.permissionContainer
          }
        >
          <Camera
            size={64}
            color="#999999"
          />

          <Text
            style={
              styles.permissionTitle
            }
          >
            Checking Camera Permission
          </Text>

          <Text
            style={
              styles.permissionDescription
            }
          >
            Please wait while we check
            camera access.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     CAMERA PERMISSION DENIED
     ======================================================= */

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        {/* HEADER */}

        <View
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
          >
            <ArrowLeft
              size={28}
              color="#111111"
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }
          >
            Live Capture
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        {/* PERMISSION CONTENT */}

        <View
          style={
            styles.permissionContainer
          }
        >
          <View
            style={
              styles.cameraIconCircle
            }
          >
            <Camera
              size={42}
              color="#111111"
            />
          </View>

          <Text
            style={
              styles.permissionTitle
            }
          >
            Camera Access Needed
          </Text>

          <Text
            style={
              styles.permissionDescription
            }
          >
            Allow ArUco to access your
            camera so you can detect and
            track markers.
          </Text>

          <TouchableOpacity
            style={
              styles.permissionButton
            }
            onPress={
              requestPermission
            }
          >
            <Text
              style={
                styles.permissionButtonText
              }
            >
              Allow Camera Access
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* =======================================================
     MAIN SCREEN
     ======================================================= */

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* =================================================
          HEADER
          ================================================= */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <ArrowLeft
            size={28}
            color="#111111"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Live Capture
        </Text>

        <TouchableOpacity>
          <Settings
            size={25}
            color="#111111"
          />
        </TouchableOpacity>
      </View>

      {/* =================================================
          CAMERA PREVIEW
          ================================================= */}

      <View
        style={styles.preview}
      >
        {/* =================================================
            NATIVE CAMERAX CAMERA
            ================================================= */}

        <ArucoCameraView
          style={styles.camera}
        />

        {/* =================================================
            CAMERA OVERLAY
            ================================================= */}

        <View
          style={
            styles.cameraOverlay
          }
          pointerEvents="none"
        >
          {/* ---------------------------------------------
              TOP INFORMATION
              --------------------------------------------- */}

          <View
            style={
              styles.previewHeader
            }
          >
            {/* FPS */}

            <View
              style={
                styles.fpsBadge
              }
            >
              <View
                style={
                  styles.liveDot
                }
              />

              <Text
                style={styles.fps}
              >
                60 FPS
              </Text>
            </View>

            {/* MARKER COUNT */}

            <View
              style={
                styles.sensorBadge
              }
            >
              <Text
                style={
                  styles.sensorText
                }
              >
                {markers.length}{" "}
                {markers.length ===
                1
                  ? "marker"
                  : "markers"}
              </Text>
            </View>
          </View>

          {/* ---------------------------------------------
              ARUCO MARKERS
              --------------------------------------------- */}

          {markers.map(
            (marker) => {
              /*
               * Calculate approximate
               * rectangular bounds.
               */

              const markerWidth =
                Math.abs(
                  marker.corners[1].x -
                    marker.corners[0].x
                );

              const markerHeight =
                Math.abs(
                  marker.corners[2].y -
                    marker.corners[0].y
                );

              return (
                <View
                  key={
                    marker.id
                  }
                  style={[
                    styles.markerBox,
                    {
                      left:
                        marker.corners[0]
                          .x,
                      top:
                        marker.corners[0]
                          .y,
                      width:
                        markerWidth,
                      height:
                        markerHeight,
                    },
                  ]}
                >
                  {/* MARKER ID */}

                  <View
                    style={
                      styles.markerLabel
                    }
                  >
                    <Text
                      style={
                        styles.markerLabelText
                      }
                    >
                      ID:{" "}
                      {marker.id}
                    </Text>
                  </View>

                  {/* TOP LEFT */}

                  <View
                    style={[
                      styles.cornerDot,
                      styles.topLeft,
                    ]}
                  />

                  {/* TOP RIGHT */}

                  <View
                    style={[
                      styles.cornerDot,
                      styles.topRight,
                    ]}
                  />

                  {/* BOTTOM LEFT */}

                  <View
                    style={[
                      styles.cornerDot,
                      styles.bottomLeft,
                    ]}
                  />

                  {/* BOTTOM RIGHT */}

                  <View
                    style={[
                      styles.cornerDot,
                      styles.bottomRight,
                    ]}
                  />
                </View>
              );
            }
          )}

          {/* ---------------------------------------------
              TRACKING INFORMATION
              --------------------------------------------- */}

          {markers.length >
            0 && (
            <View
              style={
                styles.trackingCard
              }
            >
              <Text
                style={
                  styles.trackingTitle
                }
              >
                Tracking
              </Text>

              {/* ID */}

              <View
                style={
                  styles.trackingRow
                }
              >
                <Text
                  style={
                    styles.trackingLabel
                  }
                >
                  ID
                </Text>

                <Text
                  style={
                    styles.trackingValue
                  }
                >
                  {
                    markers[0]
                      .id
                  }
                </Text>
              </View>

              {/* POSITION */}

              <View
                style={
                  styles.trackingRow
                }
              >
                <Text
                  style={
                    styles.trackingLabel
                  }
                >
                  Position
                </Text>

                <Text
                  style={
                    styles.trackingValue
                  }
                >
                  {Math.round(
                    markers[0]
                      .center.x
                  )}
                  ,{" "}
                  {Math.round(
                    markers[0]
                      .center.y
                  )}
                </Text>
              </View>

              {/* VELOCITY */}

              <View
                style={
                  styles.trackingRow
                }
              >
                <Text
                  style={
                    styles.trackingLabel
                  }
                >
                  Velocity
                </Text>

                <Text
                  style={
                    styles.trackingValue
                  }
                >
                  {
                    markers[0]
                      .velocityX
                  }
                  ,{" "}
                  {
                    markers[0]
                      .velocityY
                  }{" "}
                  px/s
                </Text>
              </View>

              {/* DIRECTION */}

              <View
                style={
                  styles.trackingRow
                }
              >
                <Text
                  style={
                    styles.trackingLabel
                  }
                >
                  Direction
                </Text>

                <Text
                  style={
                    styles.directionValue
                  }
                >
                  {
                    markers[0]
                      .direction
                  }
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* =================================================
          TIMER
          ================================================= */}

      <Text
        style={styles.timer}
      >
        {formatTime(
          elapsedSeconds
        )}
      </Text>

      {/* =================================================
          RECORD BUTTON
          ================================================= */}

      <TouchableOpacity
        style={
          styles.recordButton
        }
        onPress={
          handleRecord
        }
        activeOpacity={0.8}
      >
        <View
          style={
            styles.recordCircle
          }
        >
          {recording ? (
            <View
              style={
                styles.stopSquare
              }
            />
          ) : (
            <View
              style={
                styles.innerRecordCircle
              }
            />
          )}
        </View>
      </TouchableOpacity>

      {/* RECORD LABEL */}

      <Text
        style={
          styles.recordLabel
        }
      >
        {recording
          ? "Stop Recording"
          : "Record"}
      </Text>

      {/* =================================================
          OPENCV TEST
          ================================================= */}

      <TouchableOpacity
        style={
          styles.testButton
        }
        onPress={
          testOpenCV
        }
        disabled={
          opencvStatus ===
          "testing"
        }
        activeOpacity={0.8}
      >
        <Text
          style={
            styles.testButtonText
          }
        >
          {opencvStatus ===
          "testing"
            ? "Testing OpenCV..."
            : "Test OpenCV"}
        </Text>
      </TouchableOpacity>

      {opencvStatus ===
        "success" && (
        <View
          style={
            styles.successBox
          }
        >
          <Text
            style={
              styles.successText
            }
          >
            ✓ OpenCV + ArUco
            initialized
          </Text>
        </View>
      )}

      {opencvStatus ===
        "error" && (
        <View
          style={
            styles.errorBox
          }
        >
          <Text
            style={
              styles.errorText
            }
          >
            ✕ OpenCV
            initialization
            failed
          </Text>
        </View>
      )}

      {/* =================================================
          STORAGE
          ================================================= */}

      <View
        style={
          styles.storageCard
        }
      >
        <HardDrive
          size={22}
          color="#555555"
        />

        <Text
          style={
            styles.storageTitle
          }
        >
          Storage Remaining
        </Text>

        <View
          style={
            styles.storageSpacer
          }
        />

        <Text
          style={
            styles.storageValue
          }
        >
          3.8 GB
        </Text>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles =
  StyleSheet.create({
    /* -----------------------------------------------------
       MAIN CONTAINER
       ----------------------------------------------------- */

    container: {
      flex: 1,
      backgroundColor: "#F5F5F5",
      paddingHorizontal: 20,
    },

    /* -----------------------------------------------------
       HEADER
       ----------------------------------------------------- */

    header: {
      marginTop: 10,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    headerTitle: {
      fontSize: 30,
      fontWeight: "700",
      color: "#111111",
    },

    headerSpacer: {
      width: 28,
    },

    /* -----------------------------------------------------
       CAMERA PREVIEW
       ----------------------------------------------------- */

    preview: {
      height: 500,
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

    /* -----------------------------------------------------
       CAMERA OVERLAY
       ----------------------------------------------------- */

    cameraOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 16,
    },

    /* -----------------------------------------------------
       PREVIEW HEADER
       ----------------------------------------------------- */

    previewHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
    },

    fpsBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "rgba(20,20,20,0.75)",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
    },

    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#32CD65",
      marginRight: 7,
    },

    fps: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },

    sensorBadge: {
      backgroundColor:
        "rgba(20,20,20,0.75)",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
    },

    sensorText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "600",
    },

    /* -----------------------------------------------------
       ARUCO MARKER BOX
       ----------------------------------------------------- */

    markerBox: {
      position: "absolute",
      borderWidth: 3,
      borderColor:
        "#32FF5A",
    },

    markerLabel: {
      position: "absolute",
      left: -2,
      top: -38,
      backgroundColor:
        "#32FF5A",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },

    markerLabelText: {
      color: "#111111",
      fontSize: 15,
      fontWeight: "800",
    },

    /* -----------------------------------------------------
       MARKER CORNER DOTS
       ----------------------------------------------------- */

    cornerDot: {
      position: "absolute",
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor:
        "#32FF5A",
    },

    topLeft: {
      left: -7,
      top: -7,
    },

    topRight: {
      right: -7,
      top: -7,
    },

    bottomLeft: {
      left: -7,
      bottom: -7,
    },

    bottomRight: {
      right: -7,
      bottom: -7,
    },

    /* -----------------------------------------------------
       TRACKING CARD
       ----------------------------------------------------- */

    trackingCard: {
      position: "absolute",
      right: 16,
      bottom: 16,
      width: 185,
      backgroundColor:
        "rgba(15,15,15,0.88)",
      borderRadius: 16,
      padding: 14,
    },

    trackingTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 8,
    },

    trackingRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
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

    /* -----------------------------------------------------
       TIMER
       ----------------------------------------------------- */

    timer: {
      marginTop: 20,
      alignSelf: "center",
      fontSize: 42,
      fontWeight: "700",
      color: "#111111",
    },

    /* -----------------------------------------------------
       RECORD BUTTON
       ----------------------------------------------------- */

    recordButton: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor:
        "#111111",
      alignSelf: "center",
      justifyContent:
        "center",
      alignItems: "center",
      marginTop: 16,
    },

    recordCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        "#E53935",
      justifyContent:
        "center",
      alignItems: "center",
    },

    innerRecordCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
    },

    stopSquare: {
      width: 22,
      height: 22,
      borderRadius: 4,
      backgroundColor:
        "#FFFFFF",
    },

    recordLabel: {
      alignSelf: "center",
      marginTop: 6,
      fontSize: 14,
      fontWeight: "600",
      color: "#555555",
    },

    /* -----------------------------------------------------
       OPENCV TEST
       ----------------------------------------------------- */

    testButton: {
      alignSelf: "center",
      marginTop: 10,
      backgroundColor:
        "#222222",
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 12,
    },

    testButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },

    successBox: {
      alignSelf: "center",
      marginTop: 7,
      backgroundColor:
        "#E8F5E9",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 10,
    },

    successText: {
      color: "#2E7D32",
      fontSize: 12,
      fontWeight: "700",
    },

    errorBox: {
      alignSelf: "center",
      marginTop: 7,
      backgroundColor:
        "#FFEBEE",
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 10,
    },

    errorText: {
      color: "#C62828",
      fontSize: 12,
      fontWeight: "700",
    },

    /* -----------------------------------------------------
       STORAGE CARD
       ----------------------------------------------------- */

    storageCard: {
      marginTop: 18,
      marginBottom: 10,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#E8E8E8",
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

    /* -----------------------------------------------------
       PERMISSION SCREEN
       ----------------------------------------------------- */

    permissionContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 25,
    },

    cameraIconCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor:
        "#EAEAEA",
      justifyContent:
        "center",
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
      backgroundColor:
        "#111111",
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