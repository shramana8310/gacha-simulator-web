import {nanoid} from 'nanoid';
import {encode} from 'base64-arraybuffer';
import _ from 'lodash';

export class AuthService {
  constructor(props) {
    this.props = props;
    const tokens = localStorage.getItem('tokens');
    if (tokens) {
      this.tokens = JSON.parse(tokens);
    }
    this.login();
  }
  
  getAccessToken() {
    return this.tokens && this.tokens.accessToken;
  }
  
  getRefreshToken() {
    return this.tokens && this.tokens.refreshToken;
  }
  
  isAuthenticated() {
    return this.tokens && this.tokens.accessToken && !this.isAccessTokenExpired();
  }
  
  isAccessTokenExpired() {
    if (this.tokens && this.tokens.accessToken && this.tokens.expiresAt) {
      const now = new Date().getTime();
      return now >= this.tokens.expiresAt;
    } else {
      return false;
    }
  }
  
  async login() {
    if (this.isAuthenticated()) {
      return;
    }
    const pending = sessionStorage.getItem('pending');
    if (pending) {
      return;
    }
    sessionStorage.setItem('pending', true);
    const loginPromise = () => {
      if (this.isAccessTokenExpired()) {
        const refreshToken = this.getRefreshToken();
        return this.refreshToken(refreshToken);
      } else {
        return this.startPKCEFlow();
      }
    };
    return loginPromise()
    .catch(() => {
      localStorage.removeItem('tokens');
      this.startPKCEFlow();
    })
    .finally(() => {
      sessionStorage.removeItem('pending');
    });
  }
  
  async startPKCEFlow() {
    const { code, codeVerifier } = await this.authorize();
    await this.token(false, null, code, codeVerifier);
  }
  
  async authorize() {
    const { clientId, provider, redirectUri } = this.props;
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
    const authResponse = await fetch(`${provider}/authorize?${queryString}`, {
      headers: {
        'Authorization': '',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (authResponse.status >= 400) {
      const json = await authResponse.json();
      throw new Error(json.error);
    }
    const code = this.extractCode(authResponse.url);
    return { code, codeVerifier };
  }
  
  async token(refresh, refreshToken, code, codeVerifier) {
    const { clientId, provider, redirectUri, autoRefresh } = this.props;
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
    const response = await fetch(`${provider}/token`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: this.toUrlEncoded(payload)
    });
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
    localStorage.setItem('tokens', JSON.stringify(tokens));
    this.tokens = tokens;
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
      const pending = sessionStorage.getItem('pending');
      if (pending) {
        return;
      }
      sessionStorage.setItem('pending', true);
      this.refreshToken(refreshToken)
        .catch(() => {
          localStorage.removeItem('tokens');
          this.startPKCEFlow();
        })
        .finally(() => {
          sessionStorage.removeItem('pending');
        });
    }, delay);
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
