// Helpers for OpenAI Responses API streaming termination + event framing
import { FORMATS } from "../translator/formats.js";
import { formatSSE } from "./streamHelpers.js";

// Responses API events that signal the stream has reached a terminal state
const OPENAI_RESPONSES_TERMINAL_EVENTS = new Set([
  "response.completed",
  "response.done",
  "response.failed",
  "error"
]);

export function getOpenAIResponsesEventName(eventName, chunk) {
  if (eventName) return eventName;
  if (chunk && typeof chunk.type === "string") return chunk.type;
  return null;
}

export function isOpenAIResponsesTerminalEvent(eventName, chunk) {
  const type = getOpenAIResponsesEventName(eventName, chunk);
  if (OPENAI_RESPONSES_TERMINAL_EVENTS.has(type)) return true;
  const status = chunk?.response?.status;
  return status === "completed" || status === "failed";
}

const sharedEncoder = new TextEncoder();

// Encoded response.failed + [DONE] payload for aborted/stalled Responses passthrough streams
export function buildAbortedResponsesTerminalBytes() {
  return sharedEncoder.encode(`${formatIncompleteOpenAIResponsesStreamFailure()}data: [DONE]\n\n`);
}

// Synthesize a response.failed event for streams that close without a terminal event
export function formatIncompleteOpenAIResponsesStreamFailure() {
  return formatSSE({
    event: "response.failed",
    data: {
      type: "response.failed",
      response: {
        id: `resp_${Date.now()}`,
        status: "failed",
        error: {
          type: "stream_error",
          code: "stream_disconnected",
          message: "stream closed before response.completed"
        }
      }
    }
  }, FORMATS.OPENAI_RESPONSES);
}

// Synthesize a valid terminal for a CLIENT-facing translated stream (Codex/Responses
// upstream -> client format) that aborted before emitting its own terminal event.
//
// WHY: When a Responses-API provider (e.g. codex / cx models) hard-aborts mid-stream
// (common during heavy reasoning), the TransformStream's flush() does NOT run, so the
// normal message_stop / [DONE] tail is never produced. Clients like OMP then error with
// "stream ended before message_stop". This builds a minimally-valid terminal so the
// client can finalize the turn gracefully instead of hanging/erroring.
//
// clientFormat: FORMATS.CLAUDE | FORMATS.OPENAI (default). Anything else -> empty (no-op).
export function buildAbortedClientTerminalBytes(clientFormat) {
  if (clientFormat === FORMATS.CLAUDE) {
    const msgDelta = formatSSE({
      type: "message_delta",
      delta: { stop_reason: "end_turn", stop_sequence: null },
      usage: { input_tokens: 0, output_tokens: 0 }
    }, FORMATS.CLAUDE);
    const msgStop = formatSSE({ type: "message_stop" }, FORMATS.CLAUDE);
    return sharedEncoder.encode(`${msgDelta}${msgStop}`);
  }
  // OpenAI Chat Completions client: a finish chunk + [DONE] sentinel
  if (clientFormat === FORMATS.OPENAI) {
    const finishChunk = `data: ${JSON.stringify({
      id: `chatcmpl-${Date.now()}`,
      object: "chat.completion.chunk",
      created: Math.floor(Date.now() / 1000),
      choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
    })}\n\n`;
    return sharedEncoder.encode(`${finishChunk}data: [DONE]\n\n`);
  }
  return null;
}
