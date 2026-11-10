import Link from "next/link";
import { excerpt, mediumLabel } from "@/lib/format";
import type { Prompt } from "@/lib/types";
import { FrameMark } from "./frame-mark";
import { LikeButton } from "./like-button";

export function PromptCard({ prompt, index }: { prompt: Prompt; index: number }) {
  return (
    <article className="card">
      <Link href={`/prompts/${prompt.id}`}>
        <FrameMark id={prompt.id} aspect={prompt.aspect} />
        <div className="body">
          <div className="index">{String(index + 1).padStart(2, "0")}</div>
          <div className="kicker">
            {mediumLabel(prompt.medium)} · {prompt.model}
          </div>
          <h2>{prompt.title}</h2>
          <p>{excerpt(prompt.summary || prompt.prompt, 72)}</p>
        </div>
      </Link>
      <div className="foot">
        <span>
          {prompt.aspect} · {prompt.style}
        </span>
        <LikeButton id={prompt.id} liked={prompt.liked} likes={prompt.likes} />
      </div>
    </article>
  );
}
