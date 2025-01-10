module.exports = {
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: jest.fn(),
  };
  