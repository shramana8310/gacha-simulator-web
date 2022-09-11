import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { AuthProvider } from 'react-oauth2-pkce';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import store from './store';

it('renders without crashing', () => {
  const mockAuthService = {
    isAuthenticated: jest.fn(),
    isPending: jest.fn(),
    authorize: jest.fn(),
    getAuthTokens: jest.fn(),
  };
  jest.mock('react-i18next', () => ({
    useTranslation: () => {
      return {
        t: (str) => str,
        i18n: {
          changeLanguage: () => new Promise(() => {}),
        },
      };
    },
  }));
  render(
    <ReduxProvider store={store}>
      <AuthProvider authService={mockAuthService}>
        <BrowserRouter>
          <ChakraProvider>
            <App />
          </ChakraProvider>
        </BrowserRouter>
      </AuthProvider>
    </ReduxProvider>
  );
});