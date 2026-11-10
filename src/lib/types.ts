export type Medium = "image" | "video";
export type Channel = "production" | "preview";

export type Prompt = {
  id: string;
  title: string;
  summary: string;
  medium: Medium;
  model: string;
  prompt: string;
  negativePrompt: string;
  params: string;
  style: string;
  aspect: string;
  coverUrl: string;
  mediaUrl: string;
  tags: string[];
  authorName: string;
  likes: number;
  featured: boolean;
  createdAt: string;
  liked: boolean;
  mine: boolean;
};

export type PromptInput = {
  title: string;
  summary: string;
  medium: Medium;
  model: string;
  prompt: string;
  negativePrompt: string;
  params: string;
  style: string;
  aspect: string;
  tags: string[];
};

export type PromptFilters = {
  medium: "" | Medium;
  model: string;
  style: string;
  q: string;
  sort: "new" | "likes";
};

export type Viewer = {
  sub: string;
  name: string;
  simulated: boolean;
  channel: Channel;
  kind: "person" | "key";
};

export type LikeState = { likes: number; liked: boolean; error?: string } | null;
export type ActionState = { error?: string } | null;
