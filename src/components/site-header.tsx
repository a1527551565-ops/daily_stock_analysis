"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const links = [
  { href: "/", label: "全部", key: "all" },
  { href: "/?medium=image", label: "图片", key: "image" },
  { href: "/?medium=video", label: "视频", key: "video" },
  { href: "/submit", label: "投稿", key: "submit" },
  { href: "/mine", label: "我的", key: "mine" },
];

export function SiteNav() {
  const path = usePathname();
  const params = useSearchParams();
  const medium = params.get("medium");

  return (
    <nav className="nav">
      {links.map((link) => (
        <Link key={link.key} href={link.href} data-active={isActive(link.key, path, medium) ? "true" : "false"}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

function isActive(key: string, path: string, medium: string | null): boolean {
  if (key === "submit") return path === "/submit";
  if (key === "mine") return path === "/mine";
  if (path !== "/") return false;
  if (key === "image") return medium === "image";
  if (key === "video") return medium === "video";
  return medium !== "image" && medium !== "video";
}
