import React from 'react';
import './css/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p className="footer-text">
        &copy; {new Date().getFullYear()} Farmácia. Todos os direitos reservados.
      </p>
    </footer>
  );
};

export default Footer;
