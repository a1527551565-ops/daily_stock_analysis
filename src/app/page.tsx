import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { FilterBar } from "@/components/filter-bar";
import { FrameMark } from "@/components/frame-mark";
import { LikeButton } from "@/components/like-button";
import { PromptCard } from "@/components/prompt-card";
import { headingFor, readFilters } from "@/lib/filters";
import { excerpt, mediumLabel } from "@/lib/format";
import { listPrompts } from "@/lib/prompts";
import type { Prompt } from "@/lib/types";
import { currentViewer } from "@/lib/viewer";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const filters = readFilters(single(await searchParams));
  return { title: { absolute: `${headingFor(filters)} — 帧词` } };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = readFilters(single(await searchParams));
  const viewer = await currentViewer();
  const prompts = await listPrompts(filters, viewer);
  const bare = !filters.medium && !filters.model && !filters.style && !filters.q && filters.sort === "new";
  const lead = bare
    ? prompts.filter((prompt) => prompt.featured).sort((a, b) => b.likes - a.likes)[0] ?? null
    : null;
  const cards = lead ? prompts.filter((prompt) => prompt.id !== lead.id) : prompts;

  return (
    <>
      {lead ? <Lead prompt={lead} /> : <h1 className="page-title">{headingFor(filters)}</h1>}
      <FilterBar filters={filters} total={prompts.length} />
      {cards.length === 0 ? (
        <p className="empty">没有符合的提示词。换一个模型，或者清空筛选。</p>
      ) : (
        <section className="grid">
          {cards.map((prompt, index) => (
            <PromptCard key={prompt.id} prompt={prompt} index={index} />
          ))}
        </section>
      )}
      {prompts.length === 80 ? <p className="count-line">一次最多显示 80 条。</p> : null}
    </>
  );
}

function Lead({ prompt }: { prompt: Prompt }) {
  return (
    <section className="lead">
      <div>
        <p className="kicker">编辑部样例 · {mediumLabel(prompt.medium)}</p>
        <h1>{prompt.title}</h1>
        <p className="summary">{prompt.summary}</p>
        <div className="meta">
          <span className="chip">{prompt.model}</span>
          <span className="chip">{prompt.style}</span>
          <span className="chip">{prompt.aspect}</span>
        </div>
        <p className="summary" style={{ marginTop: 14, fontSize: 15, color: "var(--mute)" }}>
          {excerpt(prompt.prompt, 160)}
        </p>
        <div className="actions">
          <CopyButton text={prompt.prompt} label="复制提示词" />
          <LikeButton id={prompt.id} liked={prompt.liked} likes={prompt.likes} />
          <a className="btn ghost" href={`/prompts/${prompt.id}`}>
            查看全文
          </a>
        </div>
      </div>
      <a href={`/prompts/${prompt.id}`} aria-label={prompt.title}>
        <FrameMark id={prompt.id} aspect={prompt.aspect} size="lead" />
      </a>
    </section>
  );
}

function single(source: Record<string, string | string[] | undefined>) {
  return {
    medium: first(source.medium),
    model: first(source.model),
    style: first(source.style),
    q: first(source.q),
    sort: first(source.sort),
  };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
