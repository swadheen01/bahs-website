/**
 * Safely downloads any file (Base64 Data URL, Blob URL, or normal HTTPS URL)
 * without opening top-frame data URLs or crashing mobile/desktop Chromium browsers.
 */
export function safeDownloadFile(url: string, suggestedFilename: string = "download") {
  if (!url) return;

  try {
    if (url.startsWith("data:")) {
      // 1. Parse Data URL
      const parts = url.split(",");
      if (parts.length < 2) {
        console.error("Invalid data URL");
        return;
      }

      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";

      // 2. Decode base64 to binary
      const byteCharacters = atob(parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // 3. Create a safe binary Blob
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      // 4. Ensure filename has correct extension
      let filename = suggestedFilename.trim();
      const hasExt = /\.[a-zA-Z0-9]+$/.test(filename);
      if (!hasExt) {
        if (mimeType.includes("pdf")) filename += ".pdf";
        else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) filename += ".jpg";
        else if (mimeType.includes("png")) filename += ".png";
        else if (mimeType.includes("webp")) filename += ".webp";
        else if (mimeType.includes("word") || mimeType.includes("document")) filename += ".docx";
        else filename += ".dat";
      }

      // 5. Trigger download via hidden anchor without navigating top window
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // 6. Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } else {
      // Regular URL (/uploads/... or https://...)
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = suggestedFilename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 1000);
    }
  } catch (err) {
    console.error("Safe download error:", err);
    // Safe fallback: open in popup window if possible
    try {
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      }
    } catch (e) {
      console.error("Window open fallback failed:", e);
    }
  }
}
