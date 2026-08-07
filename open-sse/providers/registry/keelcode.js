// Keelcode — hosted coding agent API (https://keelcode.ai)
// Anthropic Messages format (/v1/messages), Bearer auth, streaming-only.
// OAuth2 device flow (keelcode login) OR manual token paste.

export default {
  id: "keelcode",
  priority: 40,
  alias: "keelcode",
  uiAlias: "keelcode",
  display: {
    name: "Keelcode",
    icon: "code",
    color: "#6366F1",
    website: "https://keelcode.ai",
    notice: {
      signupUrl: "https://keelcode.ai",
    },
    authHint: "Run `keelcode login` locally, or use device flow below.",
  },
  category: "oauth",
  authModes: ["oauth", "apikey"],
  hasOAuth: true,
  thinkingConfig: {
    options: ["auto", "none", "low", "medium", "high"],
    defaultMode: "auto",
  },
  transport: {
    baseUrl: "https://keel-log.kania-cloudmail.workers.dev/v1/messages",
    format: "claude",
    forceStream: true,
    headers: {
      "Anthropic-Version": "2023-06-01",
    },
    auth: {
      apiKey: {
        header: "Authorization",
        scheme: "bearer",
      },
      oauth: {
        header: "Authorization",
        scheme: "bearer",
      },
    },
  },
  oauth: {
    clientId: "keelcode-cli",
    deviceCodeUrl: "https://api.keelcode.ai/api/auth/device/code",
    tokenUrl: "https://api.keelcode.ai/api/auth/device/token",
    userInfoUrl: "https://api.keelcode.ai/v1/me",
    scopes: "inference models usage",
    flowType: "device_code",
    // device flow uses non-standard grant_type URN
    deviceGrantType: "urn:ietf:params:oauth:grant-type:device_code",
    refreshLeadMs: 432000000,
  },
  models: [
    { id: "gpt-5.6-luna", name: "GPT-5.6 Luna" },
    { id: "gpt-5.6-terra", name: "GPT-5.6 Terra" },
    { id: "gpt-5.6-sol", name: "GPT-5.6 Sol" },
    { id: "kimi-k3", name: "Kimi K3" },
    { id: "kimi-k2.7-code", name: "Kimi K2.7 Code" },
    { id: "kimi-k2.6", name: "Kimi K2.6" },
    { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro" },
    { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash" },
    { id: "glm-5.2", name: "GLM 5.2" },
  ],
};
