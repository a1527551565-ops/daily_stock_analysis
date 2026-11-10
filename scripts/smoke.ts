import { createPrompt, deleteOwnPrompt, getPrompt, listPrompts, toggleLike } from "../src/lib/prompts";
import { validatePromptInput } from "../src/lib/validate";
import type { Viewer } from "../src/lib/types";

const viewer: Viewer = {
  sub: "user:dev",
  name: "Dev Viewer",
  simulated: true,
  channel: "production",
  kind: "person",
};

const other: Viewer = { ...viewer, sub: "user:other", name: "Other" };

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
const invalid = validatePromptInput({
  title: "短",
  medium: "image",
  model: "Kling",
  style: "电影感",
  aspect: "1:1",
  prompt: "too short",
  tags: "一,二,三,四,五,六,七",
});
assert(!invalid.ok, "invalid model and tags should fail");

const valid = validatePromptInput({
  title: "测试灯",
  summary: "一条测试",
  medium: "image",
  model: "Flux",
  style: "产品",
  aspect: "1:1",
  prompt: "A small brass lamp on a dark table, no text.",
  negativePrompt: "text",
  params: "1:1",
  tags: "灯, 灯, 静物",
});
if (!valid.ok) throw new Error("expected valid input");
assert(valid.value.tags.join() === "灯,静物", "tags should dedupe");

const listed = await listPrompts({ medium: "", model: "", style: "", q: "", sort: "new" }, viewer);
assert(listed.length >= 16, `expected seeds, got ${listed.length}`);
assert(listed.some((item) => item.title === "雨夜站台"), "missing seed title");
const rain = listed.find((item) => item.id === "seed-rain-platform");
const coast = listed.find((item) => item.id === "seed-coast-longtake");
assert(rain?.coverUrl === "/media/rain-platform.jpg", "image cover missing");
assert(coast?.mediaUrl === "/media/coast-longtake.mp4", "video file missing");

const searched = await listPrompts({ medium: "video", model: "Kling", style: "", q: "海岸", sort: "likes" }, viewer);
assert(searched.length === 1 && searched[0]?.title === "海岸前推", "filter leaked");
const percent = await listPrompts({ medium: "", model: "", style: "", q: "%", sort: "new" }, viewer);
assert(percent.length === 0, "percent sign should be a literal search");

const id = await createPrompt(valid.value, viewer);
const created = await getPrompt(id, viewer);
assert(created?.mine === true && created.title === "测试灯", "create failed");
assert((await getPrompt(id, other))?.mine === false, "other viewer should not own it");

const liked = await toggleLike(id, other);
assert(liked?.liked === true && liked.likes === 1, "like failed");
const unliked = await toggleLike(id, other);
assert(unliked?.liked === false && unliked.likes === 0, "unlike failed");

assert((await deleteOwnPrompt(id, other)) === false, "other viewer deleted a prompt");
assert((await deleteOwnPrompt("seed-rain-platform", viewer)) === false, "seed prompt was deleted");
assert(await deleteOwnPrompt(id, viewer), "owner delete failed");
assert((await getPrompt(id, viewer)) === null, "deleted prompt still readable");

const preview = await listPrompts({ medium: "", model: "", style: "", q: "测试灯", sort: "new" }, {
  ...viewer,
  channel: "preview",
});
assert(preview.length === 0, "preview channel saw a production prompt");

console.log(`smoke ok: ${listed.length} seeds`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
