// Testes unitários de renderização do componente + verificação estado inicial 
import { render, screen, fireEvent } from '@testing-library/react';
import CriarSenha from ('../components/CriarSenha')

jest.mock('../services/apiService', () => ({
  adicionarSenha: jest.fn(),
  atualizarEstadoSenhaAuto: jest.fn(),
}));

describe('Componente CriarSenha', () => {
  test('Renderiza corretamente com os elementos iniciais', () => {
    render(<CriarSenha />);

    expect(screen.getByText('Escolha o Serviço')).toBeInTheDocument();
    expect(screen.getByText('Escolha o Tipo de Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /senha geral/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /senha prioritária/i })).toBeInTheDocument();
  });

  test('Exibe erro ao tentar criar senha sem selecionar um serviço', async () => {
    render(<CriarSenha />);

    const criarSenhaButton = screen.getByRole('button', { name: /senha geral/i });

    // Simula clique no botão desativado
    fireEvent.click(criarSenhaButton);

    // Verifica se o botão está desabilitado
    expect(criarSenhaButton).toBeDisabled();
  });
});
