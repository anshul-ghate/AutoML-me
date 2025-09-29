import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { FileUpload } from '../FileUpload';
import { getTheme } from '../../../theme/muiTheme';
import api from '../../../services/api';

jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={getTheme('light')}>
      {component}
    </ThemeProvider>
  );
};

describe('FileUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  test('renders all components correctly', () => {
    renderWithTheme(<FileUpload />);
    
    expect(screen.getByText(/modality/i)).toBeInTheDocument();
    expect(screen.getByText(/drag & drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/upload file/i)).toBeInTheDocument();
  });

  test('upload button is disabled without file', () => {
    renderWithTheme(<FileUpload />);
    
    const uploadButton = screen.getByText(/upload file/i);
    expect(uploadButton).toBeDisabled();
  });

  test('shows success message on successful upload', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: {} });
    
    renderWithTheme(<FileUpload />);
    
    // Simulate file drop
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const dropzone = screen.getByText(/drag & drop your file here/i).closest('div');
    
    Object.defineProperty(dropzone, 'files', {
      value: [file],
      writable: false,
    });
    
    fireEvent.drop(dropzone!);
    
    await waitFor(() => {
      expect(screen.getByText('test.csv')).toBeInTheDocument();
    });
    
    const uploadButton = screen.getByText(/upload file/i);
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/upload/structured',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      );
    });
  });

  test('shows error message on failed upload', async () => {
    mockedApi.post.mockRejectedValueOnce({
      response: { data: { detail: 'Upload failed' } }
    });
    
    renderWithTheme(<FileUpload />);
    
    // Simulate file selection and upload
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    const dropzone = screen.getByText(/drag & drop your file here/i).closest('div');
    
    fireEvent.drop(dropzone!, {
      dataTransfer: { files: [file] }
    });
    
    await waitFor(() => {
      const uploadButton = screen.getByText(/upload file/i);
      fireEvent.click(uploadButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });
});
