export type Point = { x: number; y: number };

export type RawMarker = {
  id: number;
  corners: [Point, Point, Point, Point];
  center: Point;
};

export type ProcessedMarker = {
  id: number;
  corners: [Point, Point, Point, Point];
  center: Point;
  velocityX: number;
  velocityY: number;
  speed: number;
  direction: string;
};

export type FrameData = {
  markers: RawMarker[];
  fps: number;
  timestamp: number;
  frameWidth?: number;
  frameHeight?: number;
};

export type SessionFrame = {
  timestamp: number;
  markers: ProcessedMarker[];
  fps: number;
};

export type RecordingSession = {
  id: string;
  startedAt: number;
  frames: SessionFrame[];
};
