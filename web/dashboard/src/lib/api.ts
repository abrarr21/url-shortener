const BASE = "";

export interface ShortenResponse {
  short_code: string;
  long_url: string;
}

export interface StatsResponse {
  short_code: string;
  long_url: string;
  click_count: number;
  trending_score: number;
  created_at: string;
}

export async function shortenUrl(longUrl: string): Promise<ShortenResponse> {
  const res = await fetch(`${BASE}/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ long_url: longUrl }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? "Could not shorten that link.");
  }
  return res.json();
}

export async function getStats(code: string): Promise<StatsResponse> {
  const res = await fetch(`${BASE}/stats/${encodeURIComponent(code)}`);
  if (res.status === 404) {
    throw new Error("No link found for that code.");
  }
  if (!res.ok) {
    throw new Error("Could not load analytics for that link.");
  }
  return res.json();
}

// Accepts either a bare code ("QOFXcCLMy8") or a full short link
// ("http://localhost/QOFXcCLMy8") and returns just the code.
export function extractCode(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || trimmed;
  } catch {
    return trimmed;
  }
}
