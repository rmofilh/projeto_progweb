export interface DeviceScale {
  pixelsPerCm: number;
  lastCalibratedAt: Date;
}

export const DEFAULT_SCALE: DeviceScale = {
  pixelsPerCm: 38, // Aproximação comum para 96 DPI
  lastCalibratedAt: new Date(0),
};
