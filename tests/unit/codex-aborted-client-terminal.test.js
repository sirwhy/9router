// Unit test: aborted Codex-translation stream synthesizes a valid client terminal.
// Covers the fix for OMP's "stream ended before message_stop" on cx/* models when
// the Codex upstream hard-aborts mid-reasoning (flush() never runs).
import { describe, it, expect } from "vitest";
import {
  buildAbortedClientTerminalBytes,
  buildAbortedResponsesTerminalBytes,
} from "../../open-sse/utils/responsesStreamHelpers.js";
import { FORMATS } from "../../open-sse/translator/formats.js";

const dec = new TextDecoder();

describe("buildAbortedClientTerminalBytes", () => {
  it("emits a valid Claude terminal (message_delta + message_stop) for CLAUDE clients", () => {
    const out = dec.decode(buildAbortedClientTerminalBytes(FORMATS.CLAUDE));
    // must contain both events so OMP can finalize the turn
    expect(out).toContain("event: message_delta");
    expect(out).toContain("event: message_stop");
    expect(out).toContain('"stop_reason":"end_turn"');
    // Anthropic SSE framing: event: line followed by data: line
    expect(out).toMatch(/event: message_stop\ndata: \{"type":"message_stop"\}/);
  });

  it("emits a finish chunk + [DONE] for OPENAI chat clients", () => {
    const out = dec.decode(buildAbortedClientTerminalBytes(FORMATS.OPENAI));
    expect(out).toContain('"finish_reason":"stop"');
    expect(out).toContain("data: [DONE]");
  });

  it("returns null for unknown/unsupported client formats (no-op, no bad bytes)", () => {
    expect(buildAbortedClientTerminalBytes("gemini")).toBeNull();
    expect(buildAbortedClientTerminalBytes(undefined)).toBeNull();
  });

  it("does not regress the Responses passthrough terminal", () => {
    const out = dec.decode(buildAbortedResponsesTerminalBytes());
    expect(out).toContain("event: response.failed");
    expect(out).toContain("data: [DONE]");
  });
});
