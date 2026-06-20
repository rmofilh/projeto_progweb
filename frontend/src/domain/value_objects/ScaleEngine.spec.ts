import { describe, it, expect } from 'vitest';
import { ScaleEngine } from './ScaleEngine';
import { DeviceScale } from './DeviceScale';

function makeScale(pixelsPerCm: number = 100): DeviceScale {
  return { pixelsPerCm, lastCalibratedAt: new Date() };
}

describe('ScaleEngine (Domain Layer)', () => {
  describe('calculateScaleFactor', () => {
    it('should return correct scale factor for given cm and natural pixel size', () => {
      const deviceScale = makeScale(100);
      const scaleFactor = ScaleEngine.calculateScaleFactor(5, 250, deviceScale);
      expect(scaleFactor).toBe(2);
    });

    it('should return 1 if natural pixel size is 0 to avoid division by zero', () => {
      const deviceScale = makeScale(100);
      const scaleFactor = ScaleEngine.calculateScaleFactor(10, 0, deviceScale);
      expect(scaleFactor).toBe(1);
    });

    it('should return 0 when cmReference is 0', () => {
      const deviceScale = makeScale(100);
      const scaleFactor = ScaleEngine.calculateScaleFactor(0, 250, deviceScale);
      expect(scaleFactor).toBe(0);
    });

    it('should handle negative cmReference', () => {
      const deviceScale = makeScale(100);
      const scaleFactor = ScaleEngine.calculateScaleFactor(-5, 250, deviceScale);
      expect(scaleFactor).toBe(-2);
    });

    it('should handle very large values without returning NaN', () => {
      const deviceScale = makeScale(38);
      const scaleFactor = ScaleEngine.calculateScaleFactor(1e6, 500, deviceScale);
      expect(scaleFactor).not.toBeNaN();
      expect(scaleFactor).toBeGreaterThan(0);
    });

    it('should handle naturalPixelSize of 1 correctly', () => {
      const deviceScale = makeScale(38);
      const scaleFactor = ScaleEngine.calculateScaleFactor(10, 1, deviceScale);
      expect(scaleFactor).toBe(380);
    });
  });

  describe('cmToPixels', () => {
    it('should convert physical cm size to pixels based on current calibration', () => {
      const deviceScale = makeScale(37.8);
      const pixels = ScaleEngine.cmToPixels(10, deviceScale);
      expect(pixels).toBe(378);
    });

    it('should return 0 when cm is 0', () => {
      const deviceScale = makeScale(100);
      const pixels = ScaleEngine.cmToPixels(0, deviceScale);
      expect(pixels).toBe(0);
    });

    it('should handle negative cm values', () => {
      const deviceScale = makeScale(38);
      const pixels = ScaleEngine.cmToPixels(-10, deviceScale);
      expect(pixels).toBe(-380);
    });

    it('should handle cm with decimal precision', () => {
      const deviceScale = makeScale(37.8);
      const pixels = ScaleEngine.cmToPixels(0.5, deviceScale);
      expect(pixels).toBeCloseTo(18.9);
    });

    it('should handle very large cm values', () => {
      const deviceScale = makeScale(38);
      const pixels = ScaleEngine.cmToPixels(1e6, deviceScale);
      expect(pixels).not.toBeNaN();
      expect(pixels).toBe(38e6);
    });
  });
});
