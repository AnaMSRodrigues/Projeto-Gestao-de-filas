// Testes unitários de renderização do componente + verificação estado inicial 
import { render, screen, fireEvent } from '@testing-library/react';
import OperadorPainel from '../components/operadorPainel';

jest.mock('react-router-dom', () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }));  

jest.mock('../services/apiService', () => ({
  alteraPendente: jest.fn(),
  chamarPrimeiraSenha: jest.fn(),
  fetchSenhasPorEstado: jest.fn(),
  finalizarSenha: jest.fn(),
}));

describe('Componente OperadorPainel', () => {
  test('Renderiza corretamente os elementos iniciais', () => {
    render(<OperadorPainel isAuthenticated={true} role="operador" />);

    // Verifica se os principais elementos são renderizados
    expect(screen.getByText('Painel do Operador')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chamar próxima senha/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finalizar senha/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alterar para pendente/i })).toBeInTheDocument();

    // Verifica se a lista de senhas está presente
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  test('Estado inicial está configurado corretamente', () => {
    const { container } = render(<OperadorPainel isAuthenticated={true} role="operador" />);

    // Verifica se o estado inicial está vazio ou com os valores padrões
    const senhasList = container.querySelector('ul');
    expect(senhasList.children.length).toBe(0); // Lista de senhas vazia inicialmente

    // Verifica se os botões estão desabilitados, se aplicável
    const chamarProximaSenhaButton = screen.getByRole('button', { name: /chamar próxima senha/i });
    expect(chamarProximaSenhaButton).not.toBeDisabled();

    const finalizarSenhaButton = screen.getByRole('button', { name: /finalizar senha/i });
    expect(finalizarSenhaButton).toBeDisabled();

    const alterarParaPendenteButton = screen.getByRole('button', { name: /alterar para pendente/i });
    expect(alterarParaPendenteButton).toBeDisabled();
  });
});
