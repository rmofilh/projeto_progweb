import { render, screen, fireEvent } from '@testing-library/react';
import { Catalog } from './catalog';
import { Pattern } from '@/src/domain/entities/Pattern';
import { describe, it, expect } from 'vitest';

const mockPatterns: Pattern[] = [
  { 
    id: '1', 
    title: 'Buquê Floral', 
    difficulty: 1, 
    imagePath: '/test.png', 
    thumbnailPath: '/test.png', 
    scaleCmReference: 15 
  },
  { 
    id: '2', 
    title: 'Gato Geométrico', 
    difficulty: 3, 
    imagePath: '/test.png', 
    thumbnailPath: '/test.png', 
    scaleCmReference: 20 
  },
];

describe('Catalog Component (Presentation Layer)', () => {
  it('should render the catalog title and all patterns', () => {
    // Act
    render(<Catalog initialPatterns={mockPatterns} />);

    // Assert
    expect(screen.getByText('Riscos em Destaque')).toBeInTheDocument();
    expect(screen.getByText('Buquê Floral')).toBeInTheDocument();
    expect(screen.getByText('Gato Geométrico')).toBeInTheDocument();
  });

  it('should filter the list when searching', async () => {
    // Arrange
    render(<Catalog initialPatterns={mockPatterns} />);
    const searchInput = screen.getByPlaceholderText('Buscar por tema...');

    // Act
    fireEvent.change(searchInput, { target: { value: 'Floral' } });

    // Assert
    expect(screen.getByText('Buquê Floral')).toBeInTheDocument();
    expect(screen.queryByText('Gato Geométrico')).not.toBeInTheDocument();
  });

  it('should show all patterns when search is cleared', () => {
     // Arrange
     render(<Catalog initialPatterns={mockPatterns} />);
     const searchInput = screen.getByPlaceholderText('Buscar por tema...');

     // Act
     fireEvent.change(searchInput, { target: { value: 'Geometric' } });
     fireEvent.change(searchInput, { target: { value: '' } });

     // Assert
     expect(screen.getByText('Buquê Floral')).toBeInTheDocument();
     expect(screen.getByText('Gato Geométrico')).toBeInTheDocument();
  });
});
