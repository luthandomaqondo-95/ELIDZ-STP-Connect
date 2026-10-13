import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthedProfile } from "@/lib/authz";
import { notifySuperAdminsOfAdminAction } from "@/lib/admin/super-admin-alerts";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

// Create a unique hash for deduplication
function createEventHash(title: string, description: string, startDate: string, location: string): string {
  const content = `${title}-${description}-${startDate}-${location}`;
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// In-memory store for recent events (in production, use Redis or database)
const recentEvents = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    console.log("Starting events API call...");
    const { user, profile } = await getAuthedProfile();
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      location, 
      type, 
      targetAudience, 
      maxParticipants,
      createdBy 
    } = await request.json();
    
    console.log("Received data:", { 
      title, 
      description, 
      startDate, 
      endDate, 
      location, 
      type, 
      targetAudience, 
      maxParticipants,
      createdBy 
    });

    if (!title || !description || !startDate || !location || !type || !targetAudience) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: title, description, startDate, location, type, targetAudience" },
        { status: 400 }
      );
    }

    // Create hash for deduplication
    const eventHash = createEventHash(title, description, startDate, location);
    const now = Date.now();
    
    // Check if this event was recently processed (within 30 seconds)
    if (recentEvents.has(eventHash)) {
      const lastSent = recentEvents.get(eventHash)!;
      if (now - lastSent < 30000) { // 30 seconds
        console.log("Duplicate event detected via hash, skipping");
        return NextResponse.json({
          success: true,
          message: "Event already published recently (duplicate prevention)",
          eventId: null,
          duplicate: true
        });
      }
    }

    // Update the timestamp for this event hash
    recentEvents.set(eventHash, now);
    
    // Clean old entries (older than 5 minutes)
    for (const [hash, timestamp] of recentEvents.entries()) {
      if (now - timestamp > 300000) { // 5 minutes
        recentEvents.delete(hash);
      }
    }

    const supabase = createAdminClient();
    console.log("Supabase client created");

    // Create the event
    const eventData = {
      id: crypto.randomUUID(),
      title,
      description,
      date: startDate, // Use single date field instead of start_date/end_date
      location,
      organizer_id: null, // Will be null for now, should come from auth
      image_url: null, // Will be null for now, can add image upload later
      registration_url: null, // Will be null for now, can add later
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Creating event:", JSON.stringify(eventData, null, 2));

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert(eventData)
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
      console.error("Error details:", JSON.stringify(eventError, null, 2));
      return NextResponse.json(
        { 
          error: "Failed to create event",
          details: eventError.message,
          code: eventError.code
        },
        { status: 500 }
      );
    }

    console.log("Event created successfully:", JSON.stringify(event, null, 2));

    // Create notifications for relevant users about the new event
    const notificationData = {
      title: `New Event: ${title}`,
      message: `${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`,
      type: 'announcement',
      related_entity_type: 'event',
      related_entity_id: event.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

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

    // Create notifications for all target users
    if (userIds.length > 0) {
      console.log(`Creating ${userIds.length} notifications for event...`);
      const notifications = userIds.map(userId => ({
        id: crypto.randomUUID(),
        user_id: userId,
        ...notificationData,
      }));

      const { data: notificationsData, error: notificationsError } = await supabase
        .from("notifications")
        .insert(notifications)
        .select();

      if (notificationsError) {
        console.error("Error creating event notifications:", notificationsError);
        // Don't fail the request, just log the error
      } else {
        console.log(`Successfully created ${notificationsData?.length || 0} event notifications`);
      }
    }

    await notifySuperAdminsOfAdminAction({
      action: "Published event",
      actorId: user?.id ?? null,
      actorName: (profile?.name as string | undefined) ?? createdBy ?? null,
      actorRole: (profile?.role as string | undefined) ?? "Admin",
      details: `Published "${title}" to ${targetAudience} (${userIds.length} recipients).`,
      relatedEntityType: "event",
      relatedEntityId: event.id,
    });

    return NextResponse.json({
      success: true,
      message: `Event "${title}" published successfully!`,
      eventId: event.id,
      notificationsCreated: userIds.length,
    });

  } catch (error) {
    console.error("Error in publish events API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
