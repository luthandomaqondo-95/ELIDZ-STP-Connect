"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Loader2,
  RefreshCcw,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DashboardPageHeader } from "@/components/dashboard-page-header"

// ── Types ─────────────────────────────────────────────────────────────────────

type EnquiryStatus = "new" | "in_progress" | "resolved" | "closed"

type EnquiryRow = {
  id: string
  user_id: string | null
  enquiry_type: string
  subject: string
  message: string
  related_facility_id?: string | null
  status: EnquiryStatus
  response?: string | null
  responded_by?: string | null
  responded_at?: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    name: string
    email: string
    avatar?: string | null
    role?: string | null
  } | null
  responder?: { id: string; name: string; email: string } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<EnquiryStatus, { label: string; bg: string }> = {
  new:         { label: "New",         bg: "bg-blue-500" },
  in_progress: { label: "In Progress", bg: "bg-amber-500" },
  resolved:    { label: "Resolved",    bg: "bg-emerald-600" },
  closed:      { label: "Closed",      bg: "bg-slate-500" },
}

function formatDate(dateString: string) {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(date)
  if (diffDays < 7)  return new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true }).format(date)
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date)
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?"
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessageCenterPage() {
  const [enquiries, setEnquiries]       = useState<EnquiryRow[]>([])
  const [loading, setLoading]           = useState(true)
  const [silentPoll, setSilentPoll]     = useState(false)
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [draftResponse, setDraftResponse] = useState("")
  const [saving, setSaving]             = useState(false)
  const [saveSuccess, setSaveSuccess]   = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [searchQuery, setSearchQuery]   = useState("")

  const bottomRef = useRef<HTMLDivElement>(null)

  const selectedEnquiry = useMemo(
    () => enquiries.find((e) => e.id === selectedId) ?? null,
    [enquiries, selectedId]
  )

  const filteredEnquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return enquiries
    return enquiries.filter((e) => {
      const name = e.user?.name || e.user?.email || ""
      return (
        name.toLowerCase().includes(q) ||
        (e.subject || "").toLowerCase().includes(q) ||
        (e.message || "").toLowerCase().includes(q)
      )
    })
  }, [enquiries, searchQuery])

  // ── Data fetching ───────────────────────────────────────────────────────────

  const loadEnquiries = useCallback(async (silent = false) => {
    if (silent) setSilentPoll(true)
    else setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/admin/facility-enquiries")
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Failed to load enquiries")

      const rows = (json?.enquiries ?? []) as EnquiryRow[]
      setEnquiries(rows)

      setSelectedId((prev) => {
        if (prev && rows.some((r) => r.id === prev)) return prev
        return rows[0]?.id ?? null
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load enquiries")
    } finally {
      setLoading(false)
      setSilentPoll(false)
    }
  }, [])

  useEffect(() => {
    loadEnquiries()
    const id = setInterval(() => loadEnquiries(true), 8000)
    return () => clearInterval(id)
  }, [loadEnquiries])

  // Reset draft + success state when switching conversations
  useEffect(() => {
    setDraftResponse(selectedEnquiry?.response ?? "")
    setSaveSuccess(false)
    setError(null)
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom after response renders
  useEffect(() => {
    if (selectedEnquiry?.response) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedEnquiry?.response, selectedId])

  // ── Send response ───────────────────────────────────────────────────────────

  const sendResponse = useCallback(async (overrideStatus?: EnquiryStatus) => {
    if (!selectedEnquiry || !draftResponse.trim()) return
    setSaving(true)
    setSaveSuccess(false)
    setError(null)

    // Auto-advance "new" → "in_progress" when admin replies without specifying status
    const status: EnquiryStatus =
      overrideStatus ??
      (selectedEnquiry.status === "new" ? "in_progress" : selectedEnquiry.status)

    try {
      const res = await fetch("/api/admin/facility-enquiries", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: selectedEnquiry.id, response: draftResponse.trim(), status }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "Failed to send response")

      const updated = json?.enquiry as EnquiryRow
      setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
      // Scroll to bottom so the new response bubble is visible
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send response")
    } finally {
      setSaving(false)
    }
  }, [selectedEnquiry, draftResponse])

  const canSend = !!draftResponse.trim() && !saving

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0" style={{ height: "calc(100vh - 5rem)" }}>
      <DashboardPageHeader title="Message Centre" backHref="/dashboard/communication" />
      <p className="text-sm italic text-muted-foreground -mt-2">
        Respond to facility enquiries from the mobile app. Replies appear instantly on the user&apos;s side.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">

        {/* ── Left: Enquiry list ─────────────────────────────────────── */}
        <Card className="col-span-1 flex flex-col rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)] overflow-hidden min-h-0">
          <CardHeader className="pb-3 border-b flex-shrink-0">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search enquiries..."
                  className="h-10 rounded-3xl border-0 bg-orange-100/80 pl-8 dark:bg-slate-800/80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="h-10 w-10 rounded-3xl grid place-items-center bg-orange-100/80 shadow-sm hover:bg-orange-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition-colors"
                onClick={() => loadEnquiries(false)}
                title="Refresh"
              >
                <RefreshCcw className={cn("h-4 w-4", silentPoll && "animate-spin")} />
              </button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-auto p-0 min-h-0">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm space-y-2">
                <MessageSquare className="h-8 w-8 mx-auto opacity-30" />
                <p>No enquiries found</p>
              </div>
            ) : (
              filteredEnquiries.map((enq) => {
                const name = enq.user?.name || enq.user?.email || "Unknown"
                const isSelected = selectedId === enq.id
                const cfg = STATUS_CONFIG[enq.status]
                const hasResponse = !!enq.response

                return (
                  <div
                    key={enq.id}
                    onClick={() => setSelectedId(enq.id)}
                    className={cn(
                      "flex gap-3 p-4 border-b cursor-pointer transition-all select-none",
                      isSelected
                        ? "bg-orange-100/70 dark:bg-orange-900/20"
                        : "hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarImage src={enq.user?.avatar || undefined} />
                      <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1 mb-0.5">
                        <span className="text-sm font-semibold truncate">{name}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {formatDate(enq.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1.5">
                        {enq.subject || "No subject"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full text-white", cfg.bg)}>
                          {cfg.label}
                        </span>
                        {hasResponse && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ Replied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* ── Right: Conversation ────────────────────────────────────── */}
        <Card className="col-span-1 md:col-span-2 flex flex-col rounded-3xl border-0 shadow-[0_10px_30px_rgba(2,6,23,0.08)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)] overflow-hidden min-h-0">

          {selectedEnquiry ? (
            <>
              {/* Conversation header */}
              <div className="p-4 border-b flex items-center justify-between gap-3 flex-shrink-0 bg-card">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={selectedEnquiry.user?.avatar || undefined} />
                    <AvatarFallback>
                      {initials(selectedEnquiry.user?.name || selectedEnquiry.user?.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {selectedEnquiry.user?.name || selectedEnquiry.user?.email || "Unknown User"}
                    </h3>
                    {selectedEnquiry.user?.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedEnquiry.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[11px] font-bold px-3 py-1.5 rounded-full text-white flex-shrink-0",
                    STATUS_CONFIG[selectedEnquiry.status].bg
                  )}
                >
                  {STATUS_CONFIG[selectedEnquiry.status].label}
                </span>
              </div>

              {/* Chat messages area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-muted/20 min-h-0">

                {/* Meta chip */}
                <div className="text-center">
                  <span className="text-[11px] text-muted-foreground bg-background border rounded-full px-3 py-1 inline-block">
                    {selectedEnquiry.enquiry_type} enquiry &nbsp;·&nbsp; {formatDate(selectedEnquiry.created_at)}
                    {selectedEnquiry.related_facility_id && (
                      <> &nbsp;·&nbsp; Facility</>
                    )}
                  </span>
                </div>

                {/* Subject label */}
                <p className="text-sm font-semibold text-foreground px-1">
                  {selectedEnquiry.subject}
                </p>

                {/* User message — left bubble */}
                <div className="flex gap-2.5 items-end">
                  <Avatar className="h-7 w-7 flex-shrink-0 mb-4">
                    <AvatarImage src={selectedEnquiry.user?.avatar || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {initials(selectedEnquiry.user?.name || selectedEnquiry.user?.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[78%]">
                    <div className="rounded-2xl rounded-bl-sm bg-background border shadow-sm px-4 py-3">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedEnquiry.message}
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                      {formatDate(selectedEnquiry.created_at)}
                    </p>
                  </div>
                </div>

                {/* Admin response — right bubble */}
                {selectedEnquiry.response && (
                  <div className="flex gap-2.5 items-end justify-end">
                    <div className="max-w-[78%]">
                      <div className="rounded-2xl rounded-br-sm bg-[#002147] dark:bg-[#1e3a5f] px-4 py-3">
                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                          {selectedEnquiry.response}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right mr-1">
                        ELIDZ-STP Admin
                        {selectedEnquiry.responded_at
                          ? ` · ${formatDate(selectedEnquiry.responded_at)}`
                          : ""}
                      </p>
                    </div>
                    <div className="h-7 w-7 rounded-full bg-[#002147] dark:bg-[#1e3a5f] flex items-center justify-center flex-shrink-0 mb-4 text-[10px] font-bold text-white">
                      AD
                    </div>
                  </div>
                )}

                {/* Success banner */}
                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    Response sent. The user can now see your reply in the mobile app.
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Compose area */}
              <div className="p-4 border-t flex-shrink-0 bg-card space-y-3">
                {error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-50 p-3 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <Textarea
                  value={draftResponse}
                  onChange={(e) => setDraftResponse(e.target.value)}
                  onKeyDown={(e) => {
                    // Ctrl/Cmd + Enter sends reply
                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                      e.preventDefault()
                      sendResponse()
                    }
                  }}
                  placeholder="Type your reply… (Ctrl+Enter to send)"
                  className="min-h-[90px] rounded-2xl border-input resize-none text-sm"
                  disabled={saving}
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Status-change helpers */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl text-xs h-8"
                      onClick={() => sendResponse("in_progress")}
                      disabled={!canSend}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Send &amp; In Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl text-xs h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                      onClick={() => sendResponse("resolved")}
                      disabled={!canSend}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Send &amp; Resolve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-2xl text-xs h-8 text-slate-500 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                      onClick={() => sendResponse("closed")}
                      disabled={!canSend}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Send &amp; Close
                    </Button>
                  </div>

                  {/* Primary send */}
                  <Button
                    size="sm"
                    className="rounded-2xl h-8 bg-[#002147] hover:bg-[#002147]/90 text-white"
                    onClick={() => sendResponse()}
                    disabled={!canSend}
                  >
                    {saving
                      ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      : <Send className="h-4 w-4 mr-1.5" />}
                    {saving ? "Sending…" : "Send Reply"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <MessageSquare className="h-14 w-14 opacity-20" />
              <p className="text-sm">Select a conversation to get started</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
