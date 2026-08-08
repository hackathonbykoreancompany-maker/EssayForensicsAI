/**
 * POST /api/analyze
 *
 * Accepts { text: string } in the request body.
 * Returns a combined EssayAnalysisResult as JSON.
 */

import { NextRequest, NextResponse } from "next/server";
import { analyzeEssay } from "../../../services/essayAnalysisService";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const { text } = body as { text?: unknown };

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or empty essay text. Please provide a non-empty string in the 'text' field." },
      { status: 422 }
    );
  }

  const result = analyzeEssay(text);

  return NextResponse.json(result, { status: 200 });
}
