import Link from "next/link";
import { IMAGE_MODELS, STYLES, VIDEO_MODELS } from "@/lib/validate";
import type { PromptFilters } from "@/lib/types";

export function FilterBar({ filters, total }: { filters: PromptFilters; total: number }) {
  const models = filters.medium === "video" ? VIDEO_MODELS : filters.medium === "image" ? IMAGE_MODELS : [...IMAGE_MODELS, ...VIDEO_MODELS];

  return (
    <div className="filters">
      <div className="filter-row">
        <span className="filter-label">媒介</span>
        <FilterLink filters={filters} patch={{ medium: "", model: "" }} on={!filters.medium}>
          全部
        </FilterLink>
        <FilterLink filters={filters} patch={{ medium: "image", model: filters.medium === "image" ? filters.model : "" }} on={filters.medium === "image"}>
          图片
        </FilterLink>
        <FilterLink filters={filters} patch={{ medium: "video", model: filters.medium === "video" ? filters.model : "" }} on={filters.medium === "video"}>
          视频
        </FilterLink>
        <form className="search" action="/" method="get">
          {filters.medium ? <input type="hidden" name="medium" value={filters.medium} /> : null}
          {filters.model ? <input type="hidden" name="model" value={filters.model} /> : null}
          {filters.style ? <input type="hidden" name="style" value={filters.style} /> : null}
          {filters.sort === "likes" ? <input type="hidden" name="sort" value="likes" /> : null}
          <input name="q" defaultValue={filters.q} placeholder="搜索标题、提示词、标签" aria-label="搜索" maxLength={60} />
          <button className="btn ghost" type="submit">
            搜索
          </button>
        </form>
      </div>
      <div className="filter-row scroll-row">
        <span className="filter-label">模型</span>
        <FilterLink filters={filters} patch={{ model: "" }} on={!filters.model}>
          全部
        </FilterLink>
        {models.map((model) => (
          <FilterLink key={model} filters={filters} patch={{ model }} on={filters.model === model}>
            {model}
          </FilterLink>
        ))}
      </div>
      <div className="filter-row">
        <span className="filter-label">风格</span>
        <FilterLink filters={filters} patch={{ style: "" }} on={!filters.style}>
          全部
        </FilterLink>
        {STYLES.map((style) => (
          <FilterLink key={style} filters={filters} patch={{ style }} on={filters.style === style}>
            {style}
          </FilterLink>
        ))}
      </div>
      <div className="filter-row">
        <span className="filter-label">排序</span>
        <FilterLink filters={filters} patch={{ sort: "new" }} on={filters.sort !== "likes"}>
          最新
        </FilterLink>
        <FilterLink filters={filters} patch={{ sort: "likes" }} on={filters.sort === "likes"}>
          最多收藏
        </FilterLink>
        <span className="count-line">{total} 条</span>
        {filters.medium || filters.model || filters.style || filters.q || filters.sort === "likes" ? (
          <Link className="chip" href="/">
            清空
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function FilterLink({
  filters,
  patch,
  on,
  children,
}: {
  filters: PromptFilters;
  patch: Partial<PromptFilters>;
  on: boolean;
  children: string;
}) {
  return (
    <Link className="chip" href={filterHref({ ...filters, ...patch })} data-on={on ? "true" : "false"}>
      {children}
    </Link>
  );
}

function filterHref(filters: PromptFilters): string {
  const params = new URLSearchParams();
  if (filters.medium) params.set("medium", filters.medium);
  if (filters.model) params.set("model", filters.model);
  if (filters.style) params.set("style", filters.style);
  if (filters.q) params.set("q", filters.q);
  if (filters.sort === "likes") params.set("sort", "likes");
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
