export default {
  id: "zcode",
  priority: 142,
  alias: "zcode",
  uiAlias: "zcode",
  display: {
    name: "ZCode2API (self-hosted)",
    icon: "code",
    color: "#E11D48",
    textIcon: "ZC",
    website: "https://github.com/liu5269/zcode2api",
    notice: {
      signupUrl: "https://zcode.eemaill.codes/admin",
    },
  },
  category: "apikey",
  authType: "apikey",
  authModes: ["apikey"],
  transport: {
    baseUrl: "https://zcode.eemaill.codes/v1/messages",
    format: "claude",
    auth: {
      header: "Authorization",
      scheme: "bearer",
    },
    validateUrl: "https://zcode.eemaill.codes/v1/models",
    headers: {
      "anthropic-version": "2023-06-01",
    },
  },
  models: [
    { id: "GLM-5.2", name: "GLM 5.2 (ZCode2API)" },
    { id: "GLM-5-Turbo", name: "GLM 5 Turbo (ZCode2API)" },
  ],
  features: {
    usage: false,
  },
};
