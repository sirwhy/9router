// Keelcode — hosted coding agent API (https://keelcode.ai)
// Endpoint is Anthropic-messages shaped, but each model maps to its REAL
// upstream (GPT-5.6 → OpenAI, Kimi → Moonshot, DeepSeek → DeepSeek, GLM → Z.ai).
// We must NOT send the `Anthropic-Version` header: doing so makes keelcode
// treat the request as a native Claude call and it routes EVERY model,
// including GPT / DeepSeek / GLM, to Anthropic upstream (so they'd answer
// "Anthropic made me"). Without it, keelcode serves the genuine model.
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
    baseUrl: "https://api.keelcode.ai/v1/messages",
    format: "claude",
    // Do NOT force every call to look like Anthropic. Keelcode's /v1/messages
    // serves the real underlying model per model id; only requests carrying the
    // Anthropic-Version header get coerced to Claude. Let streaming follow the
    // model's natural mode instead of forcing it.
    forceStream: false,
    headers: {
      // NOTE: intentionally NO "Anthropic-Version". Sending it would force
      // Anthropic upstream for every model.
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