import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import AgendarSenha from '../components/AgendarSenha'; 

describe('AgendarSenha Component', () => {
  test('deve renderizar os elementos principais corretamente', () => {
    render(<AgendarSenha />);

    // Verifica se os botões estão presentes
    expect(screen.getByText('Senha Geral')).toBeInTheDocument();
    expect(screen.getByText('Senha Prioritária')).toBeInTheDocument();

    // Verifica se os campos de texto estão presentes
    expect(screen.getByLabelText('Número de Receita (19 dígitos)')).toBeInTheDocument();
    expect(screen.getByLabelText('Pin de Acesso (6 dígitos)')).toBeInTheDocument();
    expect(screen.getByLabelText('PIN de Opção (4 dígitos)')).toBeInTheDocument();

    // Verifica se os componentes de seleção estão presentes
    expect(screen.getByLabelText('Selecione o Serviço')).toBeInTheDocument();
    expect(screen.getByLabelText('Selecione a Data de Agendamento')).toBeInTheDocument();
    expect(screen.getByLabelText('Selecione o Horário')).toBeInTheDocument();

    // Verifica se o botão de validação de receita está presente
    expect(screen.getByText('Ver disponibilidade dos medicamentos')).toBeInTheDocument();
  });

  test('estado inicial deve estar vazio ou padrão', () => {
    render(<AgendarSenha />);

    // Verifica os valores iniciais dos inputs
    expect(screen.getByLabelText('Número de Receita (19 dígitos)')).toHaveValue('');
    expect(screen.getByLabelText('Pin de Acesso (6 dígitos)')).toHaveValue('');
    expect(screen.getByLabelText('PIN de Opção (4 dígitos)')).toHaveValue('');
    expect(screen.getByLabelText('Selecione o Serviço')).toHaveValue('');
    expect(screen.getByLabelText('Selecione a Data de Agendamento')).toHaveValue(null);
    expect(screen.getByLabelText('Selecione o Horário')).toHaveValue(null);

    // Verifica se nenhuma mensagem de erro ou sucesso está presente
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
