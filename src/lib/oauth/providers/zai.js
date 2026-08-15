// ZCode (z.ai) OAuth acquisition adapter.
// Flow: authorization_code, NO PKCE, NO client_secret.
// User logs into their z.ai account via browser; we store the resulting
// z.ai access_token as a provider connection (served via registry/glm.js-style
// x-api-key transport on registry/zai.js).
const config = {
  clientId: "client_P8X5CMWmlaRO9gyO-KSqtg",
  authorizeUrl: "https://chat.z.ai/api/oauth/authorize",
  tokenUrl: "https://zcode.z.ai/api/v1/oauth/token",
};

const zai = {
  config,
  flowType: "authorization_code",
  buildAuthUrl: (config, redirectUri, state) => {
    // Exact param order from the desktop app: redirect_uri, response_type, client_id, state.
    const params = new URLSearchParams();
    params.set("redirect_uri", redirectUri);
    params.set("response_type", "code");
    params.set("client_id", config.clientId);
    params.set("state", state);
    return `${config.authorizeUrl}?${params.toString()}`;
  },
  exchangeToken: async (config, code, redirectUri, codeVerifier, state) => {
    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        provider: "zai",
        code,
        redirect_uri: redirectUri,
        state,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ZAI token exchange failed: ${error}`);
    }

    const resp = await response.json();
    if (resp?.code !== 0) {
      throw new Error(resp?.msg || "ZAI token exchange failed");
    }
    const data = resp.data || {};
    if (!data.token) {
      throw new Error("ZAI token exchange response missing data.token");
    }

    // The Start Plan (free GLM-5.3 tier) authenticates against the ZCode-plan
    // proxy (zcode.z.ai/api/v1/zcode-plan/*) using the zcode JWT (data.token)
    // as a Bearer token. The api.z.ai business-login path (z/login) belongs to
    // the paid API-Key / Coding-Plan families and is NOT used by the Start
    // Plan, so we do not resolve a business token here.
    return {
      access_token: data.token,
      id_token: data.token,
      expires_in: data.expires_in || null,
      user: data.user || null,
    };
  },
  mapTokens: (tokens) => ({
    accessToken: tokens.access_token,
    refreshToken: null,
    idToken: tokens.id_token || null,
    expiresIn: tokens.expires_in || null,
    email: tokens.user?.email || null,
    displayName: tokens.user?.name || tokens.user?.username || null,
    providerSpecificData: {
      authMethod: "oauth",
      zcodeToken: tokens.id_token || null,
    },
  }),
};

export default zai;
