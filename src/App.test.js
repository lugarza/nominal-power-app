import { render, screen } from '@testing-library/react';
import App from './App';

test('Map and Calculator interface loaded', () => {
  render(<App />);
  const h1Elem = screen.getByText(/Nominal Power Calculator/i);
  expect(h1Elem).toBeInTheDocument();
});

