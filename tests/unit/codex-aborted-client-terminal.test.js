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

// Terminal-detection logic used by createDisconnectAwareStream: a terminal token may
// straddle two reader.read() chunk boundaries, so detection must accumulate a rolling
// tail. Synthesis must be idempotent and must NOT double-emit on the success path.
describe("stream terminal detection (boundary-safe + idempotent)", () => {
  const enc = new TextEncoder();
  const MARKERS = ["message_stop", "[DONE]", "response.completed", "response.failed"];

  function makeDetector(onAbortTerminal) {
    let tail = "", terminalSeen = false, terminalEmitted = false;
    const emitted = [];
    const observe = (v) => {
      if (terminalSeen || !onAbortTerminal || !v) return;
      tail += dec.decode(v, { stream: true });
      if (tail.length > 512) tail = tail.slice(-512);
      if (MARKERS.some(m => tail.includes(m))) terminalSeen = true;
    };
    const emit = () => {
      if (terminalEmitted || terminalSeen || !onAbortTerminal) return;
      terminalEmitted = true;
      const b = onAbortTerminal();
      if (b) emitted.push(dec.decode(b));
    };
    return { observe, emit, get seen() { return terminalSeen; }, get out() { return emitted; } };
  }
  const claudeTerm = () => buildAbortedClientTerminalBytes(FORMATS.CLAUDE);

  it("does NOT synthesize on success even when message_stop is split across chunks", () => {
    const d = makeDetector(claudeTerm);
    d.observe(enc.encode("event: message_st"));           // boundary split
    d.observe(enc.encode("op\ndata: {\"type\":\"message_stop\"}\n\n"));
    d.emit();
    expect(d.seen).toBe(true);
    expect(d.out.length).toBe(0);
  });

  it("synthesizes exactly one terminal when the upstream drops with no terminal", () => {
    const d = makeDetector(claudeTerm);
    d.observe(enc.encode("event: content_block_delta\ndata: {}\n\n"));
    d.emit();
    expect(d.out.length).toBe(1);
    expect(d.out[0]).toContain("message_stop");
  });

  it("is idempotent across multiple emit() calls (disconnect + done)", () => {
    const d = makeDetector(claudeTerm);
    d.observe(enc.encode("data: partial\n\n"));
    d.emit();
    d.emit();
    expect(d.out.length).toBe(1);
  });

  it("never synthesizes when no terminal builder is provided (non-codex path)", () => {
    const d = makeDetector(null);
    d.observe(enc.encode("data: x\n\n"));
    d.emit();
    expect(d.out.length).toBe(0);
  });
});
