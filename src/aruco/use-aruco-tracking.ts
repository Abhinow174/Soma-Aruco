import { useState, useEffect, useCallback, useRef } from 'react';
import { ProcessedMarker, FrameData } from './types';
import { NativeBridge, parseNativeMarkers } from './native-bridge';
import { MarkerProcessor } from './marker-processor';

export const useArucoTracking = (
  targetFps: number = 30,
  timeoutMs: number = 500,
  stationaryThreshold: number = 5,
  maxTrackedMarkers: number = 20
) => {
  const [markers, setMarkers] = useState<ProcessedMarker[]>([]);
  const [fps, setFps] = useState<number>(0);
  const [frameDimensions, setFrameDimensions] = useState<{ width: number; height: number }>({
    width: 480,
    height: 640,
  });
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const processorRef = useRef(new MarkerProcessor(timeoutMs, stationaryThreshold, maxTrackedMarkers));
  const listenerRef = useRef<{ remove: () => void } | null>(null);

  const startTracking = useCallback(async () => {
    if (isTracking) return;
    processorRef.current = new MarkerProcessor(timeoutMs, stationaryThreshold, maxTrackedMarkers);
    await NativeBridge.startTracking(targetFps);
    setIsTracking(true);
  }, [isTracking, targetFps, timeoutMs, stationaryThreshold, maxTrackedMarkers]);

  const stopTracking = useCallback(async () => {
    if (!isTracking) return;
    await NativeBridge.stopTracking();
    if (listenerRef.current) {
      NativeBridge.removeMarkerListener(listenerRef.current);
      listenerRef.current = null;
    }
    setIsTracking(false);
    setMarkers([]);
    setFps(0);
  }, [isTracking]);

  const handleNativeEvent = useCallback((data: FrameData) => {
    if (data.frameWidth && data.frameHeight) {
      setFrameDimensions({ width: data.frameWidth, height: data.frameHeight });
    }
    const processed = processorRef.current.process(data.markers);
    setMarkers(processed);
    setFps(Math.round(data.fps));
  }, []);

  const onCameraViewMarkers = useCallback(
    (event: { nativeEvent: any }) => {
      const raw = event.nativeEvent;
      if (!raw) return;
      const frameData: FrameData = {
        markers: parseNativeMarkers(raw.markers),
        fps: raw.fps || 0,
        timestamp: Date.now(),
        frameWidth: raw.frameWidth,
        frameHeight: raw.frameHeight,
      };
      handleNativeEvent(frameData);
    },
    [handleNativeEvent]
  );

  useEffect(() => {
    if (!isTracking) return;

    listenerRef.current = NativeBridge.addMarkerListener((data: FrameData) => {
      handleNativeEvent(data);
    });

    return () => {
      if (listenerRef.current) {
        NativeBridge.removeMarkerListener(listenerRef.current);
        listenerRef.current = null;
      }
    };
  }, [isTracking, handleNativeEvent]);

  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        NativeBridge.removeMarkerListener(listenerRef.current);
      }
      NativeBridge.stopTracking();
    };
  }, []);

  return {
    markers,
    fps,
    frameDimensions,
    isTracking,
    startTracking,
    stopTracking,
    onCameraViewMarkers,
    markerCount: markers.length,
    isNativeAvailable: NativeBridge.isAvailable,
  };
};
