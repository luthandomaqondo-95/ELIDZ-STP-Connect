import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

// Create a unique hash for deduplication
function createAlertHash(title: string, message: string, type: string, targetAudience: string): string {
  const content = `${title}-${message}-${type}-${targetAudience}`;
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// In-memory store for recent alerts (in production, use Redis or database)
const recentAlerts = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    console.log("Starting alerts API call...");
    const { title, message, type, targetAudience, createdBy } = await request.json();
    
    console.log("Received data:", { title, message, type, targetAudience, createdBy });

    if (!title || !message || !type || !targetAudience) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: title, message, type, targetAudience" },
        { status: 400 }
      );
    }

    // Create hash for deduplication
    const alertHash = createAlertHash(title, message, type, targetAudience);
    const now = Date.now();
    
    // Check if this alert was recently processed (within 30 seconds)
    if (recentAlerts.has(alertHash)) {
      const lastSent = recentAlerts.get(alertHash)!;
      if (now - lastSent < 30000) { // 30 seconds
        console.log("Duplicate alert detected via hash, skipping");
        return NextResponse.json({
          success: true,
          message: "Alert already sent recently (duplicate prevention)",
          notificationsCreated: 0,
          duplicate: true
        });
      }
    }

    // Update the timestamp for this alert hash
    recentAlerts.set(alertHash, now);
    
    // Clean old entries (older than 5 minutes)
    for (const [hash, timestamp] of recentAlerts.entries()) {
      if (now - timestamp > 300000) { // 5 minutes
        recentAlerts.delete(hash);
      }
    }

    const supabase = createAdminClient();
    console.log("Supabase client created");

    // Get users based on target audience
    let userIds: string[] = [];
    
    switch (targetAudience) {
      case "all":
        const { data: allUsers, error: allUsersError } = await supabase
          .from("profiles")
          .select("id");
        
        if (allUsersError) throw allUsersError;
        userIds = allUsers.map(user => user.id);
        console.log(`Found ${userIds.length} users for audience: all`);
        break;

      case "tenants":
        const { data: tenants, error: tenantsError } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "Tenant");
        
        if (tenantsError) throw tenantsError;
        userIds = tenants.map(tenant => tenant.id);
        console.log(`Found ${userIds.length} tenants for audience: tenants`);
        break;

      case "entrepreneurs":
        const { data: entrepreneurs, error: entrepreneursError } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "Entrepreneur");

        if (entrepreneursError) throw entrepreneursError;
        userIds = entrepreneurs.map((entrepreneur) => entrepreneur.id);
        console.log(`Found ${userIds.length} entrepreneurs for audience: ${targetAudience}`);
        break;

      case "staff":
        const { data: staff, error: staffError } = await supabase
          .from("profiles")
          .select("id")
          .in("role", ["Super Admin", "Admin"]);
        
        if (staffError) throw staffError;
        userIds = staff.map(staff => staff.id);
        console.log(`Found ${userIds.length} staff members for audience: staff`);
        break;

      case "students":
        const { data: students, error: studentsError } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "Student");
        
        if (studentsError) throw studentsError;
        userIds = students.map(student => student.id);
        console.log(`Found ${userIds.length} students for audience: students`);
        break;

      case "smmes":
        const { data: smmes, error: smmesError } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "SMME");
        
        if (smmesError) throw smmesError;
        userIds = smmes.map(smme => smme.id);
        console.log(`Found ${userIds.length} smmes for audience: smmes`);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid target audience" },
          { status: 400 }
        );
    }

    if (userIds.length === 0) {
      return NextResponse.json(
        { error: "No users found for the specified target audience" },
        { status: 404 }
      );
    }

    // Create notifications for all target users
    console.log(`Creating ${userIds.length} notifications...`);
    const notifications = userIds.map(userId => ({
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      message,
      type: mapAlertTypeToNotificationType(type),
      // created_by: createdBy, // Commented out since we don't have actual admin user ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log("Attempting to insert notifications into database...");
    console.log("Notifications to insert:", JSON.stringify(notifications, null, 2));

    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications)
      .select();

    if (error) {
      console.error("Error creating notifications:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      console.error("Notifications data:", JSON.stringify(notifications, null, 2));
      return NextResponse.json(
        { 
          error: "Failed to create notifications",
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log("Successfully inserted notifications:");
    console.log("Inserted data:", JSON.stringify(data, null, 2));
    console.log(`Number of notifications created: ${data?.length || 0}`);

    return NextResponse.json({
      success: true,
      message: `Alert sent to ${userIds.length} users`,
      notificationsCreated: userIds.length,
    });

  } catch (error) {
    console.error("Error in send alerts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function mapAlertTypeToNotificationType(alertType: string): string {
  const typeMap: { [key: string]: string } = {
    "info": "announcement",
    "warning": "system_alert", 
    "critical": "system_alert",
    "maintenance": "system_alert"
  };
  
  return typeMap[alertType] || "announcement";
}
