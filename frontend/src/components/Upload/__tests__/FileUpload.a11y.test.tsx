import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@mui/material/styles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import { getTheme } from '../../../theme/muiTheme';
import { FileUpload } from '../FileUpload';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={getTheme('light')}>
        {component}
      </ThemeProvider>
    </I18nextProvider>
  );
};

describe('FileUpload Accessibility Tests', () => {
  test('FileUpload component is accessible', async () => {
    const { container } = renderWithProviders(<FileUpload />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('FileUpload has proper ARIA labels', () => {
    const { getByRole, getByLabelText } = renderWithProviders(<FileUpload />);
    
    // Check for file input accessibility
    expect(getByLabelText(/file input/i)).toBeInTheDocument();
    
    // Check for upload button accessibility
    expect(getByRole('button', { name: /upload file/i })).toBeInTheDocument();
  });

  test('FileUpload dropzone is keyboard accessible', () => {
    const { getByRole } = renderWithProviders(<FileUpload />);
    
    const dropzone = getByRole('button', { name: /file input/i });
    expect(dropzone).toHaveAttribute('tabIndex', '0');
  });
});
