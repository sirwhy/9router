import { WORKBUDDY_CONFIG } from "../constants/oauth.js";

// WorkBuddy (CLI) — pengganti CodeBuddy International (codebuddy.ai).
//
// Alur "state" milik WorkBuddy, terverifikasi pada instance produksi 2026-09-27:
//   POST {stateUrl}?platform=cli   body {} → { code: 0, data: { state, authUrl } }
//   GET  {tokenUrl}?state=<state>          → { code: 0, data: { accessToken, ... } }
//
// Perbedaan penting dari CodeBuddy Intl:
//   - Token berada di `data.accessToken` (BUKAN `data.data.accessToken`).
//   - Header `X-Domain` dan `X-Product` milik CodeBuddy TIDAK dipakai di sini;
//     yang diperlukan adalah User-Agent CLI + trio `X-No-*` yang memang dikirim
//     CLI aslinya (terverifikasi: auth state 200, token 200).
//   - Token berumur panjang (klaim `exp` JWT ~365 hari) sehingga `refreshToken`
//     biasanya kosong dan tidak ada refreshUrl.
const workbuddy = {
  config: WORKBUDDY_CONFIG,
  flowType: "device_code",
  requestDeviceCode: async (config) => {
    const response = await fetch(`${config.stateUrl}?platform=${config.platform}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": config.userAgent,
        "X-Requested-With": "XMLHttpRequest",
        "X-No-Authorization": "true",
        "X-No-User-Id": "true",
        "X-No-Enterprise-Id": "true",
      },
      body: "{}",
    });
    if (!response.ok) throw new Error(`WorkBuddy state request failed: ${await response.text()}`);
    const data = await response.json();
    if (data.code !== 0 || !data.data?.state || !data.data?.authUrl) {
      throw new Error(`WorkBuddy state error: ${data.msg || "missing state/authUrl"}`);
    }
    return {
      device_code: data.data.state,
      verification_uri: data.data.authUrl,
      user_code: "",
      interval: config.pollInterval / 1000,
      _isWorkBuddy: true,
    };
  },
  pollToken: async (config, deviceCode) => {
    const response = await fetch(`${config.tokenUrl}?state=${encodeURIComponent(deviceCode)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": config.userAgent,
        "X-Requested-With": "XMLHttpRequest",
        "X-No-Authorization": "true",
        "X-No-User-Id": "true",
        "X-No-Enterprise-Id": "true",
      },
    });
    if (!response.ok) return { ok: false, data: { error: "request_failed" } };
    const data = await response.json().catch(() => ({}));
    // Token bisa berada di data.accessToken (WorkBuddy) atau data.data.accessToken
    // (kalau gateway menyamakan bentuk dengan CodeBuddy) — terima keduanya.
    const token = data?.data?.accessToken || data?.accessToken;
    if (data.code === 0 && token) {
      const meta = data?.data?.accessToken ? data.data : (data.data || {});
      return {
        ok: true,
        data: {
          access_token: token,
          refresh_token: meta.refreshToken || "",
          token_type: meta.tokenType || "Bearer",
          expires_in: meta.expiresIn,
        },
      };
    }
    // Belum diotorisasi: CLI aslinya memakai pesan/`code` berbeda-beda antar build,
    // jadi selain kode 11217 (CodeBuddy) kita juga mengenali pesan yang bermakna
    // "tunggu" supaya polling tetap berjalan alih-alih gagal terlalu cepat.
    if (data.code === 11217 || /pending|authoriz|wait|retry|not\s+(yet|ready)/i.test(String(data.msg || ""))) {
      return { ok: true, data: { error: "authorization_pending" } };
    }
    return { ok: false, data: { error: data.msg || "unknown_error" } };
  },
  mapTokens: (tokens) => ({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in || 86400 * 30,
    providerSpecificData: {},
  }),
};

export default workbuddy;
