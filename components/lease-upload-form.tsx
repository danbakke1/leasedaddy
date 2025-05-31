"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" // Keep Label for the wrapper
import { Loader2, Upload, FileText } from "lucide-react"
import type { EmailDrafts } from "./email-drafter"

export interface RedFlag {
  issue: string
  clause?: string
  explanation: string
  suggestion?: string
}

export interface AnalysisResult {
  success: boolean
  overallAssessment?: string
  redFlags?: RedFlag[]
  emailDrafts?: EmailDrafts
  error?: string
  fileUrl?: string
}

interface LeaseUploadFormProps {
  onAnalysisComplete: (result: AnalysisResult, fileUrl: string) => void
}

export default function LeaseUploadForm({ onAnalysisComplete }: LeaseUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile)
        setFileName(selectedFile.name)
        setError(null)
      } else {
        setFile(null)
        setFileName(null)
        setError("Please upload a PDF file.")
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      setError("Please select a PDF file to upload.")
      return
    }
    setIsLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append("leasePdf", file)
    try {
      const response = await fetch("/api/analyze-lease", {
        method: "POST",
        body: formData,
      })
      const result: AnalysisResult = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Analysis failed")
      }
      onAnalysisComplete(result, result.fileUrl || "")
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred."
      setError(errorMessage)
      onAnalysisComplete({ success: false, error: errorMessage }, "")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to trigger file input click
  const handleAreaClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        {/* The Label "Lease Document (PDF only)" has been removed */}
        <Label // Wrap the entire dropzone area with Label to make it clickable
          htmlFor="lease-pdf-input" // Ensure this matches the Input id
          className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer"
          // onClick={handleAreaClick} // Alternative: use direct onClick if Label wrapping is tricky with styling
        >
          <div className="space-y-1 text-center pointer-events-none">
            {" "}
            {/* pointer-events-none for children if Label handles click */}
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <div className="flex items-center justify-center text-sm text-slate-500">
              <span className="font-medium text-blue-600 hover:text-blue-500">Upload a file</span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-400">PDF up to 10MB</p>
          </div>
          <Input
            id="lease-pdf-input" // Changed ID to avoid conflict if "lease-pdf" is used elsewhere
            name="lease-pdf-input"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept="application/pdf"
            ref={fileInputRef}
          />
        </Label>
        {fileName && (
          <div className="mt-3 text-sm text-slate-600 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-blue-500" />
            Selected file: {fileName}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        disabled={isLoading || !file}
        className="w-full text-white font-semibold py-3 rounded-md transition-all duration-300 ease-in-out
                   bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          "Analyze Lease & Get Drafts"
        )}
      </Button>
    </form>
  )
}
