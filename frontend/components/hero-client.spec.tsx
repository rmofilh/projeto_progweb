import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HeroClient } from './hero-client';

describe('HeroClient', () => {
  it('should render both buttons', () => {
    render(<HeroClient />);
    expect(screen.getByText('Ver Catálogo Completo')).toBeInTheDocument();
    expect(screen.getByText('Como Funciona?')).toBeInTheDocument();
  });

  it('should show modal when "Como Funciona?" is clicked', () => {
    render(<HeroClient />);
    fireEvent.click(screen.getByText('Como Funciona?'));
    expect(screen.getByText('Como Funciona a Mesa de Luz')).toBeInTheDocument();
  });

  it('should show three step instructions inside modal', () => {
    render(<HeroClient />);
    fireEvent.click(screen.getByText('Como Funciona?'));
    expect(screen.getByText(/Navegue pelo catálogo/)).toBeInTheDocument();
    expect(screen.getByText(/Calibre a tela/)).toBeInTheDocument();
    expect(screen.getByText(/Aumente o brilho/)).toBeInTheDocument();
  });

  it('should close modal when "Entendi" button is clicked', () => {
    render(<HeroClient />);
    fireEvent.click(screen.getByText('Como Funciona?'));
    expect(screen.getByText('Como Funciona a Mesa de Luz')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Entendi, vamos começar!'));
    expect(screen.queryByText('Como Funciona a Mesa de Luz')).not.toBeInTheDocument();
  });

  it('should close modal when X button is clicked', () => {
    render(<HeroClient />);
    fireEvent.click(screen.getByText('Como Funciona?'));
    const closeButton = document.querySelector('.fixed button');
    if (closeButton) fireEvent.click(closeButton);
    expect(screen.queryByText('Como Funciona a Mesa de Luz')).not.toBeInTheDocument();
  });
});
