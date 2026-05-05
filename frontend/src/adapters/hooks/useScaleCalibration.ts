import { useState, useEffect } from 'react';
import { DeviceScale, DEFAULT_SCALE } from '../../domain/value_objects/DeviceScale';

const STORAGE_KEY = 'fioeluz_device_scale';

export function useScaleCalibration() {
  const [scale, setScale] = useState<DeviceScale>(DEFAULT_SCALE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScale({
          pixelsPerCm: parsed.pixelsPerCm,
          lastCalibratedAt: new Date(parsed.lastCalibratedAt),
        });
      } catch (e) {
        console.error("Erro ao carregar calibração:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveCalibration = (pixelsPerCm: number) => {
    const newScale: DeviceScale = {
      pixelsPerCm,
      lastCalibratedAt: new Date(),
    };
    setScale(newScale);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newScale));
  };

  return {
    scale,
    saveCalibration,
    isLoaded,
    isCalibrated: scale.lastCalibratedAt.getTime() > 0,
  };
}
