import { render, screen } from '@testing-library/react';

jest.mock('./MapView', () => () => <div>Mock MapView</div>);

import App from './App';

test('renders parade route selection heading', () => {
  render(<App />);
  const heading = screen.getByText(/select a parade route/i);
  expect(heading).toBeInTheDocument();
});
