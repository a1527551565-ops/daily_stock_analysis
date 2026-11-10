import { IMAGE_MODELS, STYLES, VIDEO_MODELS } from "./validate";
import type { PromptFilters } from "./types";

export function readFilters(source: {
  medium?: string;
  model?: string;
  style?: string;
  q?: string;
  sort?: string;
}): PromptFilters {
  const medium = source.medium === "image" || source.medium === "video" ? source.medium : "";
  const models: readonly string[] =
    medium === "video" ? VIDEO_MODELS : medium === "image" ? IMAGE_MODELS : [...IMAGE_MODELS, ...VIDEO_MODELS];
  const model = source.model && models.includes(source.model) ? source.model : "";
  const styles: readonly string[] = STYLES;
  const style = source.style && styles.includes(source.style) ? source.style : "";
  const q = (source.q ?? "").trim().slice(0, 60);
  const sort = source.sort === "likes" ? "likes" : "new";
  return { medium, model, style, q, sort };
}

export function headingFor(filters: PromptFilters): string {
  if (filters.q) return `搜索「${filters.q}」`;
  if (filters.model) return filters.model;
  if (filters.style && filters.medium === "video") return `视频 · ${filters.style}`;
  if (filters.style && filters.medium === "image") return `图片 · ${filters.style}`;
  if (filters.style) return filters.style;
  if (filters.medium === "video") return "视频提示词";
  if (filters.medium === "image") return "图片提示词";
  return "全部提示词";
}
