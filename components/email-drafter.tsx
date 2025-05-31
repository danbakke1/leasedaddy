"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check, Tornado } from "lucide-react" // Changed Bomb to Tornado
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export type EmailTone = "better-terms" | "discount" | "take-charge" | "rampage"

export interface EmailDrafts {
  "better-terms": string
  discount: string
  "take-charge": string
  rampage: string
}

interface EmailDrafterProps {
  emailDrafts: EmailDrafts
}

const toneOptions: { value: EmailTone; label: string; emoji?: React.ReactNode }[] = [
  { value: "better-terms", label: "Better Terms" },
  { value: "discount", label: "Get Discount" },
  { value: "take-charge", label: "Take Charge" },
  { value: "rampage", label: "Rampage", emoji: <Tornado className="w-4 h-4 ml-1 text-orange-500" /> }, // New emoji
]

export default function EmailDrafter({ emailDrafts }: EmailDrafterProps) {
  const [selectedTone, setSelectedTone] = useState<EmailTone>("better-terms")
  const [currentDraft, setCurrentDraft] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    if (emailDrafts && selectedTone) {
      setCurrentDraft(emailDrafts[selectedTone] || "No draft available for this tone.")
    }
  }, [emailDrafts, selectedTone])

  const handleCopyToClipboard = () => {
    if (currentDraft) {
      navigator.clipboard.writeText(currentDraft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!emailDrafts) {
    return <p className="text-slate-600">Email drafts are not available.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Email Tone:</label>
        <ToggleGroup
          type="single"
          value={selectedTone}
          onValueChange={(value) => {
            if (value) setSelectedTone(value as EmailTone)
          }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          aria-label="Email tone"
        >
          {toneOptions.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="data-[state=on]:bg-gradient-to-r data-[state=on]:from-blue-500 data-[state=on]:to-pink-500 data-[state=on]:text-white flex items-center justify-center py-2 px-3 rounded-md border border-slate-300 hover:bg-slate-100 transition-colors"
              aria-label={option.label}
            >
              {option.label}
              {option.emoji}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {currentDraft && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-700">Email Draft:</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              disabled={!currentDraft || currentDraft.startsWith("No draft available")}
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <Textarea
            value={currentDraft}
            readOnly
            className="w-full h-64 p-3 border-slate-300 rounded-md bg-slate-50 text-slate-800 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Generated email draft"
          />
        </div>
      )}
    </div>
  )
}
