import {nanoid} from 'nanoid';
import {encode} from 'base64-arraybuffer';
import _ from 'lodash';

export class AuthService {
  constructor(props) {
    this.props = props;
    const tokens = this.getTokens();
    if (tokens) {
      this.tokens = tokens;
    }
  }

  init() {
    const { autoRefresh } = this.props;
    if (this.isAuthenticated()) {
      if (autoRefresh) {
        const refreshToken = this.getRefreshToken();
        const expiresIn = this.getAccessTokenExpiresIn();
        this.refreshTimer(refreshToken, expiresIn);
      }
    } else {
      this.login();
    }
  }

  async login() {
    if (this.isAuthenticated()) {
      return;
    }
    if (this.isPending()) {
      return;
    }
    const loginPromise = () => {
      if (this.isAccessTokenExpired()) {
        const refreshToken = this.getRefreshToken();
        return this.refreshToken(refreshToken);
      } else {
        return this.startPKCEFlow();
      }
    };
    this.setPending();
    return loginPromise()
      .then((tokens) => {
        this.setTokens(tokens);
        this.clearPending();
      })
      .catch(() => {
        this.clearTokens();
        this.startPKCEFlow()
          .then((tokens) => {
            this.setTokens(tokens);
          })
          .catch((e) => {
            console.warn(e);
            this.clearTokens();
          })
          .finally(() => {
            this.clearPending();
          });
      });
  }

  async startPKCEFlow() {
    const { code, codeVerifier } = await this.authorize();
    return await this.token(false, null, code, codeVerifier);
  }
  
  async authorize() {
    const { clientId, provider, redirectUri, timeout } = this.props;
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    const query = {
      clientId,
      responseType: 'code',
      redirectUri,
      codeChallenge,
      codeChallengeMethod: 'S256'
    };
    const queryString = this.toUrlEncoded(query);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const authResponse = await fetch(`${provider}/authorize?${queryString}`, {
      headers: {
        'Authorization': '',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (authResponse.status >= 400) {
      const json = await authResponse.json();
      throw new Error(json.error);
    }
    const code = this.extractCode(authResponse.url);
    return { code, codeVerifier };
  }
  
  async token(refresh, refreshToken, code, codeVerifier) {
    const { clientId, provider, redirectUri, autoRefresh, timeout } = this.props;
    let payload = { clientId, redirectUri };
    if (refresh) {
      payload = {
        ...payload,
        grantType: 'refresh_token',
        refreshToken,
      };
    } else {
      payload = {
        ...payload,
        grantType: 'authorization_code',
        code,
        codeVerifier,
      };
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(`${provider}/token`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: this.toUrlEncoded(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.status >= 400) {
      const json = await response.json();
      throw new Error(json.error);
    }
    const tokenJson = await response.json();
    if (tokenJson.expires_in) {
      const now = new Date().getTime();
      tokenJson.expires_at = now + (tokenJson.expires_in * 1000);
    }
    const tokens = {};
    Object.keys(tokenJson).forEach((k) => {
      tokens[_.camelCase(k)] = tokenJson[k];
    });
    if (autoRefresh) {
      this.refreshTimer(tokens.refreshToken, tokens.expiresIn * 1000);
    }
    return tokens;
  }
  
  async refreshToken(refreshToken) {
    return this.token(true, refreshToken);
  }
  
  refreshTimer(refreshToken, delay) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      if (this.isPending()) {
        return;
      }
      this.setPending();
      this.refreshToken(refreshToken)
        .then((tokens) => {
          this.setTokens(tokens);
          this.clearPending();
        })
        .catch(() => {
          this.clearTokens();
          this.startPKCEFlow()
            .then((tokens) => {
              this.setTokens(tokens);
            })
            .catch((e) => {
              console.warn(e);
              this.clearTokens();
            })
            .finally(() => {
              this.clearPending();
            });
          });
    }, delay);
  }
  
  setTokens(tokens) {
    localStorage.setItem('tokens', JSON.stringify(tokens));
    this.tokens = tokens;
    const authenticated = this.isAuthenticated();
    this.invokeAuthenticatedCallback(authenticated);
  }

  clearTokens() {
    localStorage.removeItem('tokens');
    this.tokens = undefined;
    const authenticated = this.isAuthenticated();
    this.invokeAuthenticatedCallback(authenticated);
  }

  getTokens() {
    if (this.tokens) {
      return this.tokens;
    }
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      return JSON.parse(tokens);
    }
    return undefined;
  }
  
  getAccessToken() {
    const tokens = this.getTokens();
    return tokens && tokens.accessToken;
  }
  
  getRefreshToken() {
    const tokens = this.getTokens();
    return tokens && tokens.refreshToken;
  }
  
  isAuthenticated() {
    const tokens = this.getTokens();
    return tokens && tokens.accessToken && !this.isAccessTokenExpired();
  }
  
  isAccessTokenExpired() {
    const tokens = this.getTokens();
    if (tokens && tokens.accessToken && tokens.expiresAt) {
      const now = new Date().getTime();
      return now >= tokens.expiresAt;
    } else {
      return false;
    }
  }

  getAccessTokenExpiresIn() {
    const tokens = this.getTokens();
    if (tokens && tokens.accessToken && tokens.expiresAt) {
      const now = new Date().getTime();
      return tokens.expiresAt - now;
    } else {
      return undefined;
    }
  }

  setPending() {
    sessionStorage.setItem('pending', true);
    this.invokePendingCallback();
  }

  clearPending() {
    sessionStorage.removeItem('pending');
    this.invokePendingCallback();
  }

  isPending() {
    return !!sessionStorage.getItem('pending');
  }

  setAuthenticatedCallback(authenticatedCallback) {
    this.authenticatedCallback = authenticatedCallback;
  }

  invokeAuthenticatedCallback() {
    if (this.authenticatedCallback) {
      const authenticated = this.isAuthenticated();
      this.authenticatedCallback(authenticated);
    }
  }

  setPendingCallback(pendingCallback) {
    this.pendingCallback = pendingCallback;
  }

  invokePendingCallback() {
    if (this.pendingCallback) {
      const pending = this.isPending();
      this.pendingCallback(pending);
    }
  }
  
  generateCodeVerifier() {
    return nanoid(128);
  }
  
  async generateCodeChallenge(codeVerifier) {
    const codeVerifierBuffer = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', codeVerifierBuffer);
    return encode(digest)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
  
  extractCode(urlString) {
    const url = new URL(urlString);
    const urlParams = new URLSearchParams(url.search);
    return urlParams.get('code');
  }
  
  toUrlEncoded(obj) {
    return Object.keys(obj)
      .map((k) => encodeURIComponent(_.snakeCase(k)) + '=' + encodeURIComponent(obj[k]))
      .join('&');
  }
}
