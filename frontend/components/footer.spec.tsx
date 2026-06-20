import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './footer';

describe('Footer', () => {
  it('should render the Fio & Luz credit text', () => {
    render(<Footer />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByText(/Fio & Luz/)).toBeInTheDocument();
    expect(screen.getByText(/bordar/)).toBeInTheDocument();
  });
});
