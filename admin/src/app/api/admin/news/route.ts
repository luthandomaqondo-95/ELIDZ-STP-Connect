import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthedProfile } from "@/lib/authz";
import { notifySuperAdminsOfAdminAction } from "@/lib/admin/super-admin-alerts";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { buildNewsImagePath, isAllowedNewsImageType, NEWS_IMAGE_BUCKET, NEWS_IMAGE_MAX_BYTES } from "@/lib/news";

// Create a unique hash for deduplication
function createNewsHash(title: string, content: string, targetAudience: string): string {
  const hashContent = `${title}-${content.substring(0, 200)}-${targetAudience}`;
  return createHash('sha256').update(hashContent).digest('hex').substring(0, 16);
}

// In-memory store for recent news (in production, use Redis or database)
const recentNews = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    console.log("Starting news API call...");
    const { user, profile } = await getAuthedProfile();
    
    let title: string;
    let content: string;
    let excerpt: string;
    let category: string;
    let tags: any[];
    let featuredImage: string | null = null;
    let targetAudience: string;
    let publishedAt: string | null = null;
    let createdBy: string;
    let imageFile: File | null = null;

    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("multipart/form-data")) {
      // Handle multipart form data (file upload)
      const formData = await request.formData();
      title = String(formData.get("title") ?? "");
      content = String(formData.get("content") ?? "");
      excerpt = String(formData.get("excerpt") ?? "");
      category = "general";
      tags = [];
      targetAudience = String(formData.get("target_audience") ?? "all");
      publishedAt = String(formData.get("published_at") ?? "") || null;
      createdBy = "admin";
      imageFile = formData.get("image_file") as File | null;
      
      // Handle file upload
      if (imageFile && imageFile.size > 0) {
        console.log("Processing file upload:", imageFile.name, imageFile.size);
        
        // Validate file
        if (imageFile.size > NEWS_IMAGE_MAX_BYTES) {
          return NextResponse.json(
            { error: "File too large. Maximum size is 5MB." },
            { status: 400 }
          );
        }
        
        if (!isAllowedNewsImageType(imageFile.type)) {
          return NextResponse.json(
            { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed." },
            { status: 400 }
          );
        }
        
        // Upload to Supabase storage
        const supabase = createAdminClient();
        const fileName = buildNewsImagePath("anonymous", imageFile.name, imageFile.type);
        
        console.log("Uploading file to:", fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(NEWS_IMAGE_BUCKET)
          .upload(fileName, imageFile, {
            contentType: imageFile.type,
            upsert: true
          });
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          return NextResponse.json(
            { error: "Failed to upload image", details: uploadError.message },
            { status: 500 }
          );
        }
        
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(NEWS_IMAGE_BUCKET)
          .getPublicUrl(fileName);
        
        featuredImage = publicUrlData.publicUrl;
        console.log("File uploaded successfully:", featuredImage);
      }
    } else {
      // Handle JSON data (image URL)
      const jsonData = await request.json();
      title = jsonData.title;
      content = jsonData.content;
      excerpt = jsonData.excerpt || "";
      category = jsonData.category || "general";
      tags = jsonData.tags || [];
      featuredImage = jsonData.featuredImage || null;
      targetAudience = jsonData.targetAudience;
      publishedAt = jsonData.publishedAt;
      createdBy = jsonData.createdBy;
    }
    
    console.log("Received data:", { 
      title, 
      excerpt, 
      category, 
      tags, 
      featuredImage,
      targetAudience, 
      publishedAt,
      createdBy 
    });

    if (!title || !content || !targetAudience) {
      console.log("Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: title, content, targetAudience" },
        { status: 400 }
      );
    }

    // Create hash for deduplication
    const newsHash = createNewsHash(title, content, targetAudience);
    const now = Date.now();
    
    // Check if this news was recently processed (within 30 seconds)
    if (recentNews.has(newsHash)) {
      const lastSent = recentNews.get(newsHash)!;
      if (now - lastSent < 30000) { // 30 seconds
        console.log("Duplicate news detected via hash, skipping");
        return NextResponse.json({
          success: true,
          message: "News already published recently (duplicate prevention)",
          newsId: null,
          duplicate: true
        });
      }
    }

    // Update the timestamp for this news hash
    recentNews.set(newsHash, now);
    
    // Clean old entries (older than 5 minutes)
    for (const [hash, timestamp] of recentNews.entries()) {
      if (now - timestamp > 300000) { // 5 minutes
        recentNews.delete(hash);
      }
    }

    const supabase = createAdminClient();
    console.log("Supabase client created");

    // Create the news article
    const newsData = {
      id: crypto.randomUUID(),
      title,
      content,
      image_url: featuredImage || null,
      published_at: publishedAt || new Date().toISOString(),
      author_id: null, // Will be null for now, should come from auth context
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Creating news article:", JSON.stringify(newsData, null, 2));

    const { data: news, error: newsError } = await supabase
      .from("news")
      .insert(newsData)
      .select()
      .single();

    if (newsError) {
      console.error("Error creating news:", newsError);
      console.error("Error details:", JSON.stringify(newsError, null, 2));
      return NextResponse.json(
        { 
          error: "Failed to create news article",
          details: newsError.message,
          code: newsError.code
        },
        { status: 500 }
      );
    }

    console.log("News article created successfully:", JSON.stringify(news, null, 2));

    // Create notifications for relevant users about the new news
    const notificationData = {
      title: `Latest News: ${title}`,
      message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      type: 'announcement',
      related_entity_type: 'news',
      related_entity_id: news.id,
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
      console.log(`Creating ${userIds.length} notifications for news...`);
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
        console.error("Error creating news notifications:", notificationsError);
        // Don't fail the request, just log the error
      } else {
        console.log(`Successfully created ${notificationsData?.length || 0} news notifications`);
      }
    }

    await notifySuperAdminsOfAdminAction({
      action: "Published news",
      actorId: user?.id ?? null,
      actorName: (profile?.name as string | undefined) ?? createdBy ?? null,
      actorRole: (profile?.role as string | undefined) ?? "Admin",
      details: `Published "${title}" to ${targetAudience} (${userIds.length} recipients).`,
      relatedEntityType: "news",
      relatedEntityId: news.id,
    });

    return NextResponse.json({
      success: true,
      message: `News article "${title}" published successfully!`,
      newsId: news.id,
      notificationsCreated: userIds.length,
    });

  } catch (error) {
    console.error("Error in publish news API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
