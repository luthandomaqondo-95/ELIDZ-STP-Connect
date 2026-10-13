/**
 * Development-only seed route — safe to call multiple times (idempotent checks).
 * GET /api/admin/seed  → seeds report data (applications, message_reports, smme listings, visit spread)
 * Blocked in production.
 */
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Not available in production" }, { status: 403 })
    }

    const db = createAdminClient()
    const log: string[] = []

    // ── 0. Discover existing IDs ─────────────────────────────────────────────
    const { data: profiles } = await db.from("profiles").select("id, role")
    const { data: opps } = await db.from("opportunities").select("id, status, type, created_at")
    const { data: chats } = await db.from("chats").select("id")
    const { data: facilities } = await db.from("facilities").select("service_id, service_name").limit(6)
    const { data: spItems } = await db.from("smme_services_products").select("id, type, name, smme_id").limit(15)

    const profileIds = (profiles || []).map((p) => p.id)
    const oppIds = (opps || []).map((o) => o.id)
    const chatIds = (chats || []).map((c) => c.id)
    const smmeProfileIds = (profiles || []).filter((p) => ["SMME", "SME"].includes(p.role || "")).map((p) => p.id)
    const now = new Date()

    log.push(`Found: ${profileIds.length} profiles, ${oppIds.length} opps, ${chatIds.length} chats, ${smmeProfileIds.length} SMME profiles`)

    // ── 1. Applications ──────────────────────────────────────────────────────
    const { count: appCount } = await db.from("applications").select("*", { count: "exact", head: true })
    log.push(`applications existing: ${appCount}`)

    if ((appCount || 0) === 0 && profileIds.length > 0 && oppIds.length > 0) {
        const statuses = ["pending", "pending", "pending", "accepted", "accepted", "rejected"]
        const apps = oppIds.flatMap((oppId, oi) => {
            const numApps = oi < 4 ? 2 : 1
            return Array.from({ length: numApps }, (_, i) => {
                const daysAgo = 5 + oi * 4 + i * 2
                return {
                    applicant_id: profileIds[(oi + i) % profileIds.length],
                    opportunity_id: oppId,
                    status: statuses[(oi + i) % statuses.length],
                    submitted_at: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
                }
            })
        })
        const { error } = await db.from("applications").insert(apps)
        log.push(error ? `Applications error: ${error.message}` : `Inserted ${apps.length} applications`)
    }

    // ── 2. SMME services & products ──────────────────────────────────────────
    const { count: spCount } = await db.from("smme_services_products").select("*", { count: "exact", head: true })
    log.push(`smme_services_products existing: ${spCount}`)

    if ((spCount || 0) < 6 && smmeProfileIds.length > 0) {
        const smmeId = smmeProfileIds[0]
        const smmeId2 = smmeProfileIds[1] || smmeId
        const newItems = [
            { smme_id: smmeId, type: "Service", name: "Web Development & Design", category: "Technology", status: "active", description: "Custom website and mobile-friendly web app development.", created_at: new Date(now.getTime() - 60 * 86400000).toISOString() },
            { smme_id: smmeId, type: "Service", name: "Business Consulting", category: "Professional Services", status: "active", description: "Strategic business planning and market entry consulting.", created_at: new Date(now.getTime() - 50 * 86400000).toISOString() },
            { smme_id: smmeId, type: "Product", name: "Solar Panel Installation Kit", category: "Renewable Energy", status: "active", description: "Complete 5kW solar installation kit for residential use.", created_at: new Date(now.getTime() - 45 * 86400000).toISOString() },
            { smme_id: smmeId2, type: "Service", name: "Graphic Design & Branding", category: "Creative", status: "active", description: "Logo design, brand identity and marketing collateral.", created_at: new Date(now.getTime() - 35 * 86400000).toISOString() },
            { smme_id: smmeId2, type: "Product", name: "Artisanal Leather Goods", category: "Manufacturing", status: "active", description: "Handcrafted leather bags and accessories.", created_at: new Date(now.getTime() - 25 * 86400000).toISOString() },
            { smme_id: smmeId2, type: "Service", name: "Financial Accounting", category: "Professional Services", status: "active", description: "Bookkeeping, tax preparation and financial reporting for SMEs.", created_at: new Date(now.getTime() - 15 * 86400000).toISOString() },
            { smme_id: smmeId, type: "Product", name: "IoT Sensor Module", category: "Technology", status: "active", description: "Low-power IoT sensor for industrial monitoring applications.", created_at: new Date(now.getTime() - 10 * 86400000).toISOString() },
        ]
        const existing = new Set((spItems || []).map((i: any) => i.name))
        const toInsert = newItems.filter((i) => !existing.has(i.name))
        if (toInsert.length > 0) {
            const { error } = await db.from("smme_services_products").insert(toInsert)
            log.push(error ? `SMME items error: ${error.message}` : `Inserted ${toInsert.length} SMME items`)
        } else {
            log.push("SMME items already exist, skipped")
        }
    }

    // ── 3. Message reports ───────────────────────────────────────────────────
    const { count: reportCount } = await db.from("message_reports").select("*", { count: "exact", head: true })
    log.push(`message_reports existing: ${reportCount}`)

    if ((reportCount || 0) === 0 && chatIds.length > 0 && profileIds.length >= 2) {
        // Need messages first
        const { data: existingMsgs } = await db.from("messages").select("id").limit(10)
        let messageIds: string[] = (existingMsgs || []).map((m: any) => m.id)

        if (messageIds.length === 0) {
            // Detect sender column
            const { data: msgSample } = await db.from("messages").select("*").limit(1)
            const msgCols = msgSample ? Object.keys(msgSample[0] || {}) : []
            const senderCol = msgCols.find((c) => c.toLowerCase().includes("sender") || c === "user_id") || "sender_id"

            const msgsToInsert = chatIds.flatMap((chatId, ci) =>
                [0, 1, 2].map((i) => ({
                    chat_id: chatId,
                    [senderCol]: profileIds[(ci + i) % profileIds.length],
                    content: ["Hey, can you check this?", "This content seems off.", "Reported for review."][i],
                    created_at: new Date(now.getTime() - (ci * 10 + i * 3) * 86400000).toISOString(),
                }))
            )
            const { data: insertedMsgs, error: msgErr } = await db.from("messages").insert(msgsToInsert).select("id")
            if (msgErr) {
                log.push(`Messages insert error: ${msgErr.message} — skipping message_reports`)
            } else {
                messageIds = (insertedMsgs || []).map((m: any) => m.id)
                log.push(`Inserted ${messageIds.length} messages`)
            }
        }

        if (messageIds.length > 0) {
            const reasons = ["Harassment", "Spam", "Inappropriate Content", "Misinformation", "Threats"]
            const statuses = ["pending", "pending", "reviewing", "resolved", "dismissed"]
            const reports = messageIds.map((msgId, i) => ({
                message_id: msgId,
                chat_id: chatIds[i % chatIds.length],
                reporter_id: profileIds[i % profileIds.length],
                reported_user_id: profileIds[(i + 1) % profileIds.length],
                reason: reasons[i % reasons.length],
                status: statuses[i % statuses.length],
                created_at: new Date(now.getTime() - i * 7 * 86400000).toISOString(),
            }))
            const { error } = await db.from("message_reports").insert(reports)
            log.push(error ? `Reports error: ${error.message}` : `Inserted ${reports.length} message_reports`)
        }
    }

    // ── 4. Analytics visits — do NOT seed artificial visits ─────────────────
    // analytics_visits contains genuine organic user activity. Adding artificial
    // data here inflates the numbers for a platform that is just starting out.
    // The real visit data is already present in the database.
    const { count: visitCount } = await db.from("analytics_visits").select("*", { count: "exact", head: true })
    log.push(`analytics_visits: ${visitCount} organic rows — not touched`)

    // ── 5. Spread opportunity dates ──────────────────────────────────────────
    if (opps && opps.length > 0) {
        for (let i = 0; i < Math.min(opps.length, 8); i++) {
            const daysAgo = 15 + i * 20
            const { error } = await db
                .from("opportunities")
                .update({ created_at: new Date(now.getTime() - daysAgo * 86400000).toISOString() })
                .eq("id", opps[i].id)
            if (error) log.push(`Opp date update error: ${error.message}`)
        }
        log.push(`Spread ${Math.min(opps.length, 8)} opportunity created_at dates`)
    }

    const { count: finalVisits } = await db.from("analytics_visits").select("*", { count: "exact", head: true })
    const { count: finalApps } = await db.from("applications").select("*", { count: "exact", head: true })
    const { count: finalReports } = await db.from("message_reports").select("*", { count: "exact", head: true })
    const { count: finalSp } = await db.from("smme_services_products").select("*", { count: "exact", head: true })

    return NextResponse.json({
        success: true,
        log,
        final: { analytics_visits: finalVisits, applications: finalApps, message_reports: finalReports, smme_services_products: finalSp },
    })
}
