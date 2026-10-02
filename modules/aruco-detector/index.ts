import React from 'react';
import { ViewProps } from 'react-native';
import { requireNativeViewManager } from 'expo-modules-core';
import { CameraView } from 'expo-camera';
import ArucoDetectorModule from './src/ArucoDetectorModule';
import type { EventSubscription } from 'expo-modules-core';

export type Marker = {
  id: number;
  corners: { x: number; y: number }[];
  center: { x: number; y: number };
};

export type ArucoEvent = {
  markers: Marker[];
  fps: number;
  frameWidth?: number;
  frameHeight?: number;
};

export type ArucoCameraViewProps = ViewProps & {
  isTracking?: boolean;
  targetFps?: number;
  onMarkersDetected?: (event: { nativeEvent: ArucoEvent }) => void;
};

let NativeArucoCameraView: any = null;
try {
  NativeArucoCameraView = requireNativeViewManager('ArucoDetector');
} catch {
  NativeArucoCameraView = null;
}

export const ArucoCameraView: React.FC<ArucoCameraViewProps> = (props) => {
  if (NativeArucoCameraView) {
    return React.createElement(NativeArucoCameraView, props);
  }
  return React.createElement(CameraView, { style: props.style, facing: 'back' });
};

export function startDetection(fps: number = 30): void {
  ArucoDetectorModule?.startDetection?.(fps);
}

export function stopDetection(): void {
  ArucoDetectorModule?.stopDetection?.();
}

export function addMarkersListener(listener: (event: ArucoEvent) => void): EventSubscription {
  return ArucoDetectorModule?.addListener?.('onMarkersDetected', listener) ?? { remove: () => {} };
}

export { ArucoDetectorModule };
