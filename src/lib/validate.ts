import type { Medium, PromptInput } from "./types";

export const IMAGE_MODELS = [
  "Midjourney",
  "Flux",
  "GPT Image",
  "Seedream",
  "Ideogram",
  "Stable Diffusion",
  "Nano Banana",
] as const;

export const VIDEO_MODELS = [
  "Kling",
  "Runway",
  "Luma",
  "Sora",
  "Veo",
  "Hailuo",
  "Pika",
  "Vidu",
] as const;

export const STYLES = [
  "电影感",
  "纪实",
  "插画",
  "产品",
  "人像",
  "建筑",
  "概念艺术",
  "动漫",
  "美食",
  "自然",
] as const;

export const ASPECTS = ["1:1", "3:4", "4:3", "16:9", "9:16", "21:9"] as const;

const ID_RE =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|seed-[a-z0-9-]{1,48})$/i;

export function isPromptId(value: string): boolean {
  return ID_RE.test(value);
}

export function modelsFor(medium: Medium): readonly string[] {
  return medium === "video" ? VIDEO_MODELS : IMAGE_MODELS;
}

export function validatePromptInput(body: unknown): { ok: true; value: PromptInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "投稿内容不完整" };
  }
  const source = body as Record<string, unknown>;
  const medium = source.medium === "video" ? "video" : source.medium === "image" ? "image" : "";
  if (medium === "") return { ok: false, error: "请选择图片或视频" };

  const title = oneLine(source.title, 32);
  if (title.length < 2) return { ok: false, error: "标题需要 2 到 32 个字" };

  const summary = oneLine(source.summary, 80);
  const model = oneLine(source.model, 40);
  if (!modelsFor(medium).includes(model)) return { ok: false, error: "模型不在可选列表里" };

  const style = oneLine(source.style, 20);
  if (!(STYLES as readonly string[]).includes(style)) return { ok: false, error: "请选择一个风格" };

  const aspect = oneLine(source.aspect, 8);
  if (!(ASPECTS as readonly string[]).includes(aspect)) return { ok: false, error: "请选择画幅" };

  const prompt = manyLines(source.prompt, 4000);
  if (prompt.length < 8) return { ok: false, error: "提示词至少 8 个字" };

  const negativePrompt = manyLines(source.negativePrompt, 1500);
  const params = oneLine(source.params, 200);
  const tags = parseTags(source.tags);
  if (tags === null) return { ok: false, error: "每个标签不超过 16 个字，最多 6 个" };

  return {
    ok: true,
    value: { title, summary, medium, model, prompt, negativePrompt, params, style, aspect, tags },
  };
}

export function inputFromForm(formData: FormData): unknown {
  return {
    title: formData.get("title"),
    summary: formData.get("summary"),
    medium: formData.get("medium"),
    model: formData.get("model"),
    prompt: formData.get("prompt"),
    negativePrompt: formData.get("negativePrompt"),
    params: formData.get("params"),
    style: formData.get("style"),
    aspect: formData.get("aspect"),
    tags: formData.get("tags"),
  };
}

function oneLine(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function manyLines(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

function parseTags(value: unknown): string[] | null {
  if (typeof value !== "string" || value.trim() === "") return [];
  const parts = value
    .split(/[,，、]/)
    .map((part) => part.replace(/[\u0000-\u001F\u007F]/g, "").trim())
    .filter(Boolean);
  const unique: string[] = [];
  for (const part of parts) {
    if (part.length > 16) return null;
    if (!unique.includes(part)) unique.push(part);
  }
  if (unique.length > 6) return null;
  return unique;
}
