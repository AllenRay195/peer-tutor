import type { SummaryResult } from "../summarizer"

export async function generateWithClaude(
  _prompt: string
): Promise<SummaryResult> {
  throw new Error("Claude provider not configured")
}
