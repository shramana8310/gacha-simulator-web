import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';
import { AuthProvider, AuthService } from 'react-oauth2-pkce';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import store from './store';
import theme from './theme';
import './i18n';
import App from "./App";

const authService = new AuthService({
  clientId: process.env.REACT_APP_CLIENT_ID,
  location: window.location,
  provider: `${window.location.origin}/api`,
  redirectUri: window.location.origin,
  scopes: [],
  autoRefresh: true,
});
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <StrictMode>
    <ReduxProvider store={store}>
      <AuthProvider authService={authService}>
        <BrowserRouter>
          <ChakraProvider theme={theme}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <App />
          </ChakraProvider>
        </BrowserRouter>
      </AuthProvider>
    </ReduxProvider>
  </StrictMode>
);
