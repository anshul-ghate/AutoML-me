import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from '../FileUpload';
import axios from '../../services/api';

jest.mock('../../services/api');

describe('FileUpload', () => {
  beforeEach(() => {
    (axios.post as jest.Mock).mockResolvedValue({ data: {} });
  });

  test('renders dropzone and modality selector', () => {
    render(<FileUpload />);
    expect(screen.getByText(/modality/i)).toBeInTheDocument();
    expect(screen.getByText(/drag & drop file here/i)).toBeInTheDocument();
  });

  test('upload button disabled until file drop', () => {
    render(<FileUpload />);
    const button = screen.getByText(/upload/i);
    expect(button).toBeDisabled();
  });
});
