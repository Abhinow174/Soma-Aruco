export class KalmanFilter {
  private x: number[];
  private P: number[][];
  private Q: number[][];
  private R: number[][];
  private lastUpdate: number;

  constructor(initialX: number, initialY: number, dt: number) {
    this.x = [initialX, initialY, 0, 0];
    this.P = [
      [10, 0, 0, 0],
      [0, 10, 0, 0],
      [0, 0, 100, 0],
      [0, 0, 0, 100],
    ];
    this.Q = [
      [0.1, 0, 0, 0],
      [0, 0.1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    this.R = [
      [5, 0],
      [0, 5],
    ];
    this.lastUpdate = Date.now();
  }

  public update(measureX: number, measureY: number): { x: number; y: number; vx: number; vy: number } {
    const now = Date.now();
    let dt = (now - this.lastUpdate) / 1000.0;
    if (dt <= 0 || dt > 0.5) dt = 0.033;
    this.lastUpdate = now;

    const F = [
      [1, 0, dt, 0],
      [0, 1, 0, dt],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];

    let xPred = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        xPred[i] += F[i][j] * this.x[j];
      }
    }

    let PPred = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          PPred[i][j] += F[i][k] * this.P[k][j];
        }
      }
    }

    let PPredFT = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          PPredFT[i][j] += PPred[i][k] * F[j][k];
        }
        PPredFT[i][j] += this.Q[i][j];
      }
    }
    PPred = PPredFT;

    const yTilde = [measureX - xPred[0], measureY - xPred[1]];

    const S = [
      [PPred[0][0] + this.R[0][0], PPred[0][1] + this.R[0][1]],
      [PPred[1][0] + this.R[1][0], PPred[1][1] + this.R[1][1]],
    ];

    const detS = S[0][0] * S[1][1] - S[0][1] * S[1][0];
    let SInv = [[0, 0], [0, 0]];
    if (Math.abs(detS) > 1e-6) {
      SInv = [
        [S[1][1] / detS, -S[0][1] / detS],
        [-S[1][0] / detS, S[0][0] / detS],
      ];
    } else {
      SInv = [
        [1, 0],
        [0, 1],
      ];
    }

    let PPredHT = [
      [PPred[0][0], PPred[0][1]],
      [PPred[1][0], PPred[1][1]],
      [PPred[2][0], PPred[2][1]],
      [PPred[3][0], PPred[3][1]],
    ];

    const K = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
          K[i][j] += PPredHT[i][k] * SInv[k][j];
        }
      }
    }

    this.x = [0, 0, 0, 0];
    for (let i = 0; i < 4; i++) {
      let term = 0;
      for (let j = 0; j < 2; j++) {
        term += K[i][j] * yTilde[j];
      }
      this.x[i] = xPred[i] + term;
    }

    const KH = [
      [K[0][0], K[0][1], 0, 0],
      [K[1][0], K[1][1], 0, 0],
      [K[2][0], K[2][1], 0, 0],
      [K[3][0], K[3][1], 0, 0],
    ];

    const I_KH = [
      [1 - KH[0][0], -KH[0][1], 0, 0],
      [-KH[1][0], 1 - KH[1][1], 0, 0],
      [-KH[2][0], -KH[2][1], 1, 0],
      [-KH[3][0], -KH[3][1], 0, 1],
    ];

    this.P = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          this.P[i][j] += I_KH[i][k] * PPred[k][j];
        }
      }
    }

    return {
      x: this.x[0],
      y: this.x[1],
      vx: this.x[2],
      vy: this.x[3],
    };
  }

  public getDirectionAndSpeed(stationaryThreshold: number = 5): { speed: number; direction: string } {
    const vx = this.x[2];
    const vy = this.x[3];
    const speed = Math.sqrt(vx * vx + vy * vy);

    if (speed < stationaryThreshold) {
      return { speed, direction: 'STATIONARY' };
    }

    const angle = Math.atan2(vy, vx) * (180 / Math.PI);
    let direction = 'STATIONARY';

    if (angle > -22.5 && angle <= 22.5) direction = 'RIGHT';
    else if (angle > 22.5 && angle <= 67.5) direction = 'DOWN_RIGHT';
    else if (angle > 67.5 && angle <= 112.5) direction = 'DOWN';
    else if (angle > 112.5 && angle <= 157.5) direction = 'DOWN_LEFT';
    else if (angle > 157.5 || angle <= -157.5) direction = 'LEFT';
    else if (angle > -157.5 && angle <= -112.5) direction = 'UP_LEFT';
    else if (angle > -112.5 && angle <= -67.5) direction = 'UP';
    else if (angle > -67.5 && angle <= -22.5) direction = 'UP_RIGHT';

    return { speed, direction };
  }
}
