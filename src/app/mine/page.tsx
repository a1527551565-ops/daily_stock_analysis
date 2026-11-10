import type { Metadata } from "next";
import Link from "next/link";
import { PromptCard } from "@/components/prompt-card";
import { listMine } from "@/lib/prompts";
import { currentViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "我的" };

export default async function MinePage() {
  const viewer = await currentViewer();
  if (!viewer) {
    return (
      <>
        <h1 className="page-title">我的</h1>
        <p className="empty" style={{ marginTop: 12 }}>
          投稿和收藏记在登录身份上。发布为私有或团队应用后，用 Cursor 账号打开就能看到自己的内容。
        </p>
        <p style={{ marginTop: 16 }}>
          <Link className="btn ghost" href="/">
            先去看全部
          </Link>
        </p>
      </>
    );
  }

  const { written, saved } = await listMine(viewer);

  return (
    <>
      <h1 className="page-title">我的</h1>
      <p className="byline">{viewer.simulated ? "预览身份" : viewer.name} 的投稿和收藏。</p>
      <h2 className="block-title">投稿</h2>
      {written.length === 0 ? (
        <p className="empty">
          还没有投稿。去 <Link href="/submit">写一条</Link>。
        </p>
      ) : (
        <section className="grid">
          {written.map((prompt, index) => (
            <PromptCard key={prompt.id} prompt={prompt} index={index} />
          ))}
        </section>
      )}
      <h2 className="block-title">收藏</h2>
      {saved.length === 0 ? (
        <p className="empty">还没有收藏。在卡片上点收藏，会记在这里。</p>
      ) : (
        <section className="grid">
          {saved.map((prompt, index) => (
            <PromptCard key={prompt.id} prompt={prompt} index={index} />
          ))}
        </section>
      )}
    </>
  );
}
