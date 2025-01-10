// Importando bibliotecas necessárias para os testes
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
    expect(screen.getByRole('table')).toBeInTheDocument(); // Assumindo que há uma tabela de dados
  });

  test('Estado inicial está configurado corretamente', () => {
    const { container } = render(<GestorPainel isAuthenticated={true} role="gestor" />);

    // Verifica se a tabela está vazia inicialmente
    const tabela = container.querySelector('table');
    expect(tabela).toBeInTheDocument();
    expect(tabela.rows.length).toBe(1); // Apenas cabeçalho, assumindo que a tabela começa vazia

    // Verifica se o botão de atualizar está habilitado
    const atualizarButton = screen.getByRole('button', { name: /atualizar dados/i });
    expect(atualizarButton).not.toBeDisabled();
  });
});