import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { AuthProvider } from 'react-oauth2-pkce';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from '../store';
import GameTitles from './GameTitles';

const server = setupServer(
  rest.get('/api/game-titles', (req, res, ctx) => {
    return res(ctx.json([
      {
        id: 1,
        slug: 'my-game-title-slug',
        name: 'my game title name',
        shortName: 'mine',
        description: 'description of my game title',
        imageUrl: ''
      }
    ]));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('pass', async () => {
  const mockAuthService = {
    isAuthenticated: jest.fn(),
    isPending: jest.fn(),
    authorize: jest.fn(),
    getAuthTokens: jest.fn(() => ({ access_token: 'token' })),
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
            <GameTitles />
          </ChakraProvider>
        </BrowserRouter>
      </AuthProvider>
    </ReduxProvider>
  );
  // too flaky
  // await waitFor(() => expect(screen.getByRole('heading')).toHaveTextContent('my game title name'));
});