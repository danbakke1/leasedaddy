"use client"

import type React from "react"

import { useChat, type Message } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, User, Bot, Loader2 } from "lucide-react" // Bot icon can represent the "Landlord"
import Markdown from "react-markdown"

interface ChatInterfaceProps {
  leaseContext?: string // JSON string of red flags or other context
  leaseUrl?: string | null // URL of the uploaded lease PDF
}

export default function ChatInterface({ leaseContext, leaseUrl }: ChatInterfaceProps) {
  const [initialSystemMessageSent, setInitialSystemMessageSent] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, error, reload } = useChat({
    api: "/api/chat", // This API now handles the landlord simulation
    body: {
      // These are sent with each request to ensure the API has the latest context
      leaseContext: leaseContext,
      leaseUrl: leaseUrl,
    },
    // No initial messages here; the system prompt is handled by the API.
    // We'll add a client-side "greeting" from the "landlord"
    onFinish: (message) => {
      // This callback can be used if needed, e.g., for analytics
    },
    onError: (err) => {
      console.error("Chat error:", err)
      // Potentially display a more user-friendly error message
    },
  })

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages])

  // Add an initial "greeting" from the landlord when the component mounts or context changes
  useEffect(() => {
    if (!messages.find((m) => m.id === "landlord-greeting") && leaseContext) {
      const landlordGreeting: Message = {
        id: "landlord-greeting",
        role: "assistant", // 'assistant' will be styled as the "landlord"
        content: "Alright, I got your message. What is it about the lease this time? I'm a bit busy.",
      }
      setMessages([...messages, landlordGreeting])
    } else if (!messages.find((m) => m.id === "landlord-generic-greeting") && !leaseContext) {
      const landlordGenericGreeting: Message = {
        id: "landlord-generic-greeting",
        role: "assistant",
        content: "Yes? If this is about a lease, please analyze it first so I know what you're referring to.",
      }
      setMessages([...messages, landlordGenericGreeting])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaseContext, setMessages]) // Run when leaseContext changes

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e, {
      options: {
        body: {
          leaseContext: leaseContext,
          leaseUrl: leaseUrl,
        },
      },
    })
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl border border-slate-200 shadow-inner">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages
            .filter((m) => m.role !== "system") // System messages are for AI internal use
            .map((m: Message) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-end gap-2 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <Avatar className="w-8 h-8 shadow-sm">
                    <AvatarImage
                      src={
                        m.role === "user"
                          ? "/placeholder.svg?width=32&height=32&query=user+avatar+blue"
                          : "/placeholder.svg?width=32&height=32&query=landlord+avatar+grey+suit" // Landlord avatar
                      }
                    />
                    <AvatarFallback
                      className={m.role === "user" ? "bg-blue-500 text-white" : "bg-slate-500 text-white"}
                    >
                      {" "}
                      {/* Landlord color */}
                      {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}{" "}
                      {/* Bot icon for landlord */}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-md text-white ${
                      m.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-blue-400 rounded-br-none"
                        : "bg-gradient-to-br from-slate-600 to-slate-500 rounded-bl-none" // Landlord message color
                    }`}
                  >
                    <Markdown
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside pl-4 mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside pl-4 mb-2" {...props} />,
                        a: ({ node, ...props }) => (
                          <a
                            className="text-sky-300 hover:underline"
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
                  <AvatarFallback className="bg-slate-500 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="px-4 py-3 rounded-2xl shadow-md bg-gradient-to-br from-slate-600 to-slate-500 rounded-bl-none">
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      {error && (
        <div className="p-4 border-t border-slate-200 text-center text-red-600">
          <p>Error: {error.message || "Could not connect to the landlord simulation."}</p>
        </div>
      )}
      <form
        onSubmit={handleFormSubmit}
        className="p-4 border-t border-slate-200 flex items-center gap-3 bg-slate-50 rounded-b-xl"
      >
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder={
            leaseContext ? "Type your message to the landlord..." : "Analyze lease to start landlord simulation."
          }
          className="flex-grow bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
          disabled={isLoading || !leaseContext} // Disable if no lease context
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim() || !leaseContext} // Disable if no lease context
          className="text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out
                     bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </Button>
      </form>
    </div>
  )
}
