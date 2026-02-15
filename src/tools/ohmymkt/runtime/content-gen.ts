/**
 * [INPUT]: plugin-config (ProviderEntry), domain/io (ensureDir, nowIso)
 * [OUTPUT]: generateImage(), generateVideo() — provider-agnostic content generation
 * [POS]: Domain layer for multi-provider image/video generation, consumed by tools
 * [PROTOCOL]: Update this header when changed, then check CLAUDE.md
 */

import path from "node:path";
import fs from "node:fs";
import { execSync } from "node:child_process";
import type { ProviderEntry } from "../config";
import { ensureDir, nowIso } from "./io";
import { RUNTIME_DIR_NAME } from "./constants";

/* ------------------------------------------------------------------ */
/*  Image generation                                                   */
/* ------------------------------------------------------------------ */

export interface ImageSpec {
  prompt: string;
  style?: "photo" | "illustration" | "graphic" | "3d";
  aspect?: "1:1" | "16:9" | "9:16" | "4:3";
  size?: string;
  negative_prompt?: string;
}

export interface ImageResult {
  url?: string;
  local_path: string;
  provider: string;
  prompt: string;
  created_at: string;
}

function imageOutputDir(projectRoot: string): string {
  return path.join(projectRoot, RUNTIME_DIR_NAME, "assets", "images");
}

async function fetchAndSave(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

/* -- Adapters -- */

async function nanobananaGenerate(spec: ImageSpec, provider: ProviderEntry, outDir: string): Promise<ImageResult> {
  const apiKey = process.env[provider.api_key_env ?? "NANOBANANA_API_KEY"];
  if (!apiKey) throw new Error("NANOBANANA_API_KEY not set");

  const body = {
    prompt: spec.prompt,
    ...(spec.style && { style: spec.style }),
    ...(spec.aspect && { aspect_ratio: spec.aspect }),
    ...(spec.negative_prompt && { negative_prompt: spec.negative_prompt }),
    ...provider.options,
  };

  const res = await fetch("https://api.nanobanana.com/v1/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`nanobanana API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { url: string };

  const filename = `nb-${Date.now()}.png`;
  const localPath = path.join(outDir, filename);
  await fetchAndSave(data.url, localPath);

  return { url: data.url, local_path: localPath, provider: "nanobanana", prompt: spec.prompt, created_at: nowIso() };
}

async function openaiGenerate(spec: ImageSpec, provider: ProviderEntry, outDir: string): Promise<ImageResult> {
  const apiKey = process.env[provider.api_key_env ?? "OPENAI_API_KEY"];
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const body = {
    model: "gpt-image-1",
    prompt: spec.prompt,
    ...(spec.size && { size: spec.size }),
    ...provider.options,
  };

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { data: { url: string }[] };
  const imgUrl = data.data[0].url;

  const filename = `oai-${Date.now()}.png`;
  const localPath = path.join(outDir, filename);
  await fetchAndSave(imgUrl, localPath);

  return { url: imgUrl, local_path: localPath, provider: "openai", prompt: spec.prompt, created_at: nowIso() };
}

async function replicateGenerate(spec: ImageSpec, provider: ProviderEntry, outDir: string): Promise<ImageResult> {
  const apiKey = process.env[provider.api_key_env ?? "REPLICATE_API_TOKEN"];
  if (!apiKey) throw new Error("REPLICATE_API_TOKEN not set");

  const body = {
    input: {
      prompt: spec.prompt,
      ...(spec.aspect && { aspect_ratio: spec.aspect }),
      ...(spec.negative_prompt && { negative_prompt: spec.negative_prompt }),
      ...provider.options,
    },
  };

  const res = await fetch("https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, Prefer: "wait" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Replicate API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { output: string | string[] };
  const imgUrl = Array.isArray(data.output) ? data.output[0] : data.output;

  const filename = `rep-${Date.now()}.png`;
  const localPath = path.join(outDir, filename);
  await fetchAndSave(imgUrl, localPath);

  return { url: imgUrl, local_path: localPath, provider: "replicate", prompt: spec.prompt, created_at: nowIso() };
}

const IMAGE_ADAPTERS: Record<string, typeof nanobananaGenerate> = {
  nanobanana: nanobananaGenerate,
  openai: openaiGenerate,
  replicate: replicateGenerate,
};

export async function generateImage(
  spec: ImageSpec,
  provider: ProviderEntry,
  projectRoot: string,
): Promise<ImageResult> {
  const outDir = imageOutputDir(projectRoot);
  ensureDir(outDir);
  const adapter = IMAGE_ADAPTERS[provider.provider];
  if (!adapter) throw new Error(`Unsupported image provider: ${provider.provider}. Supported: ${Object.keys(IMAGE_ADAPTERS).join(", ")}`);
  return adapter(spec, provider, outDir);
}

/* ------------------------------------------------------------------ */
/*  Video generation                                                   */
/* ------------------------------------------------------------------ */

export interface VideoSpec {
  type: "template" | "ai";
  template_id?: string;
  props?: Record<string, unknown>;
  duration_sec?: number;
  prompt?: string;
  image_url?: string;
  aspect?: string;
  duration?: string;
}

export interface VideoResult {
  url?: string;
  local_path: string;
  provider: string;
  type: "template" | "ai";
  created_at: string;
}

function videoOutputDir(projectRoot: string): string {
  return path.join(projectRoot, RUNTIME_DIR_NAME, "assets", "videos");
}

/* -- Adapters -- */

async function remotionRender(spec: VideoSpec, provider: ProviderEntry, outDir: string): Promise<VideoResult> {
  const projectPath = provider.project_path ?? "./remotion";
  const compositionId = spec.template_id ?? "Main";
  const filename = `remotion-${Date.now()}.mp4`;
  const localPath = path.join(outDir, filename);

  const propsArg = spec.props ? `--props='${JSON.stringify(spec.props)}'` : "";
  const cmd = `npx remotion render ${projectPath} ${compositionId} ${localPath} ${propsArg}`.trim();

  execSync(cmd, { stdio: "pipe", timeout: 300_000 });

  return { local_path: localPath, provider: "remotion", type: "template", created_at: nowIso() };
}

async function klingGenerate(spec: VideoSpec, provider: ProviderEntry, outDir: string): Promise<VideoResult> {
  const apiKey = process.env[provider.api_key_env ?? "KLING_API_KEY"];
  if (!apiKey) throw new Error("KLING_API_KEY not set");

  const body = {
    prompt: spec.prompt ?? "",
    ...(spec.image_url && { image_url: spec.image_url }),
    ...(spec.duration && { duration: spec.duration }),
    ...(spec.aspect && { aspect_ratio: spec.aspect }),
    ...provider.options,
  };

  const res = await fetch("https://api.klingai.com/v1/videos/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Kling API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { data: { url: string } };

  const filename = `kling-${Date.now()}.mp4`;
  const localPath = path.join(outDir, filename);
  await fetchAndSave(data.data.url, localPath);

  return { url: data.data.url, local_path: localPath, provider: "kling", type: "ai", created_at: nowIso() };
}

async function seedanceGenerate(spec: VideoSpec, provider: ProviderEntry, outDir: string): Promise<VideoResult> {
  const apiKey = process.env[provider.api_key_env ?? "SEEDANCE_API_KEY"];
  if (!apiKey) throw new Error("SEEDANCE_API_KEY not set");

  const body = {
    prompt: spec.prompt ?? "",
    ...(spec.image_url && { image_url: spec.image_url }),
    ...(spec.duration && { duration: spec.duration }),
    ...provider.options,
  };

  const res = await fetch("https://api.seedance.ai/v1/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Seedance API error: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { url: string };

  const filename = `seed-${Date.now()}.mp4`;
  const localPath = path.join(outDir, filename);
  await fetchAndSave(data.url, localPath);

  return { url: data.url, local_path: localPath, provider: "seedance", type: "ai", created_at: nowIso() };
}

const VIDEO_ADAPTERS: Record<string, typeof remotionRender> = {
  remotion: remotionRender,
  kling: klingGenerate,
  seedance: seedanceGenerate,
};

export async function generateVideo(
  spec: VideoSpec,
  provider: ProviderEntry,
  projectRoot: string,
): Promise<VideoResult> {
  const outDir = videoOutputDir(projectRoot);
  ensureDir(outDir);

  const adapterName = spec.type === "template" ? "remotion" : provider.provider;
  const adapter = VIDEO_ADAPTERS[adapterName];
  if (!adapter) throw new Error(`Unsupported video provider: ${adapterName}. Supported: ${Object.keys(VIDEO_ADAPTERS).join(", ")}`);
  return adapter(spec, provider, outDir);
}
