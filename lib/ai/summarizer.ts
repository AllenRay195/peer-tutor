import { generateWithOpenAI } from "./providers/openai"
import { generateWithClaude } from "./providers/claude"
import { generateWithLocal } from "./providers/local"

export type SummaryResult = {
  content: string
  provider: string
}

export async function generateSummary(
  prompt: string
): Promise<SummaryResult> {
  // 1️⃣ Try OpenAI
  try {
    return await generateWithOpenAI(prompt)
  } catch (err) {
    console.warn("OpenAI failed, falling back...", err)
  }

  // 2️⃣ Try Claude
  try {
    return await generateWithClaude(prompt)
  } catch (err) {
    console.warn("Claude failed, falling back...", err)
  }

  // 3️⃣ Local fallback (ALWAYS WORKS)
  return generateWithLocal(prompt)
}
