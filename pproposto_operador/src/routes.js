// routes.js
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Login from './pages/login';
import OperadorPainel from './components/operadorPainel';
import GestorPainel from './components/gestorPainel';

const Routes = () => {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/operador" element={<OperadorPainel />} />
      <Route path="/gestor" element={<GestorPainel />} />
      <Route path="operador2" element={<OperadorPainel />} />

      <Route path="*" element={<Login />} />
    </>
  );
};

export default Routes;
