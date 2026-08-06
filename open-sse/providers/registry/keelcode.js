// Keelcode — hosted coding agent API (https://keelcode.ai)
// Anthropic Messages format (/v1/messages), Bearer auth, streaming-only.
// Token: run `keelcode login` locally, then paste accessToken from
// ~/.keelcode/credentials.json into the 9router dashboard.

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
      apiKeyUrl: "https://keelcode.ai/dashboard",
    },
    authHint: "Run `keelcode login`, copy accessToken from ~/.keelcode/credentials.json",
  },
  category: "apikey",
  authModes: ["apikey"],
  thinkingConfig: {
    options: ["auto", "none", "low", "medium", "high"],
    defaultMode: "auto",
  },
  transport: {
    baseUrl: "https://api.keelcode.ai/v1/messages",
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
    },
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
