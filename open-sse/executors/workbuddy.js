import { DefaultExecutor } from "./default.js";

/**
 * WorkBuddyExecutor — bicara ke https://www.workbuddy.ai/v2/chat/completions
 *
 * Port dari CodeBuddyIntlExecutor, karena gateway WorkBuddy (CLI) mewarisi dua
 * perilaku yang sama dengan gateway CodeBuddy:
 *
 *   1. HANYA stream. Permintaan non-stream ditolak upstream (code 11101), jadi
 *      `stream` selalu dipaksa true di sini — pemanggil tetap boleh non-stream,
 *      agregasi SSE-nya ditangani lapisan di atas.
 *   2. Pesan pertama WAJIB `system`. Tanpa itu upstream membalas HTTP 400
 *      (code 11128 "first message is not system prompt"), jadi pesan system
 *      minimal disuntikkan bila tidak ada.
 *
 * Berbeda dari CodeBuddy, gateway ini tidak memerlukan parameter reasoning
 * khusus — jadi tidak ada penanganan reasoning_effort/reasoning_summary di sini.
 * Tokennya berumur panjang (~365 hari per klaim JWT), jadi tidak ada refresh.
 */
export class WorkBuddyExecutor extends DefaultExecutor {
  constructor() {
    super("workbuddy");
  }

  transformRequest(model, body, stream, credentials) {
    const transformed = super.transformRequest(model, body, stream, credentials);
    transformed.stream = true;

    const messages = transformed.messages;
    if (Array.isArray(messages) && messages.length > 0) {
      const hasSystem = messages.some((m) => m?.role === "system");
      if (!hasSystem) {
        messages.unshift({ role: "system", content: "You are a helpful assistant." });
      }
    }
    return transformed;
  }
}

export default WorkBuddyExecutor;
