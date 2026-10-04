import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function mergeCookies(existing: string, newSetCookies: string[]): string {
  const map = new Map<string, string>();
  if (existing) {
    existing.split(";").forEach((part) => {
      const trimmed = part.trim();
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        const val = trimmed.substring(eqIdx + 1).trim();
        if (!["path", "expires", "max-age", "samesite", "domain"].includes(key.toLowerCase())) {
          map.set(key, val);
        }
      }
    });
  }
  newSetCookies.forEach((header) => {
    if (!header) return;
    const firstPart = header.split(";")[0]?.trim();
    if (firstPart) {
      const eqIdx = firstPart.indexOf("=");
      if (eqIdx > 0) {
        const key = firstPart.substring(0, eqIdx).trim();
        const val = firstPart.substring(eqIdx + 1).trim();
        map.set(key, val);
      }
    }
  });
  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

// Solve bpanel challenge to establish a verified session with eboardresults
async function createVerifiedSession(): Promise<string> {
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  const res1 = await fetch("https://eboardresults.com/v2/home", {
    headers: { "User-Agent": userAgent },
    cache: "no-store",
  });

  const html = await res1.text();
  const setCookie = res1.headers.get("set-cookie") || "";
  const match = html.match(/var challenge = ({.*?});/);
  if (!match) {
    throw new Error("Challenge signature not found");
  }

  const challenge = JSON.parse(match[1]);
  const data = "browser-proof:" + challenge.seed + ":" + challenge.salt;
  const hashHex = crypto.createHash("sha256").update(data).digest("hex");
  const answer = "hash:" + hashHex;

  const rawCookies = res1.headers.getSetCookie ? res1.headers.getSetCookie() : [setCookie];
  const initialCookies = rawCookies.filter(Boolean).join("; ");

  const res2 = await fetch("https://eboardresults.com/_challenge-verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: initialCookies,
      "User-Agent": userAgent,
    },
    body: JSON.stringify({ token: challenge.token, answer }),
    cache: "no-store",
  });

  const verifyCookies = res2.headers.getSetCookie ? res2.headers.getSetCookie() : [res2.headers.get("set-cookie") || ""];
  const sessionCookie = mergeCookies("", verifyCookies);
  if (!sessionCookie) {
    throw new Error("Failed to receive verified session");
  }

  return sessionCookie;
}

// GET: Generate session and fetch authentic captcha image
export async function GET(req: NextRequest) {
  try {
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    let sessionCookie = await createVerifiedSession();

    // Visit home page to establish base PHP session
    const homeRes = await fetch("https://eboardresults.com/v2/home", {
      headers: {
        Cookie: sessionCookie,
        "User-Agent": userAgent,
      },
      cache: "no-store",
    });
    const homeCookies = homeRes.headers.getSetCookie ? homeRes.headers.getSetCookie() : [homeRes.headers.get("set-cookie") || ""];
    sessionCookie = mergeCookies(sessionCookie, homeCookies);

    // Fetch captcha image with verified session and save EBRSESSID2
    const captchaRes = await fetch("https://eboardresults.com/v2/captcha?t=" + Date.now(), {
      headers: {
        Cookie: sessionCookie,
        "User-Agent": userAgent,
        Referer: "https://eboardresults.com/v2/home",
      },
      cache: "no-store",
    });

    if (!captchaRes.ok) {
      return NextResponse.json(
        { success: false, message: "ক্যাপচা লোড করা যায়নি, আবার চেষ্টা করুন" },
        { status: 502 }
      );
    }

    const captchaCookies = captchaRes.headers.getSetCookie
      ? captchaRes.headers.getSetCookie()
      : [captchaRes.headers.get("set-cookie") || ""];
    sessionCookie = mergeCookies(sessionCookie, captchaCookies);

    const buf = await captchaRes.arrayBuffer();
    const base64Image = `data:image/jpeg;base64,${Buffer.from(buf).toString("base64")}`;
    const sessionToken = Buffer.from(sessionCookie).toString("base64");

    return NextResponse.json({
      success: true,
      captcha: base64Image,
      sessionToken,
    });
  } catch (error: any) {
    console.error("Board captcha error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "বোর্ড সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      },
      { status: 500 }
    );
  }
}

// POST: Submit board result inquiry to official server
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionToken, exam, year, board, roll, reg, captcha } = body;

    if (!sessionToken || !captcha || !roll) {
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json(
        { success: false, message: "অনুগ্রহ করে রোল ও সিকিউরিটি ক্যাপচা কোড প্রদান করুন।" },
        { status: 400 }
      );
    }

    let sessionCookie = "";
    try {
      sessionCookie = Buffer.from(sessionToken, "base64").toString("utf-8");
    } catch {
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json(
        { success: false, message: "অধিবেশনের মেয়াদ শেষ হয়ে গেছে। ক্যাপচা রিফ্রেশ করে আবার চেষ্টা করুন।" },
        { status: 400 }
      );
    }

    const formParams = new URLSearchParams({
      board: board || "sylhet",
      exam: exam || "ssc",
      year: year || "2024",
      result_type: "1",
      roll: String(roll).trim(),
      reg: reg ? String(reg).trim() : "",
      captcha: String(captcha).trim(),
    });

    const res = await fetch("https://eboardresults.com/v2/getres", {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
        Origin: "https://eboardresults.com",
        Referer: "https://eboardresults.com/v2/home",
      },
      body: formParams.toString(),
      cache: "no-store",
    });

    const data = await res.json();

    if (data.status === 0 && data.res) {
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({
        success: true,
        result: data.res,
        showMarks: data.showmarks || 0,
      });
    } else {
      let errorMsg = data.msg || "ফলাফল পাওয়া যায়নি। রোল ও রেজিস্ট্রেশন যাচাই করুন।";
      if (errorMsg.includes("Security Key") || errorMsg.includes("CAPTCHA")) {
        errorMsg = "সিকিউরিটি ক্যাপচা কোড সঠিক হয়নি। অনুগ্রহ করে নতুন ক্যাপচা পূরণ করুন।";
      } else if (errorMsg.includes("not found") || errorMsg.includes("No Result")) {
        errorMsg = "প্রদত্ত তথ্যের জন্য কোনো ফলাফল পাওয়া যায়নি। রোল ও সন রিচেক করুন।";
      }
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({
        success: false,
        message: errorMsg,
      });
    }
  } catch (error: any) {
    console.error("Board result submit error:", error.message);
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json(
      {
        success: false,
        message: "বোর্ড সার্ভার থেকে ফলাফল আনতে ত্রুটি হয়েছে। অনুগ্রহ করে সরাসরি সরকারি পোর্টালে চেষ্টা করুন।",
      },
      { status: 500 }
    );
  }
}
