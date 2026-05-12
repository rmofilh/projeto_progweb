import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ExampleComponent } from './ExampleComponent'
import React from 'react'

describe('ExampleComponent', () => {
  it('deve renderizar a mensagem de setup concluído', () => {
    render(<ExampleComponent />)
    
    expect(screen.getByText('Setup de Teste Concluído')).toBeInTheDocument()
    expect(screen.getByText('Vitest + RTL funcionando!')).toBeInTheDocument()
  })
})
