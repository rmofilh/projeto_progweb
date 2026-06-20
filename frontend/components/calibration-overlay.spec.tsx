import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CalibrationOverlay } from './calibration-overlay';

describe('CalibrationOverlay', () => {
  it('should render the overlay with credit card reference', () => {
    render(<CalibrationOverlay onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('Calibração de Escala')).toBeInTheDocument();
    expect(screen.getByText('Posicione seu cartão aqui')).toBeInTheDocument();
  });

  it('should display default pixelsPerCm value of 38', () => {
    render(<CalibrationOverlay onSave={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByText('38.0')).toBeInTheDocument();
    expect(screen.getByText('px/cm')).toBeInTheDocument();
  });

  it('should increase pixelsPerCm when clicking "+ Maior"', () => {
    render(<CalibrationOverlay onSave={vi.fn()} onClose={vi.fn()} />);
    const increaseButton = screen.getByText('+ Maior');
    fireEvent.click(increaseButton);
    expect(screen.getByText('38.5')).toBeInTheDocument();
  });

  it('should decrease pixelsPerCm when clicking "- Menor"', () => {
    render(<CalibrationOverlay onSave={vi.fn()} onClose={vi.fn()} />);
    const decreaseButton = screen.getByText('- Menor');
    fireEvent.click(decreaseButton);
    expect(screen.getByText('37.5')).toBeInTheDocument();
  });

  it('should not go below minimum of 10 pixelsPerCm', () => {
    render(<CalibrationOverlay onSave={vi.fn()} onClose={vi.fn()} />);
    const decreaseButton = screen.getByText('- Menor');
    // Click 60 times to go from 38 to below 10
    for (let i = 0; i < 60; i++) {
      fireEvent.click(decreaseButton);
    }
    expect(screen.getByText('10.0')).toBeInTheDocument();
  });

  it('should call onSave with current pixelsPerCm when saving', () => {
    const onSave = vi.fn();
    render(<CalibrationOverlay onSave={onSave} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Salvar Calibração'));
    expect(onSave).toHaveBeenCalledWith(38);
  });

  it('should call onClose when clicking Cancelar', () => {
    const onClose = vi.fn();
    render(<CalibrationOverlay onSave={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onSave with updated value after adjustment', () => {
    const onSave = vi.fn();
    render(<CalibrationOverlay onSave={onSave} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('+ Maior'));
    fireEvent.click(screen.getByText('Salvar Calibração'));
    expect(onSave).toHaveBeenCalledWith(38.5);
  });

  it('should render the credit card rectangle with inline style', () => {
    render(<CalibrationOverlay onSave={vi.fn()} onClose={vi.fn()} />);
    const cardContainer = screen.getByText('Posicione seu cartão aqui').closest('div');
    expect(cardContainer?.previousElementSibling).toBeTruthy();
  });
});
