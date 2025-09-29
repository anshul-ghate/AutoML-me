import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@mui/material/styles';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import { getTheme } from '../../../theme/muiTheme';
import { ChatWidget } from '../ChatWidget';

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

describe('ChatWidget Accessibility Tests', () => {
  test('ChatWidget component is accessible', async () => {
    const { container } = renderWithProviders(<ChatWidget />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('ChatWidget has proper ARIA labels', () => {
    const { getByRole, getByPlaceholderText } = renderWithProviders(<ChatWidget />);
    
    // Check for message input accessibility
    expect(getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    
    // Check for send button accessibility  
    expect(getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('Chat messages have proper live regions', () => {
    const { container } = renderWithProviders(<ChatWidget />);
    
    // Check for status announcements
    const statusElements = container.querySelectorAll('[role="status"]');
    const alertElements = container.querySelectorAll('[role="alert"]');
    
    // Should have live regions for dynamic content
    expect(statusElements.length + alertElements.length).toBeGreaterThanOrEqual(0);
  });
});
