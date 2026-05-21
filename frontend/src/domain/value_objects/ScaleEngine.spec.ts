import { describe, it, expect } from 'vitest';
import { ScaleEngine } from './ScaleEngine';
import { DeviceScale } from './DeviceScale';

describe('ScaleEngine (Domain Layer)', () => {
  describe('calculateScaleFactor', () => {
    it('should return correct scale factor for given cm and natural pixel size', () => {
      // Arrange
      const deviceScale: DeviceScale = { pixelsPerCm: 100, isCalibrated: true, updatedAt: new Date() };
      const cmReference = 5; // 5cm physical size
      const naturalPixelSize = 250; // The image is natively 250px wide
      // Expected desiredPixels = 5 * 100 = 500px
      // Expected scaleFactor = 500 / 250 = 2

      // Act
      const scaleFactor = ScaleEngine.calculateScaleFactor(cmReference, naturalPixelSize, deviceScale);

      // Assert
      expect(scaleFactor).toBe(2);
    });

    it('should return 1 if natural pixel size is 0 to avoid division by zero', () => {
      // Arrange
      const deviceScale: DeviceScale = { pixelsPerCm: 100, isCalibrated: true, updatedAt: new Date() };
      
      // Act
      const scaleFactor = ScaleEngine.calculateScaleFactor(10, 0, deviceScale);

      // Assert
      expect(scaleFactor).toBe(1);
    });
  });

  describe('cmToPixels', () => {
    it('should convert physical cm size to pixels based on current calibration', () => {
      // Arrange
      const deviceScale: DeviceScale = { pixelsPerCm: 37.8, isCalibrated: false, updatedAt: new Date() };
      
      // Act
      const pixels = ScaleEngine.cmToPixels(10, deviceScale); // 10cm

      // Assert
      expect(pixels).toBe(378);
    });
  });
});
