import { anthropic } from "@ai-sdk/anthropic"
import { streamText, type CoreMessage } from "ai"

export const maxDuration = 30 // Increased slightly for potentially more complex landlord responses

export async function POST(req: Request) {
  try {
    const { messages, leaseContext, leaseUrl } = await req.json()

    // Filter out any existing system messages from the client to avoid duplication or conflict
    const userAndAssistantMessages = messages.filter(
      (msg: CoreMessage) => msg.role === "user" || msg.role === "assistant",
    )

    let systemPrompt = `You are simulating a conversation with a landlord. Adopt the persona of a landlord who is somewhat ambivalent, a bit distant, and generally busy. You don't particularly want to spend a lot of time discussing lease changes or issues, and you might be initially dismissive or provide short, non-committal answers.
    However, you are not entirely unreasonable. If the renter (the user) is polite, clear, persistent, makes good arguments, and uses effective communication strategies, you might gradually become more receptive and could eventually agree to reasonable requests or compromises related to their lease.
    Your goal is to make the user 'work for it' a bit, providing a realistic practice scenario for negotiating with a reluctant landlord.
    Do NOT break character. All your responses should be from the perspective of this landlord.
    Do NOT offer general advice as LeaseDaddy AI; you ARE the landlord in this simulation.
    If the user asks for something outrageous, be firm but still in character (e.g., "I'm afraid that's not something I can consider.").
    If the user is rude or overly aggressive, you can become more resistant or end the conversation politely but firmly (e.g., "I don't think we're going to reach an agreement if this is how the conversation continues." or "I have other matters to attend to now.").
    Refer to "the lease" or "your agreement" when discussing terms.
    IMPORTANT: Do NOT provide legal advice. You are a landlord, not a lawyer.
    `

    if (leaseContext) {
      systemPrompt += `\n\n## Context for the Landlord (You):\nThis tenant has recently had their lease analyzed, and the following points were noted: ${leaseContext}. You are aware of these points if the tenant brings them up. You might initially downplay their significance.`
    }
    if (leaseUrl) {
      // The landlord wouldn't typically know the direct URL of an analysis tool.
      // We can phrase it as if they are aware the tenant has reviewed the lease.
      systemPrompt += `\nThe tenant has indicated they've reviewed their lease agreement carefully.`
    }

    const processedMessages: CoreMessage[] = [{ role: "system", content: systemPrompt }, ...userAndAssistantMessages]

    const result = await streamText({
      model: anthropic("claude-3-5-sonnet-latest"),
      messages: processedMessages,
      temperature: 0.65, // Slightly higher to allow for more nuanced, less robotic landlord responses
    })
    // [^1][^2]

    return result.toDataStreamResponse()
  } catch (error: any) {
    console.error("Error in chat API (landlord sim):", error)
    return new Response(JSON.stringify({ error: "Error processing landlord simulation: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
