// WorkBuddy (CLI) — pengganti CodeBuddy international (codebuddy.ai).
//
// Kenapa diganti (diukur 2026-09-26/27 pada instance produksi KeyStore):
//   - codebuddy.ai sudah tidak menjawab (timeout 12–60 dtk di semua path, termasuk auth),
//     dan api.codebuddy.ai membalas 404 untuk /v2/* — preset lama tidak bisa dipakai lagi.
//   - WorkBuddy (CLI) terbukti hidup: auth state 200, POST /v2/chat/completions 200
//     dengan TTFT 1,3–2,0 dtk.
//
// Dua syarat gateway-nya (keduanya ditangani WorkBuddyExecutor):
//   1. WAJIB stream — permintaan non-stream ditolak upstream (code 11101).
//   2. Pesan pertama WAJIB `system` — kalau tidak, upstream membalas 400 (code 11128).
//
// Token OAuth-nya berumur panjang (klaim `exp` pada JWT: ~365 hari), jadi tidak ada
// refreshUrl — token cukup diperbarui dengan login ulang. Token itu juga boleh
// ditempel langsung sebagai API key (authModes menyertakan "apikey").
export default {
  id: "workbuddy",
  alias: "wb",
  uiAlias: "wb",
  hidden: false,
  priority: 90,
  display: {
    name: "WorkBuddy",
    icon: "smart_toy",
    color: "#00A870",
    website: "https://www.workbuddy.ai",
    notice: {
      signupUrl: "https://www.workbuddy.ai",
    },
  },
  category: "oauth",
  authModes: ["oauth", "apikey"],
  hasOAuth: true,
  transport: {
    // Chat gateway OpenAI-compatible, tetapi HANYA streaming (lihat catatan di atas).
    baseUrl: "https://www.workbuddy.ai/v2/chat/completions",
    forceStream: true,
    headers: {
      // CLI asli memakai UA ini; gateway memeriksa identitas klien.
      "User-Agent": "CLI/2.63.2 WorkBuddy/2.63.2",
    },
    auth: {
      combined: true,
      header: "Authorization",
      scheme: "bearer",
    },
  },
  // Daftar model dari pengujian token nyata (upstream tidak punya endpoint /models:
  // semua path 404), dicatat 2026-09-27 pada instance produksi.
  models: [
    { id: "glm-5.2", name: "GLM-5.2" },
    { id: "glm-5.1", name: "GLM-5.1" },
    { id: "deepseek-v4.1-flash", name: "DeepSeek-V4.1-Flash" },
    { id: "kimi-k3", name: "Kimi-K3" },
    { id: "minimax-m3", name: "MiniMax-M3" },
    { id: "claude-sonnet-4.6", name: "Claude-Sonnet-4.6" },
  ],
  oauth: {
    baseUrl: "https://www.workbuddy.ai",
    // Alur "state": POST state (JSON {}) lalu GET token?state=...
    stateUrl: "https://www.workbuddy.ai/v2/plugin/auth/state",
    tokenUrl: "https://www.workbuddy.ai/v2/plugin/auth/token",
    userAgent: "CLI/2.63.2 WorkBuddy/2.63.2",
    platform: "cli",
    pollInterval: 3000,
    // CATATAN: permintaan token ke endpoint ini memerlukan header
    // X-No-Authorization: true, X-No-User-Id: true, X-No-Enterprise-Id: true
    // (terverifikasi pada instance produksi). Kalau alur token di sini belum
    // mengirim header kustom, tambahkan di titik yang memanggil tokenUrl, atau
    // pakai mode "apikey" (tempel token dari CLI) sebagai jalur alternatif.
  },
  features: {
    // Upstream tidak menyediakan endpoint usage kuota.
    usage: false,
  },
};
