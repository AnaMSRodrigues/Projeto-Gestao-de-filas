// Testes à renderização do componente GestorPainel + verificação estado inicial 

import { render, screen } from '@testing-library/react';
import GestorPainel from '../components/gestorPainel';

jest.mock('../services/apiService', () => ({
  fetchDadosGerenciais: jest.fn(),
  atualizarStatus: jest.fn(),
}));

describe('Componente GestorPainel', () => {
  test('Renderiza corretamente os elementos iniciais', () => {
    render(<GestorPainel isAuthenticated={true} role="gestor" />);

    // Verifica se os principais elementos são renderizados
    expect(screen.getByText('Painel do Gestor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /atualizar dados/i })).toBeInTheDocument();
  });

  test('Estado inicial está configurado corretamente', () => {
    const { container } = render(<GestorPainel isAuthenticated={true} role="gestor" />);

    // Verifica se o botão de atualizar está a funcionar
    const atualizarButton = screen.getByRole('button', { name: /atualizar dados/i });
    expect(atualizarButton).not.toBeDisabled();
  });
});