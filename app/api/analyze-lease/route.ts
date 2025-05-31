import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { generateObject } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { z } from "zod"

// Increased duration significantly due to multiple generation tasks
export const maxDuration = 120 // Allow up to 2 minutes

const RedFlagSchema = z.object({
  issue: z.string().describe("A concise title for the potential issue or red flag found in the lease."),
  clause: z
    .string()
    .optional()
    .describe("The specific clause or section number from the lease related to this issue, if identifiable."),
  explanation: z
    .string()
    .describe("A detailed explanation of why this is a potential red flag and its implications for the renter."),
  suggestion: z
    .string()
    .optional()
    .describe("A brief suggestion on what the renter could do or ask the landlord regarding this issue."),
})

const EmailDraftsSchema = z.object({
  "better-terms": z.string().describe("Email draft for 'Better Terms' tone."),
  discount: z.string().describe("Email draft for 'Get Discount' tone."),
  "take-charge": z.string().describe("Email draft for 'Take Charge' tone."),
  rampage: z.string().describe("Email draft for 'Rampage' (entertaining/humorous) tone."),
})

const LeaseAnalysisSchema = z.object({
  overallAssessment: z
    .string()
    .describe(
      "A brief (2-4 sentences) overall 'vibe check' of the lease. Comment on its general fairness, complexity, and how it compares to typical renter-friendly or landlord-friendly leases.",
    ),
  redFlags: z
    .array(RedFlagSchema)
    .describe("An array of potential red flags or important clauses found in the lease agreement."),
  emailDrafts: EmailDraftsSchema.describe(
    "A set of four email drafts based on the red flags, each with a different tone.",
  ),
})

function getEmailToneInstructions() {
  return `
Based on the identified red flags and overall assessment, generate four distinct email drafts to the landlord. Each email should have a clear subject line, greeting, body, and closing.

1.  **Better Terms Tone ('better-terms')**: Polite but firm. Goal: negotiate better terms or seek clarification. Collaborative, professional, constructive. Suggest reasonable alternatives.
2.  **Get Discount Tone ('discount')**: Assertive yet reasonable. Goal: request a discount or compensation due to unfair terms. Clearly link red flags to financial consideration. Highlight impact on renter.
3.  **Take Charge Tone ('take-charge')**: More aggressive and assertive. Goal: strongly contest terms. Firm, direct, state objections and desired outcomes. Coherent, outline specific actions/changes expected.
4.  **Rampage Tone ('rampage')**: Entertaining, over-the-top, humorous. Purely for entertainment. Absurdly aggressive, comical misinterpretations, ridiculous demands. Hyperbole and wit. Clearly satirical, not genuinely offensive. Think theatrical villain or comically unhinged character. Make it funny!
`
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("leasePdf") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded." }, { status: 400 })
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ success: false, error: "Invalid file type. Only PDF is allowed." }, { status: 400 })
    }

    const blob = await put(file.name, file, { access: "public", contentType: "application/pdf", addRandomSuffix: true })
    const fileBuffer = await file.arrayBuffer()

    const emailInstructions = getEmailToneInstructions()

    const { object: analysis } = await generateObject({
      model: anthropic("claude-3-5-sonnet-latest"),
      schema: LeaseAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the following lease agreement PDF.
              First, provide an "overallAssessment".
              Second, identify potential "redFlags".
              Third, generate "emailDrafts" according to these instructions: ${emailInstructions}
              Please analyze this lease document and generate all requested components.`,
            },
            { type: "file", data: fileBuffer, mimeType: "application/pdf" },
          ],
        },
      ],
      temperature: 0.5, // General temperature, rampage might still be creative enough
    })
    // [^1][^3]

    return NextResponse.json({
      success: true,
      overallAssessment: analysis.overallAssessment,
      redFlags: analysis.redFlags,
      emailDrafts: analysis.emailDrafts, // Include all generated drafts
      fileUrl: blob.url,
    })
  } catch (error: any) {
    console.error("Error in analyze-lease (generating all drafts):", error)
    let errorMessage = "An unexpected error occurred during analysis and draft generation."
    if (error.name === "ZodError") {
      errorMessage = "AI model returned an unexpected data structure for analysis or drafts. Please try again."
    } else if (error.message) {
      errorMessage = error.message
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
