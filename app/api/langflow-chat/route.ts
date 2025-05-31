import type { CoreMessage } from "ai"

export const maxDuration = 60 // Allow up to 60 seconds for LangFlow RAG to respond

interface RequestBody {
  messages: CoreMessage[]
  sessionId?: string
}

export async function POST(req: Request) {
  const { messages, sessionId = "leasedaddy_langflow_session" }: RequestBody = await req.json()

  const langflowEndpoint = process.env.LANGFLOW_ENDPOINT_URL
  const langflowApiKey = process.env.LANGFLOW_API_KEY

  if (!langflowEndpoint || !langflowApiKey) {
    console.error("LangFlow environment variables (LANGFLOW_ENDPOINT_URL, LANGFLOW_API_KEY) are not set.")
    return new Response("Chatbot configuration error. Please contact support.", { status: 500 })
  }

  const lastUserMessage = messages.findLast((m) => m.role === "user")

  if (!lastUserMessage || typeof lastUserMessage.content !== "string") {
    return new Response("No user message found or message content is not a string.", { status: 400 })
  }
  const userMessageContent = lastUserMessage.content

  const payload = {
    input_value: userMessageContent,
    output_type: "chat", // As per your example
    input_type: "chat", // As per your example
    // session_id is optional as per your example, using a default or passed-in one
    // If your LangFlow flow uses session_id for memory, ensure it's handled appropriately
    session_id: sessionId,
    // Ensure other necessary fields for your specific LangFlow flow are included if any
    // e.g., "tweaks": { "YourLLMComponentModel": {"temperature": 0.7} }
  }

  try {
    const response = await fetch(langflowEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${langflowApiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`LangFlow API error: ${response.status} ${response.statusText}`, errorBody)
      return new Response(
        `Error communicating with the knowledge base: ${response.statusText}. Details: ${errorBody}`,
        { status: response.status },
      )
    }

    const data = await response.json()
    let chatResponseText: string | undefined

    // Try to extract the message based on the provided schema
    if (
      data.outputs &&
      Array.isArray(data.outputs) &&
      data.outputs.length > 0 &&
      data.outputs[0].outputs &&
      Array.isArray(data.outputs[0].outputs) &&
      data.outputs[0].outputs.length > 0
    ) {
      const firstDetailedOutput = data.outputs[0].outputs[0]

      if (firstDetailedOutput.artifacts && typeof firstDetailedOutput.artifacts.message === "string") {
        chatResponseText = firstDetailedOutput.artifacts.message
      } else if (
        firstDetailedOutput.results &&
        firstDetailedOutput.results.message &&
        typeof firstDetailedOutput.results.message.text === "string"
      ) {
        chatResponseText = firstDetailedOutput.results.message.text
      } else if (
        firstDetailedOutput.outputs &&
        firstDetailedOutput.outputs.message &&
        typeof firstDetailedOutput.outputs.message.message === "string"
      ) {
        chatResponseText = firstDetailedOutput.outputs.message.message
      }
    }

    // Fallback to previous general checks if the specific path isn't found (optional, but can be a safety net)
    if (chatResponseText === undefined) {
      if (typeof data.text === "string") {
        chatResponseText = data.text
      } else if (data.result && data.result.message && typeof data.result.message.text === "string") {
        chatResponseText = data.result.message.text
      } else if (data.result && typeof data.result.text === "string") {
        chatResponseText = data.result.text
      }
    }

    if (chatResponseText !== undefined) {
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          // AI SDK text stream chunk format: 0:"<JSON_stringified_text_chunk>"\n
          // JSON.stringify ensures that any special characters in chatResponseText are properly escaped.
          const streamData = `0:${JSON.stringify(chatResponseText)}\n`
          controller.enqueue(encoder.encode(streamData))
          controller.close()
        },
      })

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Experimental-Stream-Data": "true", // This header signals an AI SDK stream
        },
      })
    } else {
      console.error(
        "Could not extract chat response text from LangFlow response. Full response:",
        JSON.stringify(data, null, 2),
      )
      // Return an error in the AI SDK stream format as well for consistency, if possible,
      // or a standard HTTP error if the client can handle it.
      // For simplicity, returning a standard HTTP error here.
      // If you want to stream an error message, you'd use a different prefix, e.g., 2: for error.
      return new Response("Received an unparseable or unexpected response format from the knowledge base.", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    }
  } catch (error: any) {
    console.error("Error calling LangFlow API:", error)
    return new Response(`Failed to connect to the knowledge base: ${error.message}`, { status: 500 })
  }
}
