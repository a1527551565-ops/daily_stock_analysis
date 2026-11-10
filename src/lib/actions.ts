"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPrompt, deleteOwnPrompt, toggleLike } from "./prompts";
import { rateLimit } from "./rate-limit";
import type { ActionState, LikeState } from "./types";
import { inputFromForm, isPromptId, validatePromptInput } from "./validate";
import { currentViewer } from "./viewer";

export async function createPromptAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await currentViewer();
  if (!viewer) return { error: "投稿需要登录。把应用发布为私有或团队后，用 Cursor 账号打开即可。" };
  if (!rateLimit(`create:${viewer.sub}`, 8, 60 * 60 * 1000)) {
    return { error: "这一小时的投稿已经够多了，稍后再写。" };
  }
  const parsed = validatePromptInput(inputFromForm(formData));
  if (!parsed.ok) return { error: parsed.error };
  const id = await createPrompt(parsed.value, viewer);
  revalidatePath("/");
  revalidatePath("/mine");
  redirect(`/prompts/${id}`);
}

export async function toggleLikeAction(prev: LikeState, formData: FormData): Promise<LikeState> {
  const fallback = { likes: prev?.likes ?? 0, liked: prev?.liked ?? false };
  const viewer = await currentViewer();
  if (!viewer) return { ...fallback, error: "登录后才能收藏" };
  if (!rateLimit(`like:${viewer.sub}`, 40, 60 * 1000)) return { ...fallback, error: "操作太频繁" };
  const id = String(formData.get("id") ?? "");
  if (!isPromptId(id)) return { ...fallback, error: "没有这条提示词" };
  const result = await toggleLike(id, viewer);
  if (!result) return { ...fallback, error: "没有这条提示词" };
  revalidatePath("/");
  revalidatePath(`/prompts/${id}`);
  revalidatePath("/mine");
  return result;
}

export async function deletePromptAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const viewer = await currentViewer();
  if (!viewer) return { error: "登录后才能删除自己的投稿" };
  if (!rateLimit(`delete:${viewer.sub}`, 20, 60 * 60 * 1000)) return { error: "操作太频繁" };
  const id = String(formData.get("id") ?? "");
  const removed = await deleteOwnPrompt(id, viewer);
  if (!removed) return { error: "只能删除自己投的稿" };
  revalidatePath("/");
  revalidatePath("/mine");
  redirect("/");
}
