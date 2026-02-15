/**
 * [INPUT]: plugin-config (ProviderEntry), domain/io (nowIso)
 * [OUTPUT]: publishContent() — provider-agnostic content publishing
 * [POS]: Domain layer for multi-platform content publishing, consumed by publish tool
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import type { ProviderEntry } from "../config";
import { nowIso } from "./io";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PublishSpec {
  asset_id?: string;
  platform: string;
  content: string;
  media_paths?: string[];
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  platform: string;
  published_url?: string;
  published_at: string;
  status: "published" | "scheduled" | "failed";
  error?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resolveApiKey(provider: ProviderEntry): string {
  const envVar = provider.api_key_env ?? "";
  const key = process.env[envVar];
  if (!key) throw new Error(`API key not set: ${envVar}`);
  return key;
}

/* ------------------------------------------------------------------ */
/*  Platform adapters                                                  */
/* ------------------------------------------------------------------ */

async function publishTwitter(spec: PublishSpec, provider: ProviderEntry): Promise<PublishResult> {
  const apiKey = resolveApiKey(provider);

  const body: Record<string, unknown> = { text: spec.content };
  // Media upload would require multi-step OAuth flow — placeholder for media IDs
  if (spec.metadata) Object.assign(body, spec.metadata);

  const res = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    return { platform: "twitter", published_at: nowIso(), status: "failed", error: `${res.status}: ${errText}` };
  }
  const data = (await res.json()) as { data: { id: string } };
  return {
    platform: "twitter",
    published_url: `https://x.com/i/status/${data.data.id}`,
    published_at: nowIso(),
    status: "published",
  };
}

async function publishLinkedin(spec: PublishSpec, provider: ProviderEntry): Promise<PublishResult> {
  const apiKey = resolveApiKey(provider);

  const body = {
    author: (provider.options?.["author_urn"] as string) ?? "",
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: spec.content },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    ...spec.metadata,
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "X-Restli-Protocol-Version": "2.0.0" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    return { platform: "linkedin", published_at: nowIso(), status: "failed", error: `${res.status}: ${errText}` };
  }
  const data = (await res.json()) as { id: string };
  return { platform: "linkedin", published_url: `https://www.linkedin.com/feed/update/${data.id}`, published_at: nowIso(), status: "published" };
}

async function publishGhost(spec: PublishSpec, provider: ProviderEntry): Promise<PublishResult> {
  const apiKey = resolveApiKey(provider);
  const baseUrl = provider.url ?? "";
  if (!baseUrl) return { platform: "ghost", published_at: nowIso(), status: "failed", error: "Ghost URL not configured" };

  const body = {
    posts: [{
      title: (spec.metadata?.["title"] as string) ?? spec.content.slice(0, 60),
      html: spec.content,
      status: "published",
      ...spec.metadata,
    }],
  };

  const res = await fetch(`${baseUrl}/ghost/api/admin/posts/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Ghost ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    return { platform: "ghost", published_at: nowIso(), status: "failed", error: `${res.status}: ${errText}` };
  }
  const data = (await res.json()) as { posts: { url: string }[] };
  return { platform: "ghost", published_url: data.posts[0].url, published_at: nowIso(), status: "published" };
}

async function publishResend(spec: PublishSpec, provider: ProviderEntry): Promise<PublishResult> {
  const apiKey = resolveApiKey(provider);

  const body = {
    from: (provider.options?.["from"] as string) ?? "noreply@example.com",
    to: (spec.metadata?.["to"] as string[]) ?? [],
    subject: (spec.metadata?.["subject"] as string) ?? "New content",
    html: spec.content,
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    return { platform: "resend", published_at: nowIso(), status: "failed", error: `${res.status}: ${errText}` };
  }
  const data = (await res.json()) as { id: string };
  return { platform: "resend", published_url: `resend:${data.id}`, published_at: nowIso(), status: "published" };
}

async function publishBuffer(spec: PublishSpec, provider: ProviderEntry): Promise<PublishResult> {
  const apiKey = resolveApiKey(provider);

  const body = {
    text: spec.content,
    profile_ids: (provider.options?.["profile_ids"] as string[]) ?? [],
    ...spec.metadata,
  };

  const res = await fetch("https://api.bufferapp.com/1/updates/create.json", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    return { platform: "buffer", published_at: nowIso(), status: "failed", error: `${res.status}: ${errText}` };
  }
  return { platform: "buffer", published_at: nowIso(), status: "scheduled" };
}

/* ------------------------------------------------------------------ */
/*  Adapter registry                                                   */
/* ------------------------------------------------------------------ */

const PUBLISH_ADAPTERS: Record<string, (spec: PublishSpec, provider: ProviderEntry) => Promise<PublishResult>> = {
  twitter: publishTwitter,
  linkedin: publishLinkedin,
  ghost: publishGhost,
  resend: publishResend,
  buffer: publishBuffer,
};

export function supportedPlatforms(): string[] {
  return Object.keys(PUBLISH_ADAPTERS);
}

export async function publishContent(
  spec: PublishSpec,
  provider: ProviderEntry,
): Promise<PublishResult> {
  const adapter = PUBLISH_ADAPTERS[spec.platform];
  if (!adapter) {
    return {
      platform: spec.platform,
      published_at: nowIso(),
      status: "failed",
      error: `Unsupported platform: ${spec.platform}. Supported: ${supportedPlatforms().join(", ")}`,
    };
  }
  try {
    return await adapter(spec, provider);
  } catch (err) {
    return {
      platform: spec.platform,
      published_at: nowIso(),
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
