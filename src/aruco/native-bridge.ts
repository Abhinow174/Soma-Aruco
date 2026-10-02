import { FrameData, RawMarker } from './types';

let ArucoModule: any = null;
let addMarkersListenerFn: ((listener: (event: any) => void) => { remove: () => void }) | null = null;

try {
  const mod = require('../../modules/aruco-detector');
  ArucoModule = mod;
  addMarkersListenerFn = mod.addMarkersListener;
} catch {
  ArucoModule = null;
  addMarkersListenerFn = null;
}

const isAvailable = !!ArucoModule;

export function parseNativeMarkers(nativeMarkers: any[]): RawMarker[] {
  if (!Array.isArray(nativeMarkers)) return [];
  return nativeMarkers.map((m: any) => ({
    id: m.id,
    corners: [
      { x: m.corners[0].x, y: m.corners[0].y },
      { x: m.corners[1].x, y: m.corners[1].y },
      { x: m.corners[2].x, y: m.corners[2].y },
      { x: m.corners[3].x, y: m.corners[3].y },
    ] as [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }],
    center: { x: m.center.x, y: m.center.y },
  }));
}

export const NativeBridge = {
  isAvailable,

  startTracking: async (fps: number = 30): Promise<boolean> => {
    if (!isAvailable) return false;
    try {
      ArucoModule.startDetection(fps);
      return true;
    } catch {
      return false;
    }
  },

  stopTracking: async (): Promise<boolean> => {
    if (!isAvailable) return false;
    try {
      ArucoModule.stopDetection();
      return true;
    } catch {
      return false;
    }
  },

  addMarkerListener: (callback: (data: FrameData) => void) => {
    if (!addMarkersListenerFn) return { remove: () => {} };
    return addMarkersListenerFn((event: any) => {
      const frameData: FrameData = {
        markers: parseNativeMarkers(event.markers),
        fps: event.fps || 0,
        timestamp: Date.now(),
        frameWidth: event.frameWidth,
        frameHeight: event.frameHeight,
      };
      callback(frameData);
    });
  },

  removeMarkerListener: (listener: { remove: () => void }) => {
    if (listener && listener.remove) {
      listener.remove();
    }
  },
};
