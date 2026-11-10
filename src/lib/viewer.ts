import { headers } from "next/headers";
import { getIdentity } from "../../cursor/identity.js";
import type { Viewer } from "./types";

type IdentityResult = {
  verified: boolean;
  reason?: string;
  sub?: string;
  name?: string;
  kind?: string;
  stage?: string;
  simulated?: boolean;
};

export async function currentViewer(): Promise<Viewer | null> {
  const identity = (await getIdentity(await headers())) as IdentityResult;
  if (!identity.verified || typeof identity.sub !== "string" || identity.sub === "") return null;
  const kind = identity.kind === "key" ? "key" : "person";
  const fallback = kind === "key" ? "密钥" : "未命名";
  const name = (identity.name ?? "").trim() || fallback;
  return {
    sub: identity.sub,
    name: name.slice(0, 40),
    simulated: identity.simulated === true,
    channel: identity.stage === "preview" ? "preview" : "production",
    kind,
  };
}
