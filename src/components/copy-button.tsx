"use client";

import { useState } from "react";

export function CopyButton({ text, label, ghost = false }: { text: string; label: string; ghost?: boolean }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className={ghost ? "btn ghost" : "btn"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const area = document.createElement("textarea");
          area.value = text;
          area.setAttribute("readonly", "true");
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
        }
        setDone(true);
        window.setTimeout(() => setDone(false), 1400);
      }}
    >
      {done ? "已复制" : label}
    </button>
  );
}
