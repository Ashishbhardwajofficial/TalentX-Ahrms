import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page', () => {
  render(<App />);
  const loginElement = screen.getByText(/Sign in to your TalentX account/i);
  expect(loginElement).toBeInTheDocument();
});
