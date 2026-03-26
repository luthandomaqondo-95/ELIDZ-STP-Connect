"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed"

export type ReportTableItem = {
  id: string
  createdAt: string
  status: ReportStatus
  reason: string
  messagePreview: string
  chatLabel: string
  reporterName: string
  reporterEmail: string
  reportedUserName: string
  reportedUserEmail: string
}

type MessageReportRow = {
  id: string
  message_id: string
  chat_id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  status: ReportStatus
  created_at: string
}

const ALLOWED_STATUSES = new Set<ReportStatus>([
  "pending",
  "reviewing",
  "resolved",
  "dismissed",
])

export async function getMessageReportsForAdmin(): Promise<ReportTableItem[]> {
  const adminSupabase = createAdminClient()

  const { data: reportsData, error: reportsError } = await adminSupabase
    .from("message_reports")
    .select("id,message_id,chat_id,reporter_id,reported_user_id,reason,status,created_at")
    .order("created_at", { ascending: false })

  if (reportsError) {
    console.error("Failed to fetch message reports:", reportsError)
    return []
  }

  const reports = (reportsData ?? []) as MessageReportRow[]
  const profileIds = Array.from(new Set(reports.flatMap((r) => [r.reporter_id, r.reported_user_id])))
  const messageIds = Array.from(new Set(reports.map((r) => r.message_id)))
  const chatIds = Array.from(new Set(reports.map((r) => r.chat_id)))

  const [{ data: profilesData }, { data: messagesData }, { data: chatsData }] = await Promise.all([
    profileIds.length > 0
      ? adminSupabase.from("profiles").select("id,name,email").in("id", profileIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string | null; email: string | null }> }),
    messageIds.length > 0
      ? adminSupabase.from("messages").select("id,content").in("id", messageIds)
      : Promise.resolve({ data: [] as Array<{ id: string; content: string }> }),
    chatIds.length > 0
      ? adminSupabase.from("chats").select("id,name,type").in("id", chatIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string | null; type: string | null }> }),
  ])

  const profileById = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id,
      {
        name: profile.name?.trim() || "Unknown user",
        email: profile.email?.trim() || "-",
      },
    ])
  )

  const messageById = new Map(
    (messagesData ?? []).map((message) => [message.id, message.content?.trim() || "(no text)"])
  )

  const chatById = new Map(
    (chatsData ?? []).map((chat) => [chat.id, chat.name?.trim() || (chat.type ? `${chat.type} chat` : "Chat")])
  )

  return reports.map((report) => ({
    id: report.id,
    createdAt: report.created_at,
    status: report.status,
    reason: report.reason,
    messagePreview: messageById.get(report.message_id) || "(message unavailable)",
    chatLabel: chatById.get(report.chat_id) || "Unknown chat",
    reporterName: profileById.get(report.reporter_id)?.name || "Unknown user",
    reporterEmail: profileById.get(report.reporter_id)?.email || "-",
    reportedUserName: profileById.get(report.reported_user_id)?.name || "Unknown user",
    reportedUserEmail: profileById.get(report.reported_user_id)?.email || "-",
  }))
}

export async function updateMessageReportStatus(reportId: string, status: ReportStatus) {
  if (!reportId?.trim()) {
    return { success: false, error: "Missing report id." }
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return { success: false, error: "Invalid report status." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from("message_reports")
    .update({
      status,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", reportId)

  if (error) {
    console.error("Error updating message report status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/users/reports")
  return { success: true }
}

