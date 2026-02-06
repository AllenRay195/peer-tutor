import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { generateSummary } from "@/lib/ai/summarizer"

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      )
    }

    /* ---------- FETCH SESSION ---------- */
    const sessionRef = adminDb.doc(`sessions/${sessionId}`)
    const sessionSnap = await sessionRef.get()

    if (!sessionSnap.exists) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    const session = sessionSnap.data()!

    /* ---------- FETCH MESSAGES ---------- */
    const messagesSnap = await adminDb
      .collection(`sessions/${sessionId}/messages`)
      .orderBy("createdAt", "asc")
      .get()

    const chatText = messagesSnap.docs
      .map(d => {
        const m = d.data()

        const role =
          m.senderRole ??
          m.role ??
          "user"

        const text =
          m.text ??
          m.content ??
          ""

        return text
          ? `${role}: ${text}`
          : null
      })
      .filter(Boolean)
      .join("\n")

    /* ---------- FETCH NOTES ---------- */
    const notesSnap = await adminDb
      .doc(`sessions/${sessionId}/notes/main`)
      .get()

    const notesText =
      notesSnap.exists
        ? notesSnap.data()?.content || ""
        : ""

    /* ---------- BUILD PROMPT ---------- */
    const prompt = `
You are summarizing a tutoring session.

Subject: ${session.subject}

Conversation:
${chatText || "No conversation provided."}

Tutor Notes:
${notesText || "No notes provided."}

Provide:
- A clear summary
- Topics covered
- Action items
`

    /* ---------- GENERATE SUMMARY ---------- */
    const result = await generateSummary(prompt)

    /* ---------- SAVE SUMMARY ---------- */
    await adminDb
      .doc(`sessions/${sessionId}/summary/main`)
      .set({
        content: result.content,
        provider: result.provider,
        generatedAt: new Date(),
      })

    return NextResponse.json({
      success: true,
      provider: result.provider,
    })
  } catch (err) {
    console.error("Summary generation failed:", err)

    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    )
  }
}
