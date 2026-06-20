import { useState, useCallback } from 'react';
import { DeviceScale, DEFAULT_SCALE } from '../../domain/value_objects/DeviceScale';

const STORAGE_KEY = 'fioeluz_device_scale';

function loadInitialState(): { scale: DeviceScale; isLoaded: boolean } {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          scale: {
            pixelsPerCm: parsed.pixelsPerCm,
            lastCalibratedAt: new Date(parsed.lastCalibratedAt),
          },
          isLoaded: true,
        };
      } catch {
        console.error("Erro ao carregar calibração do localStorage");
      }
    }
  }
  return { scale: DEFAULT_SCALE, isLoaded: true };
}

export function useScaleCalibration() {
  const [{ scale, isLoaded }, setState] = useState(loadInitialState);

  const saveCalibration = useCallback((pixelsPerCm: number) => {
    const newScale: DeviceScale = {
      pixelsPerCm,
      lastCalibratedAt: new Date(),
    };
    setState({ scale: newScale, isLoaded: true });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newScale));
  }, []);

  return {
    scale,
    saveCalibration,
    isLoaded,
    isCalibrated: scale.lastCalibratedAt.getTime() > 0,
  };
}
