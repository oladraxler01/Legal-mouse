"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client with service role key to bypass RLS
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase credentials for admin service role.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// -------------------------------------------------------------
// 1. Admin Authentication Actions
// -------------------------------------------------------------

export async function loginAdminAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const password = (formData.get("password") as string)?.trim();
    const masterPassphrase = process.env.ADMIN_MASTER_PASSPHRASE || "LegalMouseTeam2026";

    if (!password) {
      return { success: false, error: "Please enter the admin master passphrase." };
    }

    if (password !== masterPassphrase) {
      return { success: false, error: "Incorrect passphrase. Access denied." };
    }

    // Set secure long-lived HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Authentication failed." };
  }
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

// -------------------------------------------------------------
// 2. Universal Upload Pipeline Server Action
// -------------------------------------------------------------

export type DocumentCategory = "Templates" | "Authorities" | "Video Vault";

export interface UploadActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export async function universalUploadAction(formData: FormData): Promise<UploadActionResult> {
  try {
    // Verify admin session cookie
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;
    if (!adminSession) {
      return { success: false, error: "Unauthorized. Please log in as admin." };
    }

    const supabase = getAdminSupabase();

    const category = formData.get("category") as DocumentCategory;
    const title = (formData.get("title") as string)?.trim();
    const isExternalLink = formData.get("is_external_link") === "true";
    const externalUrl = (formData.get("external_url") as string)?.trim();
    const file = formData.get("file") as File | null;

    if (!title) {
      return { success: false, error: "Title is required." };
    }

    // Resolve resource URL (either file upload or external link)
    let resourceUrl = "";

    if (isExternalLink) {
      if (!externalUrl) {
        return { success: false, error: "Please provide an external URL." };
      }
      resourceUrl = externalUrl;
    } else {
      if (!file || file.size === 0) {
        return { success: false, error: "Please select a file to upload or provide an external link." };
      }

      // Upload file to Supabase 'contributions' storage bucket
      const fileExt = file.name.substring(file.name.lastIndexOf("."));
      const sanitizedName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const storagePath = `admin/${category.toLowerCase().replace(/\s+/g, "_")}/${Date.now()}_${sanitizedName}${fileExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("contributions")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (uploadError) {
        return { success: false, error: `Storage upload failed: ${uploadError.message}` };
      }

      const { data: publicUrlData } = supabase.storage
        .from("contributions")
        .getPublicUrl(uploadData.path);

      resourceUrl = publicUrlData.publicUrl;
    }

    // Dynamic routing logic based on Document Category
    if (category === "Templates") {
      const summary = (formData.get("summary") as string)?.trim() || "";
      const coreContent = (formData.get("core_content") as string)?.trim() || "";
      const courseTag = (formData.get("course_tag") as string)?.trim() || "General";
      const customSlug = (formData.get("slug") as string)?.trim();
      const slug = customSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const { data, error } = await supabase.from("notes").insert({
        title,
        file_url: resourceUrl,
        slug,
        summary,
        core_content: coreContent,
        course_tag: courseTag,
      }).select().single();

      if (error) {
        return { success: false, error: `Failed to insert template: ${error.message}` };
      }

      return {
        success: true,
        message: `Template "${title}" published successfully!`,
        data,
      };
    } else if (category === "Authorities") {
      const authorityType = (formData.get("authority_type") as string) || "Statutes";
      const subType = (formData.get("sub_type") as string)?.trim() || null;

      // Map sub-dropdown to authorities table `type`
      let dbType = "Statute";
      if (authorityType === "Cases") {
        dbType = "Case";
      } else if (authorityType === "Black's Law Dictionary") {
        dbType = "Dictionary";
      } else {
        // For Statutes, use specific law type if selected (e.g. CONSTITUTIONAL LAW) or "Statute"
        dbType = subType || "Statute";
      }

      const { data, error } = await supabase.from("authorities").insert({
        title,
        file_url: resourceUrl,
        type: dbType,
        sub_type: subType,
      }).select().single();

      if (error) {
        return { success: false, error: `Failed to insert authority: ${error.message}` };
      }

      return {
        success: true,
        message: `Authority "${title}" (${dbType}) published successfully!`,
        data,
      };
    } else if (category === "Video Vault") {
      const duration = (formData.get("duration") as string)?.trim() || "N/A";
      const tag = (formData.get("tag") as string)?.trim() || "General";
      const thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim() || null;

      // Extract YouTube ID if applicable
      let youtubeId: string | null = null;
      if (resourceUrl.includes("youtube.com") || resourceUrl.includes("youtu.be")) {
        const match = resourceUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (match) {
          youtubeId = match[1];
        }
      }

      const { data, error } = await supabase.from("videos").insert({
        title,
        video_url: resourceUrl,
        duration,
        thumbnail_url: thumbnailUrl || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null),
        tag,
      }).select().single();

      if (error) {
        // Fallback: If table 'videos' isn't created yet, record into authorities with video_url or notify
        return { success: false, error: `Failed to insert video: ${error.message}. Please ensure the 'videos' table is created in Supabase.` };
      }

      return {
        success: true,
        message: `Video "${title}" published to Video Vault successfully!`,
        data,
      };
    }

    return { success: false, error: "Invalid document category selected." };
  } catch (err: any) {
    console.error("universalUploadAction error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during upload." };
  }
}

// -------------------------------------------------------------
// 3. Announcements Server Actions
// -------------------------------------------------------------

export async function postAnnouncementAction(formData: FormData): Promise<UploadActionResult> {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session")?.value;
    if (!adminSession) {
      return { success: false, error: "Unauthorized. Please log in as admin." };
    }

    const title = (formData.get("title") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();
    const isActive = formData.get("is_active") === "on" || formData.get("is_active") === "true";

    if (!title || !message) {
      return { success: false, error: "Both title and message are required." };
    }

    const supabase = getAdminSupabase();

    const { data, error } = await supabase.from("announcements").insert({
      title,
      message,
      is_active: isActive,
    }).select().single();

    if (error) {
      return { success: false, error: `Failed to post announcement: ${error.message}. Please ensure the 'announcements' table is created.` };
    }

    return {
      success: true,
      message: "Announcement posted successfully!",
      data,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to post announcement." };
  }
}

export async function getAnnouncementsAction() {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

