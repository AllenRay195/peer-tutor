import OpenAI from "openai"
import type { SummaryResult } from "../summarizer"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateWithOpenAI(
  prompt: string
): Promise<SummaryResult> {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  })

  let text = ""
console.log("OPENAI KEY EXISTS:", !!process.env.OPENAI_API_KEY)

  const output = response.output as Array<{
    content?: Array<{
      type: string
      text?: string
    }>
  }> | undefined

  if (Array.isArray(output)) {
    for (const item of output) {
      if (!Array.isArray(item.content)) continue

      for (const content of item.content) {
        if (content.type === "output_text" && content.text) {
          text += content.text
        }
      }
    }
  }

  if (!text) {
    throw new Error("OpenAI returned no usable text")
  }

  return {
    provider: "openai",
    content: text.trim(),
  }
}
