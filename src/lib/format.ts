export function excerpt(text: string, length: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= length) return flat;
  return flat.slice(0, length).trimEnd() + "…";
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export function mediumLabel(medium: "image" | "video"): string {
  return medium === "video" ? "视频" : "图片";
}
