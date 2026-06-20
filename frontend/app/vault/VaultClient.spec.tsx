import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QueryProvider from '@/src/presentation/providers/QueryProvider';
import { VaultClient } from './VaultClient';
import { Collection } from '@/src/domain/entities/Collection';

const mockFavorites = [
  {
    id: '1',
    title: 'Buquê de Primavera',
    imagePath: '/pattern-floral.png',
    thumbnailPath: '/pattern-floral.png',
    scaleCmReference: 15,
    difficulty: 1 as const,
    collectionId: 'c1',
  },
  {
    id: '2',
    title: 'Gato na Lua',
    imagePath: '/pattern-animal.png',
    thumbnailPath: '/pattern-animal.png',
    scaleCmReference: 12,
    difficulty: 2 as const,
    collectionId: 'c2',
  },
];

const mockCollections: Collection[] = [
  { id: 'c1', title: 'Natureza', coverImagePath: '/pattern-floral.png' },
  { id: 'c2', title: 'Animais', coverImagePath: '/pattern-animal.png' },
];

const { mockUseFavorites, mockUseToggleFavorite } = vi.hoisted(() => ({
  mockUseFavorites: vi.fn(() => ({ data: mockFavorites, isLoading: false })),
  mockUseToggleFavorite: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock('@/src/presentation/hooks/useFavorites', () => ({
  useFavorites: mockUseFavorites,
}));

vi.mock('@/src/presentation/hooks/useToggleFavorite', () => ({
  useToggleFavorite: mockUseToggleFavorite,
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<QueryProvider>{ui}</QueryProvider>);
}

describe('VaultClient', () => {
  it('should render "Meu Baú Pessoal" title', () => {
    renderWithProviders(<VaultClient collections={mockCollections} />);
    expect(screen.getByText('Meu Baú Pessoal')).toBeInTheDocument();
  });

  it('should render favorite patterns', () => {
    renderWithProviders(<VaultClient collections={mockCollections} />);
    expect(screen.getByText('Buquê de Primavera')).toBeInTheDocument();
    expect(screen.getByText('Gato na Lua')).toBeInTheDocument();
  });

  it('should show search input when favorites exist', () => {
    renderWithProviders(<VaultClient collections={mockCollections} />);
    expect(screen.getByPlaceholderText('Buscar nos favoritos...')).toBeInTheDocument();
  });

  it('should filter favorites by search term', () => {
    renderWithProviders(<VaultClient collections={mockCollections} />);
    const searchInput = screen.getByPlaceholderText('Buscar nos favoritos...');
    fireEvent.change(searchInput, { target: { value: 'Gato' } });
    expect(screen.queryByText('Buquê de Primavera')).not.toBeInTheDocument();
    expect(screen.getByText('Gato na Lua')).toBeInTheDocument();
  });

  it('should show empty state when there are no favorites', () => {
    mockUseFavorites.mockReturnValue({ data: [], isLoading: false });
    renderWithProviders(<VaultClient collections={mockCollections} />);
    expect(screen.getByText('Seu baú está vazio')).toBeInTheDocument();
    expect(screen.getByText('Ir para o Catálogo')).toBeInTheDocument();
  });

  it('should show skeleton while loading', () => {
    mockUseFavorites.mockReturnValue({ data: [], isLoading: true });
    const { container } = renderWithProviders(<VaultClient collections={mockCollections} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render collection filter buttons', () => {
    mockUseFavorites.mockReturnValue({ data: mockFavorites, isLoading: false });
    renderWithProviders(<VaultClient collections={mockCollections} />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Natureza')).toBeInTheDocument();
    expect(screen.getByText('Animais')).toBeInTheDocument();
  });

  it('should filter by collection when a collection button is clicked', () => {
    renderWithProviders(<VaultClient collections={mockCollections} />);
    fireEvent.click(screen.getByText('Natureza'));
    expect(screen.getByText('Buquê de Primavera')).toBeInTheDocument();
    expect(screen.queryByText('Gato na Lua')).not.toBeInTheDocument();
  });

  it('should show difficulty filter buttons', () => {
    renderWithProviders(<VaultClient collections={mockCollections} />);
    expect(screen.getByTitle('Dificuldade 1')).toBeInTheDocument();
    expect(screen.getByTitle('Dificuldade 5')).toBeInTheDocument();
  });

  it('should show "Abrir Mesa de Luz" links for each pattern', () => {
    renderWithProviders(<VaultClient collections={mockCollections} />);
    const links = screen.getAllByText('Abrir Mesa de Luz');
    expect(links.length).toBe(2);
  });
});
