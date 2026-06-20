import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockUseScaleCalibration } = vi.hoisted(() => {
  const defaultScaleReturn = {
    scale: { pixelsPerCm: 38, lastCalibratedAt: new Date(0) },
    saveCalibration: vi.fn(),
    isLoaded: true,
    isCalibrated: false,
  };
  return {
    mockUseScaleCalibration: vi.fn(() => defaultScaleReturn),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

vi.mock('@/src/presentation/hooks/useScaleCalibration', () => ({
  useScaleCalibration: mockUseScaleCalibration,
}));

import { LightTableEngine } from './engine';

const mockPattern = {
  id: '1',
  title: 'Buquê de Primavera',
  imagePath: '/pattern-floral.png',
  thumbnailPath: '/pattern-floral.png',
  scaleCmReference: 15,
  difficulty: 1 as const,
  collectionId: 'c1',
};

describe('LightTableEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseScaleCalibration.mockImplementation(() => ({
      scale: { pixelsPerCm: 38, lastCalibratedAt: new Date(0) },
      saveCalibration: vi.fn(),
      isLoaded: true,
      isCalibrated: false,
    }));
  });

  it('should render the pattern title', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    expect(screen.getByText('Buquê de Primavera')).toBeInTheDocument();
  });

  it('should render the "Ativar Mesa de Luz" button', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    expect(screen.getByText('Ativar Mesa de Luz')).toBeInTheDocument();
  });

  it('should show calibration status as not calibrated by default', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    expect(screen.getByText(/Não Calibrado/)).toBeInTheDocument();
  });

  it('should show calibration status as calibrated when calibration exists', () => {
    mockUseScaleCalibration.mockImplementation(() => ({
      scale: { pixelsPerCm: 38, lastCalibratedAt: new Date() },
      saveCalibration: vi.fn(),
      isLoaded: true,
      isCalibrated: true,
    }));
    render(<LightTableEngine pattern={mockPattern} />);
    expect(screen.getByText(/Calibrada/)).toBeInTheDocument();
  });

  it('should render hoop size selector buttons', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    expect(screen.getByText('Simulador de Bastidor')).toBeInTheDocument();
    expect(screen.getByText('10cm')).toBeInTheDocument();
    expect(screen.getByText('14cm')).toBeInTheDocument();
    expect(screen.getByText('18cm')).toBeInTheDocument();
    expect(screen.getByText('22cm')).toBeInTheDocument();
  });

  it('should render instructions section', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    expect(screen.getByText('Instruções de Uso:')).toBeInTheDocument();
    expect(screen.getByText(/Aumente o brilho/)).toBeInTheDocument();
  });

  it('should render the pattern image with Next.js Image optimization', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    const img = screen.getByAltText('Buquê de Primavera') as HTMLImageElement;
    expect(img.src).toContain('pattern-floral.png');
  });

  it('should render scale reference text in the hoop simulator info', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    expect(screen.getByText(/15cm/)).toBeInTheDocument();
  });

  it('should render the back button', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    const backButton = document.querySelector('header button');
    expect(backButton).toBeTruthy();
  });

  it('should render Ocultar button for hoop simulator', () => {
    render(<LightTableEngine pattern={mockPattern} />);
    expect(screen.getByText('Ocultar')).toBeInTheDocument();
  });
});
