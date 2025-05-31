"use client"

import type React from "react"
import { useChat, type Message as AiMessage } from "@ai-sdk/react" // Renamed to avoid conflict
import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, User, Loader2, BrainCircuit } from "lucide-react" // Using BrainCircuit for "Daddy"
import Markdown from "react-markdown"

// Using AiMessage from @ai-sdk/react
type Message = AiMessage

export default function LangflowChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/langflow-chat",
    initialMessages: [
      {
        id: "init-langflow",
        role: "assistant",
        content:
          "Hello! I'm LeaseDaddy's knowledge expert. Ask me about common lease terms, what's considered 'normal' in rental agreements, or for general advice based on anonymized lease data. How can I help you understand leases better today?",
      },
    ],
    onError: (err) => {
      console.error("LangFlow Chat error:", err)
      // You could add a user-facing error message to the chat here if desired
      // e.g., setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: `Sorry, I encountered an issue: ${err.message}` }]);
    },
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e) // No need to pass extra options if API gets messages from main body
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-slate-200 shadow-inner">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((m: Message) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end gap-2 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className="w-8 h-8 shadow-sm">
                  <AvatarImage
                    src={
                      m.role === "user"
                        ? "/placeholder.svg?width=32&height=32&query=user+avatar+pink" // User avatar
                        : "/placeholder.svg?width=32&height=32&query=wise+owl+ai+avatar" // "Daddy" AI avatar
                    }
                  />
                  <AvatarFallback className={m.role === "user" ? "bg-pink-500 text-white" : "bg-sky-600 text-white"}>
                    {m.role === "user" ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-md text-white ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-pink-500 to-pink-400 rounded-br-none" // User message color
                      : "bg-gradient-to-br from-sky-600 to-sky-500 rounded-bl-none" // "Daddy" AI message color
                  }`}
                >
                  <Markdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc list-inside pl-4 mb-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal list-inside pl-4 mb-2" {...props} />,
                      a: ({ node, ...props }) => (
                        <a
                          className="text-pink-200 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {m.content}
                  </Markdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2 max-w-[80%]">
                <Avatar className="w-8 h-8 shadow-sm">
                  <AvatarImage src="/placeholder.svg?width=32&height=32" />
                  <AvatarFallback className="bg-sky-600 text-white">
                    <BrainCircuit className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="px-4 py-3 rounded-2xl shadow-md bg-gradient-to-br from-sky-600 to-sky-500 rounded-bl-none">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      {error && (
        <div className="p-4 border-t border-slate-200 text-center text-red-600">
          <p>Error: {error.message || "Could not connect to the knowledge base."}</p>
        </div>
      )}
      <form
        onSubmit={handleFormSubmit}
        className="p-4 border-t border-slate-200 flex items-center gap-3 bg-slate-50 rounded-b-xl"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about typical lease clauses, e.g., 'What's a normal pet fee?'"
          className="flex-grow bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-pink-500 focus:border-pink-500 rounded-lg shadow-sm"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out
                     bg-gradient-to-r from-pink-500 to-sky-500 hover:from-pink-600 hover:to-sky-600 
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  )
}
