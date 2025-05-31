"use client"

import { useState } from "react"
import LeaseUploadForm, { type AnalysisResult } from "@/components/lease-upload-form"
import ChatInterface from "@/components/chat-interface"
import EmailDrafter from "@/components/email-drafter"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, MessageCircle, FileText, DraftingCompass, Sparkles, Home, FileBadge } from "lucide-react" // Keep Home and FileBadge

export default function HomePage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [uploadedLeaseUrl, setUploadedLeaseUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("analyze")

  const handleAnalysisComplete = (result: AnalysisResult, fileUrl: string) => {
    setAnalysisResult(result)
    setUploadedLeaseUrl(fileUrl)
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 md:p-8">
      <header className="text-center mb-12">
        {/* LeaseDaddy Title - stands alone */}
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-blue-500 to-pink-400 mb-3">
          LeaseDaddy
        </h1>
        {/* Sub-tagline with icons */}
        <div className="flex items-center justify-center text-slate-600 text-lg">
          <FileBadge className="h-5 w-5 text-blue-500 mr-2" />
          <span>Your Communication Coach for Renting</span>
          <Home className="h-5 w-5 text-pink-500 ml-2" />
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 border border-slate-200 rounded-lg p-1">
          <TabsTrigger
            value="analyze"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md py-2 text-slate-600"
          >
            <FileText className="w-4 h-4 mr-2" /> Analyze Lease
          </TabsTrigger>
          <TabsTrigger
            value="email"
            disabled={!analysisResult?.success}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md py-2 text-slate-600 disabled:opacity-50"
          >
            <DraftingCompass className="w-4 h-4 mr-2" /> Draft Email
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            disabled={!analysisResult?.success}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md py-2 text-slate-600 disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4 mr-2" /> AI Coach
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <Card className="bg-white border-slate-200 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">Upload Your Lease</CardTitle>
              <CardDescription className="text-slate-500">
                Get an AI analysis, vibe check, and pre-drafted emails. PDF only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeaseUploadForm onAnalysisComplete={handleAnalysisComplete} />
              {analysisResult && !analysisResult.success && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  <h3 className="text-lg font-semibold">Analysis Failed</h3>
                  <p>{analysisResult.error}</p>
                </div>
              )}
              {analysisResult && analysisResult.success && (
                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-slate-800 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-pink-500" />
                      Overall Lease Vibe Check
                    </h3>
                    <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                      {analysisResult.overallAssessment || "No overall assessment provided."}
                    </p>
                  </div>

                  {analysisResult.redFlags && analysisResult.redFlags.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-slate-800">Potential Red Flags</h3>
                      <ul className="space-y-4">
                        {analysisResult.redFlags.map((flag, index) => (
                          <li key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-start">
                              <AlertTriangle className="w-6 h-6 text-pink-500 mr-3 mt-1 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-pink-600 text-lg">{flag.issue}</h4>
                                {flag.clause && (
                                  <p className="text-xs text-slate-500 mt-1 mb-1">Related Clause: "{flag.clause}"</p>
                                )}
                                <p className="text-slate-700">{flag.explanation}</p>
                                {flag.suggestion && (
                                  <p className="mt-2 text-sm text-blue-600">
                                    <span className="font-semibold">Suggestion:</span> {flag.suggestion}
                                  </p>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysisResult.redFlags && analysisResult.redFlags.length === 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-slate-800">Potential Red Flags</h3>
                      <p className="text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                        No specific red flags identified by the AI. However, always review your lease carefully and
                        consider consulting a professional if you have any concerns.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="bg-white border-slate-200 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">Draft Email to Landlord</CardTitle>
              <CardDescription className="text-slate-500">
                Select a tone to view a pre-generated email draft based on your lease analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResult?.success && analysisResult.emailDrafts ? (
                <EmailDrafter emailDrafts={analysisResult.emailDrafts} />
              ) : (
                <p className="text-slate-600 text-center py-8">
                  Please analyze your lease first to enable email drafting. Results will include pre-generated emails.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="bg-white border-slate-200 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-800">Chat with Your AI Coach</CardTitle>
              <CardDescription className="text-slate-500">
                Practice your communication with a simulated landlord. The AI has context of your analyzed lease.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatInterface
                leaseContext={analysisResult?.redFlags ? JSON.stringify(analysisResult.redFlags) : undefined}
                leaseUrl={uploadedLeaseUrl}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="text-center mt-12 py-6 border-t border-slate-200">
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} LeaseDaddy. All rights reserved.</p>
      </footer>
    </div>
  )
}
