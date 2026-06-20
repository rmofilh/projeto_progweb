import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useScaleCalibration } from './useScaleCalibration';

const STORAGE_KEY = 'fioeluz_device_scale';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    length: 0,
    key: vi.fn(() => null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useScaleCalibration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should start with default scale (not calibrated)', () => {
    const { result } = renderHook(() => useScaleCalibration());
    expect(result.current.scale.pixelsPerCm).toBe(38);
    expect(result.current.isCalibrated).toBe(false);
  });

  it('should save calibration and update state', () => {
    const { result } = renderHook(() => useScaleCalibration());
    act(() => {
      result.current.saveCalibration(42);
    });
    expect(result.current.scale.pixelsPerCm).toBe(42);
    expect(result.current.isCalibrated).toBe(true);
  });

  it('should persist calibration to localStorage', () => {
    const { result } = renderHook(() => useScaleCalibration());
    act(() => {
      result.current.saveCalibration(50);
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
    const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(saved.pixelsPerCm).toBe(50);
  });

  it('should restore calibration from localStorage on mount', () => {
    const savedData = JSON.stringify({ pixelsPerCm: 45, lastCalibratedAt: new Date().toISOString() });
    localStorageMock.getItem.mockReturnValueOnce(savedData);
    const { result } = renderHook(() => useScaleCalibration());
    expect(result.current.scale.pixelsPerCm).toBe(45);
    expect(result.current.isCalibrated).toBe(true);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid json');
    const { result } = renderHook(() => useScaleCalibration());
    expect(result.current.scale.pixelsPerCm).toBe(38);
    expect(result.current.isCalibrated).toBe(false);
  });
});
