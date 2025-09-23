import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatWidget } from '../ChatWidget';
import axios from '../../services/api';

jest.mock('../../services/api');

describe('ChatWidget', () => {
  beforeEach(() => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { choices: [{ message: { content: 'Hello!' } }] }
    });
  });

  test('sends and displays messages', async () => {
    render(<ChatWidget />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test?' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(screen.getByText('Test?')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Hello!')).toBeInTheDocument());
  });
});
