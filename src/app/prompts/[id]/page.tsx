import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { DeleteButton } from "@/components/delete-button";
import { PromptMedia } from "@/components/prompt-media";
import { LikeButton } from "@/components/like-button";
import { PromptCard } from "@/components/prompt-card";
import { formatDate, mediumLabel } from "@/lib/format";
import { getPrompt, relatedPrompts } from "@/lib/prompts";
import { currentViewer } from "@/lib/viewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const prompt = await getPrompt(id, await currentViewer());
  if (!prompt) return { title: "没有这条提示词" };
  return { title: prompt.title };
}

export default async function PromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await currentViewer();
  const prompt = await getPrompt(id, viewer);
  if (!prompt) notFound();
  const related = await relatedPrompts(prompt, viewer);

  return (
    <>
      <article className="detail">
        <div>
          <PromptMedia
            id={prompt.id}
            title={prompt.title}
            aspect={prompt.aspect}
            coverUrl={prompt.coverUrl}
            mediaUrl={prompt.mediaUrl}
            size="lead"
            playable
          />
          <p className="byline">
            {prompt.authorName} · {formatDate(prompt.createdAt)}
            {prompt.coverUrl ? " · 示例成片" : ""}
          </p>
        </div>
        <div>
          <p className="kicker">
            {mediumLabel(prompt.medium)} · {prompt.model}
          </p>
          <h1>{prompt.title}</h1>
          {prompt.summary ? <p className="summary">{prompt.summary}</p> : null}
          <div className="meta">
            <span className="chip">{prompt.style}</span>
            <span className="chip">{prompt.aspect}</span>
            {prompt.params ? <span className="chip">{prompt.params}</span> : null}
          </div>
          <div className="prompt-head">
            <p className="section-label">提示词</p>
            <CopyButton text={prompt.prompt} label="复制提示词" />
          </div>
          <pre className="prompt-block">{prompt.prompt}</pre>
          {prompt.negativePrompt ? (
            <>
              <div className="prompt-head">
                <p className="section-label">负面词</p>
                <CopyButton text={prompt.negativePrompt} label="复制负面词" ghost />
              </div>
              <pre className="prompt-block">{prompt.negativePrompt}</pre>
            </>
          ) : null}
          {prompt.tags.length > 0 ? (
            <>
              <p className="section-label">标签</p>
              <div className="tag-row">
                {prompt.tags.map((tag) => (
                  <Link key={tag} className="tag" href={`/?q=${encodeURIComponent(tag)}`}>
                    {tag}
                  </Link>
                ))}
              </div>
            </>
          ) : null}
          <div className="actions">
            <LikeButton id={prompt.id} liked={prompt.liked} likes={prompt.likes} />
            {prompt.mine ? <DeleteButton id={prompt.id} /> : null}
          </div>
        </div>
      </article>
      {related.length > 0 ? (
        <section className="related">
          <h2>相近的几条</h2>
          <div className="grid">
            {related.map((item, index) => (
              <PromptCard key={item.id} prompt={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
