import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Outfit } from "next/font/google";
import { Suspense } from "react";
import { SiteNav } from "@/components/site-header";
import { currentViewer } from "@/lib/viewer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "帧词 — AI 图片与视频提示词",
    template: "%s — 帧词",
  },
  description: "浏览、复制和投稿可复用的 AI 图片与视频提示词，画幅、负面词和参数放在一起。",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const viewer = await currentViewer();
  const ephemeral = (process.env.DATABASE_URL?.trim() ?? "") === "";

  return (
    <html lang="zh-CN">
      <body className={`${fraunces.variable} ${outfit.variable} ${plex.variable}`}>
        <div className="wrap">
          <header className="mast">
            <div className="brand">
              <a className="wordmark" href="/">
                帧词<span>FRAME</span>
              </a>
              <p className="dek">把能用的图片和视频提示词留下来。画幅、负面词、参数放在一起，看到就复制。</p>
            </div>
            <div className="mast-side">
              <Suspense fallback={<nav className="nav">全部 图片 视频 投稿 我的</nav>}>
                <SiteNav />
              </Suspense>
              <span className="who">
                {viewer ? `${viewer.simulated ? "预览身份 · " : ""}${viewer.name}` : "未登录"}
              </span>
            </div>
          </header>
          {viewer?.simulated || ephemeral ? (
            <p className="note">
              {viewer?.simulated ? "当前是本地预览身份，不是真实登录。" : ""}
              {ephemeral ? " 此环境使用临时数据库，重启后新投稿会清空。发布后使用这个应用自己的 Postgres。" : ""}
            </p>
          ) : null}
          <main>{children}</main>
          <footer className="footer">
            <span>帧词 · 图片与视频提示词</span>
            <span>样例由编辑部写入。投稿在这个应用里对能打开它的人可见。</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
