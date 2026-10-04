import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Verify Vercel Cron Secret
function isAuthorized(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (process.env.NODE_ENV === "development") return true;
  
  if (!cronSecret) {
    console.error("CRON_SECRET is not defined in environment variables.");
    return false;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Calculate date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const dateLimit = threeMonthsAgo.toISOString();

    // 1. Fetch notices older than 3 months that have a file_url
    const { data: notices, error: fetchError } = await supabase
      .from("notices")
      .select("id, file_url")
      .not("file_url", "is", null)
      .lt("date_iso", dateLimit);

    if (fetchError) {
      throw fetchError;
    }

    if (!notices || notices.length === 0) {
      return NextResponse.json({ message: "No old notices with attachments found." });
    }

    let deletedFilesCount = 0;
    const noticesToUpdate: number[] = [];

    // 2. Loop through and delete from Supabase storage if it's a Supabase URL
    for (const notice of notices) {
      if (notice.file_url) {
        try {
          if (notice.file_url.includes("/storage/v1/object/public/")) {
            const urlObj = new URL(notice.file_url);
            const pathParts = urlObj.pathname.split("/");
            const publicIndex = pathParts.indexOf("public");
            
            if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
              const bucket = pathParts[publicIndex + 1];
              const filePath = pathParts.slice(publicIndex + 2).join("/");
              
              const { error: storageError } = await supabase.storage
                .from(bucket)
                .remove([filePath]);
                
              if (!storageError) {
                deletedFilesCount++;
              } else {
                console.error(`Failed to delete storage file ${filePath}:`, storageError);
              }
            }
          }
          // Mark for database update regardless of whether it was Supabase storage or a base64 string
          noticesToUpdate.push(notice.id);
        } catch (urlError) {
          console.error(`Error parsing URL for notice ${notice.id}:`, urlError);
          // If it's a valid data URL (base64) or invalid URL, we can still remove it from the DB
          if (notice.file_url.startsWith("data:")) {
            noticesToUpdate.push(notice.id);
          }
        }
      }
    }

    // 3. Update the database records to set file_url to null
    if (noticesToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from("notices")
        .update({ file_url: null })
        .in("id", noticesToUpdate);

      if (updateError) {
        throw updateError;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${noticesToUpdate.length} notices and deleted ${deletedFilesCount} files from storage.`,
      cleanedNoticeIds: noticesToUpdate
    });
    
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
