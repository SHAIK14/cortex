"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  IconSparkles, 
  IconChevronRight, 
  IconLoader2, 
  IconMessage2,
  IconSend,
  IconTerminal,
  IconActivity,
  IconInfoCircle,
  IconCpu
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import api from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

export default function PlaygroundPage() {
  const { credentials } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [showMonitor, setShowMonitor] = useState(true)
  const scrollRef = useRef(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const hasCredentials = !!credentials.openai_key && !!credentials.supabase_url

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading || !hasCredentials) return

    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await api.post("/memory/chat", {
        credentials,
        message: input,
        extract_memories: true,
        retrieve_k: 5,
      })

      const assistantMessage = { role: "assistant", content: response.data.response }
      setMessages((prev) => [...prev, assistantMessage])
      setDebugInfo({
        retrieved: response.data.retrieved_memories || [],
        extracted: response.data.debug_info?.extracted_facts || [],
        decisions: response.data.debug_info?.decisions || [],
        stats: {
          latency: response.data.debug_info?.latency_ms,
          tokens_in: response.data.debug_info?.tokens_in,
          tokens_out: response.data.debug_info?.tokens_out,
        },
      })
    } catch (err) {
      console.error("Chat failed:", err)
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Error: ${err.message}. Make sure your keys are valid.`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-background min-w-0">
        <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <IconMessage2 className="w-4 h-4 text-zinc-500" />
            <h1 className="font-semibold text-sm tracking-tight">Playground</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMonitor(!showMonitor)}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-medium"
          >
            {showMonitor ? "Close Monitor" : "Open Monitor"}
            <IconChevronRight
              className={cn("ml-1.5 w-3 h-3 transition-transform", showMonitor && "rotate-90")}
            />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="size-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <IconSparkles className="w-6 h-6 text-zinc-400" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight mb-1">Cortex Playground</h2>
              <p className="text-zinc-500 max-w-xs text-sm">Interact with your AI memory engine.</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full space-y-6 pb-20">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex flex-col gap-1.5", m.role === "user" ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-2xl max-w-[90%] text-sm shadow-xs border transition-colors",
                      m.role === "user"
                        ? "bg-zinc-900 text-zinc-100 border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100 font-medium"
                        : m.role === "system"
                        ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30 text-xs italic"
                        : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                    )}
                  >
                    {m.content}
                  </div>
                  <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 px-1 uppercase tracking-wider">
                    {m.role === "user" ? "Message" : "Response"}
                  </span>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-2xl mx-auto">
            <InputGroup className="p-1 focus-within:ring-zinc-400/20">
              <InputGroupInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSend(e)
                  }
                }}
                placeholder={
                  hasCredentials ? "Type a message..." : "Connect your infrastructure to start..."
                }
                disabled={!hasCredentials || loading}
                className="min-h-[44px] text-sm"
              />
              <InputGroupAddon align="inline-end">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <InputGroupButton
                          onClick={handleSend}
                          disabled={!hasCredentials || loading || !input.trim()}
                          variant={hasCredentials ? "default" : "secondary"}
                          size="sm"
                          className={cn(
                            "rounded-md h-8 w-8 p-0 transition-opacity",
                            !hasCredentials && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {loading ? (
                            <IconLoader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <IconSend className="w-4 h-4" />
                          )}
                        </InputGroupButton>
                      </span>
                    </TooltipTrigger>
                    {!hasCredentials && (
                      <TooltipContent
                        side="top"
                        className="text-[10px] font-bold uppercase tracking-widest bg-zinc-900 text-zinc-100"
                      >
                        API Credentials Required
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </InputGroupAddon>
            </InputGroup>
            {!hasCredentials && (
              <p className="mt-2 text-[10px] text-center text-zinc-400 font-bold uppercase tracking-[0.1em]">
                System offline —{" "}
                <Link
                  href="/settings"
                  className="underline underline-offset-2 hover:text-zinc-600"
                >
                  Add credentials
                </Link>{" "}
                to enable neural relay.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Thought Monitor Panel */}
      <AnimatePresence>
        {showMonitor && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden"
          >
            <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 shrink-0">
              <IconTerminal className="w-4 h-4 text-zinc-400 mr-2" />
              <h2 className="font-bold text-[10px] uppercase tracking-widest text-zinc-500">
                Cognitive State
              </h2>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {!debugInfo ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <IconActivity className="w-10 h-10 mb-4 text-zinc-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    Awaiting telemetry
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <DebugStat label="Latency" value={`${debugInfo.stats.latency}ms`} />
                    <DebugStat label="Context Hits" value={debugInfo.retrieved.length} />
                  </div>

                  <MonitorSection title="Memory Retrieval">
                    {debugInfo.retrieved.length > 0 ? (
                      <div className="space-y-3">
                        {debugInfo.retrieved.map((mem, i) => (
                          <div
                            key={i}
                            className="p-3 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium leading-relaxed italic text-zinc-600 dark:text-zinc-400"
                          >
                            "{mem.text}"
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-zinc-400 italic flex items-center gap-2">
                        <IconInfoCircle className="w-3 h-3" /> NO RELEVANT CONTEXT FOUND
                      </p>
                    )}
                  </MonitorSection>

                  <MonitorSection title="Fact Extraction">
                    {debugInfo.extracted.length > 0 ? (
                      <div className="space-y-3">
                        {debugInfo.extracted.map((fact, i) => (
                          <div
                            key={i}
                            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2 group shadow-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-1.5 py-0.5 rounded-[3px] text-[8px] font-extrabold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                                {fact.type}
                              </span>
                              <span className="text-[8px] font-bold text-zinc-300 dark:text-zinc-700 font-mono">
                                NODE_{i}
                              </span>
                            </div>
                            <div className="text-xs font-bold leading-tight text-zinc-900 dark:text-zinc-100">
                              "{fact.text}"
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-zinc-400 italic flex items-center gap-2">
                        <IconInfoCircle className="w-3 h-3" /> NO NEW FACTS EXTRACTED
                      </p>
                    )}
                  </MonitorSection>

                  <MonitorSection title="System Decisions">
                    {debugInfo.decisions.length > 0 ? (
                      <div className="space-y-3">
                        {debugInfo.decisions.map((dec, i) => (
                          <div
                            key={i}
                            className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 shadow-xs"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={cn(
                                  "px-1.5 py-0.5 rounded-[3px] text-[8px] font-extrabold uppercase",
                                  dec.action === "ADD"
                                    ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                )}
                              >
                                {dec.action}
                              </span>
                              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest italic">
                                Reasoning
                              </span>
                            </div>
                            <div className="text-[10px] font-medium leading-relaxed text-zinc-500 italic">
                              {dec.reasoning}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-zinc-400 italic flex items-center gap-2">
                        <IconInfoCircle className="w-3 h-3" /> NO PERSISTENCE DECISIONS
                      </p>
                    )}
                  </MonitorSection>
                </>
              )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 text-[9px] text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 uppercase font-bold tracking-widest flex items-center gap-3">
              <IconCpu className="w-3 h-3 text-zinc-400" />
              Telemetry active v1.0.0
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

function MonitorSection({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
        <h3 className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

function DebugStat({ label, value }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-xs">
      <div className="text-[8px] text-zinc-400 uppercase font-extrabold tracking-tighter mb-0.5">
        {label}
      </div>
      <div className="text-sm font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
    </div>
  )
}
