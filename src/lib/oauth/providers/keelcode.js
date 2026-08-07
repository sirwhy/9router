// Keelcode OAuth2 device flow provider.
// client_id: "keelcode-cli", standard device_code grant (URN form).
// Endpoints: /api/auth/device/code + /api/auth/device/token on api.keelcode.ai

const KEELCODE_CONFIG = {
  clientId: "keelcode-cli",
  deviceCodeUrl: "https://api.keelcode.ai/api/auth/device/code",
  tokenUrl: "https://api.keelcode.ai/api/auth/device/token",
  userInfoUrl: "https://api.keelcode.ai/v1/me",
  scopes: "inference models usage",
  grantType: "urn:ietf:params:oauth:grant-type:device_code",
};

const keelcode = {
  config: KEELCODE_CONFIG,
  flowType: "device_code",

  requestDeviceCode: async (config) => {
    const body = {
      client_id: config.clientId,
      scope: config.scopes,
    };
    const resp = await fetch(config.deviceCodeUrl, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error_description || err.error || `Device code request failed: ${resp.status}`);
    }
    const data = await resp.json();
    // Standard shape: device_code, user_code, verification_uri, verification_uri_complete, expires_in, interval
    return data;
  },

  pollToken: async (config, deviceCode, codeVerifier, extraData) => {
    const body = {
      grant_type: config.grantType,
      device_code: deviceCode,
      client_id: config.clientId,
    };
    const resp = await fetch(config.tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      // authorization_pending / slow_down are expected while waiting
      return { ok: false, data };
    }
    // Fetch user info for display name/email
    let userInfo = {};
    try {
      const meResp = await fetch(config.userInfoUrl, {
        headers: { authorization: `Bearer ${data.access_token}` },
      });
      if (meResp.ok) userInfo = await meResp.json();
    } catch { /* non-fatal */ }
    return {
      ok: true,
      data: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || null,
        expires_in: data.expires_in || 604800,
        _keelcodeEmail: userInfo.email || (extraData?._keelcodeEmail) || "",
        _keelcodeName: userInfo.name || userInfo.user?.name || "",
        // Keep sign-in credentials in extraData so a revoked token can be
        // automatically re-logged-in (device-flow re-approve) instead of dying.
        _keelcodePassword: (extraData?._keelcodePassword) || "",
      },
    };
  },

  mapTokens: (tokens) => {
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      expiresIn: tokens.expires_in,
      email: tokens._keelcodeEmail || null,
      displayName: tokens._keelcodeName || null,
      providerSpecificData: {
        authMethod: "device",
        keelcodeEmail: tokens._keelcodeEmail || null,
        // used by the relogin daemon to re-auth a revoked device token
        keelcodePassword: tokens._keelcodePassword || null,
      },
    };
  },
};

export default keelcode;
