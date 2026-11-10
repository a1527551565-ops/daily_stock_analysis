"use client";

import { useActionState } from "react";
import { toggleLikeAction } from "@/lib/actions";
import type { LikeState } from "@/lib/types";

export function LikeButton({ id, liked, likes }: { id: string; liked: boolean; likes: number }) {
  const [state, action, pending] = useActionState(toggleLikeAction, null as LikeState);
  const shownLiked = state?.liked ?? liked;
  const shownLikes = state?.likes ?? likes;

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={shownLiked ? "btn liked" : "btn ghost"} disabled={pending}>
        {shownLiked ? "已收藏" : "收藏"} {shownLikes}
      </button>
      {state?.error ? <span className="error"> {state.error}</span> : null}
    </form>
  );
}
