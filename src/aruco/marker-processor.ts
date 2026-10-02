import { RawMarker, ProcessedMarker, Point } from './types';
import { KalmanFilter } from './kalman-filter';

export class MarkerProcessor {
  private filters = new Map<number, KalmanFilter>();
  private lastSeen = new Map<number, number>();
  private timeoutMs: number;
  private stationaryThreshold: number;
  private maxTrackedMarkers: number;

  constructor(timeoutMs: number = 500, stationaryThreshold: number = 5, maxTrackedMarkers: number = 20) {
    this.timeoutMs = timeoutMs;
    this.stationaryThreshold = stationaryThreshold;
    this.maxTrackedMarkers = maxTrackedMarkers;
  }

  public process(rawMarkers: RawMarker[]): ProcessedMarker[] {
    const now = Date.now();
    const processed: ProcessedMarker[] = [];

    const validMarkers = rawMarkers
      .filter((m) => m.id >= 0 && m.id < this.maxTrackedMarkers)
      .slice(0, this.maxTrackedMarkers);

    for (const marker of validMarkers) {
      if (!this.filters.has(marker.id)) {
        this.filters.set(marker.id, new KalmanFilter(marker.center.x, marker.center.y, 0.016));
      }
      this.lastSeen.set(marker.id, now);

      const filter = this.filters.get(marker.id)!;
      const state = filter.update(marker.center.x, marker.center.y);
      const { speed, direction } = filter.getDirectionAndSpeed(this.stationaryThreshold);

      const dx = state.x - marker.center.x;
      const dy = state.y - marker.center.y;

      const filteredCorners: [Point, Point, Point, Point] = [
        { x: marker.corners[0].x + dx, y: marker.corners[0].y + dy },
        { x: marker.corners[1].x + dx, y: marker.corners[1].y + dy },
        { x: marker.corners[2].x + dx, y: marker.corners[2].y + dy },
        { x: marker.corners[3].x + dx, y: marker.corners[3].y + dy },
      ];

      processed.push({
        id: marker.id,
        corners: filteredCorners,
        center: { x: state.x, y: state.y },
        velocityX: state.vx,
        velocityY: state.vy,
        speed,
        direction,
      });
    }

    for (const [id, time] of this.lastSeen.entries()) {
      if (now - time > this.timeoutMs) {
        this.filters.delete(id);
        this.lastSeen.delete(id);
      }
    }

    return processed;
  }
}
