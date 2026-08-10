/**
 * POST /api/analyze
 *
 * Accepts { text: string } in the request body.
 * Returns a combined EssayAnalysisResult as JSON.
 *
 * Validation:
 *   400 — invalid JSON
 *   422 — missing, non-string, empty/whitespace, or oversized text
 *   429 — rate limit exceeded (in-memory, per IP)
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeEssay } from "../../../services/essayAnalysisService";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum allowed essay length in characters (~50 000 chars ≈ ~8 000 words) */
const MAX_TEXT_LENGTH = 50_000;

// ---------------------------------------------------------------------------
// In-memory rate limiter
//
// Uses a sliding-window counter keyed by IP address.
// No external dependencies — intentionally simple and stateless across
// serverless instances. For a multi-instance deployment, swap this for
// Redis or Upstash without changing any other code.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;  // requests per window per IP

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

/** Module-level store; lives for the lifetime of the Node.js process */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Returns true if the request should be allowed, false if rate-limited.
 * Automatically resets the window when it expires.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // First request or window has expired — open a fresh window
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Extracts a best-effort client IP from Next.js request headers.
 * Falls back to "unknown" so rate limiting degrades gracefully rather
 * than blocking all requests when the header is absent.
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Rate limit check
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
        },
      }
    );
  }

  // 2. Parse JSON body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  // 3. Validate `text` field
  if (
    body === null ||
    typeof body !== "object" ||
    !("text" in (body as object))
  ) {
    return NextResponse.json(
      { error: "Request body must be a JSON object with a 'text' field." },
      { status: 422 }
    );
  }

  const { text } = body as { text: unknown };

  if (typeof text !== "string") {
    return NextResponse.json(
      { error: "'text' must be a string." },
      { status: 422 }
    );
  }

  if (text.trim().length === 0) {
    return NextResponse.json(
      { error: "Essay text must not be empty or whitespace only." },
      { status: 422 }
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error: `Essay text exceeds the maximum allowed length of ${MAX_TEXT_LENGTH.toLocaleString()} characters.`,
      },
      { status: 422 }
    );
  }

  // 4. Run analysis
  const result = analyzeEssay(text);

  return NextResponse.json(result, { status: 200 });
}
