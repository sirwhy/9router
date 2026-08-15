import { CLAUDE_API_HEADERS } from "../shared.js";

export default {
  id: "zai",
  priority: 141,
  alias: "zai",
  uiAlias: "zai",
  display: {
    name: "ZCode (z.ai OAuth)",
    icon: "code",
    color: "#DC2626",
    textIcon: "ZC",
    website: "https://chat.z.ai",
    notice: {
      oauthUrl: "https://chat.z.ai",
    },
  },
  category: "oauth",
  authModes: ["oauth"],
  hasOAuth: true,
  // Start Plan (free GLM-5.3 tier) runs on the ZCode-plan proxy, authenticated
  // with the zcode JWT (data.token) as a Bearer token — NOT the api.z.ai
  // API-Key/Coding-Plan endpoints (those return 1113 "no resource package").
  //
  // z.ai gates every zcode-plan model request behind an Aliyun Captcha 2.0
  // (scene 11xygtvd) via the X-Aliyun-Captcha-Verify-Param header. 9router runs
  // on Railway (no headless browser), so it cannot solve the captcha itself.
  // Instead we route through a captcha-injecting reverse proxy on the VPS
  // (zai-captcha.eemaill.codes) that solves the TRACELESS captcha fresh per
  // request and forwards to zcode.z.ai from the same IP. The proxy mirrors the
  // real upstream path, so the Bearer JWT + X-ZCode-Agent header still apply.
  transport: {
    baseUrl: "https://zai-captcha.eemaill.codes/api/v1/zcode-plan/anthropic/v1/messages",
    format: "claude",
    headers: { ...CLAUDE_API_HEADERS, "X-ZCode-Agent": "glm" },
    auth: {
      combined: true,
      header: "Authorization",
      scheme: "bearer",
    },
  },
  models: [
    { id: "glm-5.3", name: "GLM 5.3 (Start Plan)" },
    { id: "GLM-5-Turbo", name: "GLM 5 Turbo (Start Plan)" },
    { id: "glm-5.2", name: "GLM 5.2" },
    { id: "glm-5.1", name: "GLM 5.1" },
    { id: "glm-5", name: "GLM 5" },
    { id: "glm-4.7", name: "GLM 4.7" },
    { id: "glm-4.6v", name: "GLM 4.6V (Vision)" },
  ],
  oauth: {
    clientId: "client_P8X5CMWmlaRO9gyO-KSqtg",
    appId: "client_P8X5CMWmlaRO9gyO-KSqtg",
    authorizeUrl: "https://chat.z.ai/api/oauth/authorize",
    tokenUrl: "https://zcode.z.ai/api/v1/oauth/token",
  },
  features: {
    usage: false,
  },
};
