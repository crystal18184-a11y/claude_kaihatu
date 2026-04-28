type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

const SHORT_WINDOW_MS = 10 * 1000;
const SHORT_WINDOW_MAX = 1;
const LONG_WINDOW_MS = 60 * 1000;
const LONG_WINDOW_MAX = 5;

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets.entries()) {
    const recent = bucket.timestamps.filter((t) => now - t < LONG_WINDOW_MS);
    if (recent.length === 0) buckets.delete(key);
    else bucket.timestamps = recent;
  }
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSec: number;
};

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const bucket = buckets.get(key) ?? { timestamps: [] };
  const recent = bucket.timestamps.filter((t) => now - t < LONG_WINDOW_MS);

  const inShortWindow = recent.filter((t) => now - t < SHORT_WINDOW_MS);
  if (inShortWindow.length >= SHORT_WINDOW_MAX) {
    const oldest = Math.min(...inShortWindow);
    const retryAfterSec = Math.ceil((SHORT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  if (recent.length >= LONG_WINDOW_MAX) {
    const oldest = Math.min(...recent);
    const retryAfterSec = Math.ceil((LONG_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  buckets.set(key, { timestamps: recent });
  return { allowed: true, retryAfterSec: 0 };
}
