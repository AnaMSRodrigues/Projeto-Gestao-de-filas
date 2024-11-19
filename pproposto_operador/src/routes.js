// routes.js
import React from 'react';
import { Route } from 'react-router-dom';
import Login from './pages/Login';
import OperadorPainel from './components/OperadorPainel';
import GestorPainel from './components/GestorPainel';  // Exemplo de painel do gestor
import AdministradorPainel from './components/AdministradorPainel';  // Exemplo de painel do administrador

const Routes = () => {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/operador" element={<OperadorPainel />} />
      <Route path="/gestor" element={<GestorPainel />} />
      <Route path="/administrador" element={<AdministradorPainel />} />
      
      {/* Redirecionamento para login em caso de rota não encontrada */}
      <Route path="*" element={<Login />} />
    </>
  );
};

export default Routes;
