import { sql } from "./db";
import { SEEDS } from "./seed";
import { isPromptId } from "./validate";
import type { Channel, Prompt, PromptFilters, PromptInput, Viewer } from "./types";

type PromptRow = {
  id: string;
  title: string;
  summary: string;
  medium: "image" | "video";
  model: string;
  prompt: string;
  negative_prompt: string;
  params: string;
  style: string;
  aspect: string;
  tags: string;
  author_name: string;
  likes: number | string;
  featured: boolean | string | number;
  created_at: Date | string;
  liked: boolean | string | number;
  mine: boolean | string | number;
};

const SELECT = `
  select
    p.id, p.title, p.summary, p.medium, p.model, p.prompt, p.negative_prompt,
    p.params, p.style, p.aspect, p.tags, p.author_name, p.likes, p.featured, p.created_at,
    (p.author_sub = $1) as mine,
    exists (
      select 1 from prompt_likes l
      where l.prompt_id = p.id and l.channel = p.channel and l.viewer_sub = $1
    ) as liked
  from prompts p
`;

type ReadyStore = { ready?: Promise<void> };
const readyStore: ReadyStore = ((globalThis as { __frameReady?: ReadyStore }).__frameReady ??= {});

function ready(): Promise<void> {
  readyStore.ready ??= seedIfNeeded().catch((error: unknown) => {
    readyStore.ready = undefined;
    throw error;
  });
  return readyStore.ready;
}

async function seedIfNeeded(): Promise<void> {
  const existing = await sql<{ value: string }>("select value from app_meta where key = $1", ["seeded"]);
  if (existing.length > 0) return;
  for (const channel of ["production", "preview"] as const) {
    for (const item of SEEDS) {
      await sql(
        `insert into prompts (
          id, channel, title, summary, medium, model, prompt, negative_prompt, params, style, aspect, tags,
          author_sub, author_name, likes, featured, created_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'seed', '帧词编辑部', $13, $14, $15
        ) on conflict (id, channel) do nothing`,
        [
          item.id,
          channel,
          item.title,
          item.summary,
          item.medium,
          item.model,
          item.prompt,
          item.negativePrompt,
          item.params,
          item.style,
          item.aspect,
          item.tags,
          item.likes,
          item.featured,
          item.createdAt,
        ],
      );
    }
  }
  await sql(
    "insert into app_meta (key, value) values ($1, $2) on conflict (key) do nothing",
    ["seeded", "1"],
  );
}

export async function listPrompts(filters: PromptFilters, viewer: Viewer | null): Promise<Prompt[]> {
  await ready();
  const channel = viewer?.channel ?? "production";
  const sub = viewer?.sub ?? "";
  const params: unknown[] = [sub, channel];
  const where = ["p.channel = $2"];
  if (filters.medium) {
    params.push(filters.medium);
    where.push(`p.medium = $${params.length}`);
  }
  if (filters.model) {
    params.push(filters.model);
    where.push(`p.model = $${params.length}`);
  }
  if (filters.style) {
    params.push(filters.style);
    where.push(`p.style = $${params.length}`);
  }
  if (filters.q) {
    params.push(likePattern(filters.q));
    const mark = `$${params.length}`;
    where.push(
      `(p.title ilike ${mark} escape '\\' or p.summary ilike ${mark} escape '\\' or p.prompt ilike ${mark} escape '\\' or p.tags ilike ${mark} escape '\\' or p.model ilike ${mark} escape '\\')`,
    );
  }
  const order = filters.sort === "likes" ? "p.likes desc, p.created_at desc" : "p.created_at desc";
  const rows = await sql<PromptRow>(
    `${SELECT} where ${where.join(" and ")} order by ${order} limit 80`,
    params,
  );
  return rows.map(mapPrompt);
}

export async function getPrompt(id: string, viewer: Viewer | null): Promise<Prompt | null> {
  if (!isPromptId(id)) return null;
  await ready();
  const rows = await sql<PromptRow>(`${SELECT} where p.id = $2 and p.channel = $3`, [
    viewer?.sub ?? "",
    id,
    viewer?.channel ?? "production",
  ]);
  return rows[0] ? mapPrompt(rows[0]) : null;
}

export async function relatedPrompts(prompt: Prompt, viewer: Viewer | null): Promise<Prompt[]> {
  await ready();
  const rows = await sql<PromptRow>(
    `${SELECT} where p.channel = $2 and p.id <> $3 and p.medium = $4 and (p.model = $5 or p.style = $6) order by p.likes desc, p.created_at desc limit 3`,
    [viewer?.sub ?? "", viewer?.channel ?? "production", prompt.id, prompt.medium, prompt.model, prompt.style],
  );
  return rows.map(mapPrompt);
}

export async function listMine(viewer: Viewer): Promise<{ written: Prompt[]; saved: Prompt[] }> {
  await ready();
  const written = await sql<PromptRow>(
    `${SELECT} where p.channel = $2 and p.author_sub = $1 order by p.created_at desc limit 80`,
    [viewer.sub, viewer.channel],
  );
  const saved = await sql<PromptRow>(
    `${SELECT}
     join prompt_likes mine_like on mine_like.prompt_id = p.id and mine_like.channel = p.channel and mine_like.viewer_sub = $1
     where p.channel = $2 and p.author_sub <> $1
     order by mine_like.created_at desc
     limit 80`,
    [viewer.sub, viewer.channel],
  );
  return { written: written.map(mapPrompt), saved: saved.map(mapPrompt) };
}

export async function createPrompt(input: PromptInput, viewer: Viewer): Promise<string> {
  await ready();
  const id = crypto.randomUUID();
  await sql(
    `insert into prompts (
      id, channel, title, summary, medium, model, prompt, negative_prompt, params, style, aspect, tags,
      author_sub, author_name, likes, featured
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,0,false)`,
    [
      id,
      viewer.channel,
      input.title,
      input.summary,
      input.medium,
      input.model,
      input.prompt,
      input.negativePrompt,
      input.params,
      input.style,
      input.aspect,
      input.tags.join(","),
      viewer.sub,
      viewer.name,
    ],
  );
  return id;
}

export async function toggleLike(
  id: string,
  viewer: Viewer,
): Promise<{ likes: number; liked: boolean } | null> {
  if (!isPromptId(id)) return null;
  await ready();
  const found = await sql<{ id: string }>("select id from prompts where id = $1 and channel = $2", [
    id,
    viewer.channel,
  ]);
  if (found.length === 0) return null;

  const removed = await sql<{ prompt_id: string }>(
    "delete from prompt_likes where prompt_id = $1 and channel = $2 and viewer_sub = $3 returning prompt_id",
    [id, viewer.channel, viewer.sub],
  );
  if (removed.length > 0) {
    const rows = await sql<{ likes: number | string }>(
      "update prompts set likes = greatest(likes - 1, 0) where id = $1 and channel = $2 returning likes",
      [id, viewer.channel],
    );
    return { liked: false, likes: Number(rows[0]?.likes ?? 0) };
  }

  const inserted = await sql<{ prompt_id: string }>(
    "insert into prompt_likes (prompt_id, channel, viewer_sub) values ($1, $2, $3) on conflict do nothing returning prompt_id",
    [id, viewer.channel, viewer.sub],
  );
  if (inserted.length > 0) {
    const rows = await sql<{ likes: number | string }>(
      "update prompts set likes = likes + 1 where id = $1 and channel = $2 returning likes",
      [id, viewer.channel],
    );
    return { liked: true, likes: Number(rows[0]?.likes ?? 0) };
  }

  const current = await sql<{ likes: number | string }>(
    "select likes from prompts where id = $1 and channel = $2",
    [id, viewer.channel],
  );
  return { liked: true, likes: Number(current[0]?.likes ?? 0) };
}

export async function deleteOwnPrompt(id: string, viewer: Viewer): Promise<boolean> {
  if (!isPromptId(id)) return false;
  await ready();
  const rows = await sql<{ id: string }>(
    "delete from prompts where id = $1 and channel = $2 and author_sub = $3 returning id",
    [id, viewer.channel, viewer.sub],
  );
  return rows.length > 0;
}

function mapPrompt(row: PromptRow): Prompt {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    medium: row.medium,
    model: row.model,
    prompt: row.prompt,
    negativePrompt: row.negative_prompt,
    params: row.params,
    style: row.style,
    aspect: row.aspect,
    tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
    authorName: row.author_name,
    likes: Number(row.likes),
    featured: asBool(row.featured),
    createdAt: asIso(row.created_at),
    liked: asBool(row.liked),
    mine: asBool(row.mine),
  };
}

function asBool(value: boolean | string | number): boolean {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

function asIso(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export type { Channel };
