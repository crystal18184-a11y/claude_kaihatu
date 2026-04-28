import { NextRequest } from "next/server";

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BASE64_BYTES = 8 * 1024 * 1024;

export type ValidationError = {
  status: number;
  message: string;
};

export function checkOrigin(req: NextRequest): ValidationError | null {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const source = origin ?? (referer ? new URL(referer).origin : null);

  if (!source) {
    return { status: 403, message: "Forbidden: missing origin" };
  }

  const allowed = new Set<string>();
  const envOrigin = process.env.ALLOWED_ORIGIN;
  if (envOrigin) allowed.add(envOrigin);
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }

  if (!allowed.has(source)) {
    return { status: 403, message: "Forbidden: origin not allowed" };
  }

  return null;
}

export function validateScanInput(body: unknown): ValidationError | null {
  if (!body || typeof body !== "object") {
    return { status: 400, message: "Invalid request body" };
  }

  const { imageBase64, mediaType } = body as { imageBase64?: unknown; mediaType?: unknown };

  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return { status: 400, message: "imageBase64 is required" };
  }

  if (typeof mediaType !== "string") {
    return { status: 400, message: "mediaType is required" };
  }

  if (!ALLOWED_MEDIA_TYPES.includes(mediaType as typeof ALLOWED_MEDIA_TYPES[number])) {
    return { status: 400, message: "Unsupported mediaType" };
  }

  if (imageBase64.length > MAX_BASE64_BYTES) {
    return { status: 413, message: "Image too large" };
  }

  return null;
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
