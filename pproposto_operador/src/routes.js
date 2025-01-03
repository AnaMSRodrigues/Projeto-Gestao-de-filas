// routes.js
import React from 'react';
import { Route } from 'react-router-dom';
import Login from './pages/login';
import OperadorPainel from './components/operadorPainel';
import GestorPainel from './components/gestorPainel';  // Exemplo de painel do gestor

const Routes = () => {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/painel/operador" element={<OperadorPainel />} />
      <Route path="/painel/gestor" element={<GestorPainel />} />
      
      {/* Redirecionamento para login em caso de rota não encontrada */}
      <Route path="*" element={<Login />} />
    </>
  );
};

export default Routes;
