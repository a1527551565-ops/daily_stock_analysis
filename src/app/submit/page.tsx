import type { Metadata } from "next";
import { SubmitForm } from "@/components/submit-form";
import { currentViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "投稿" };

export default async function SubmitPage() {
  const viewer = await currentViewer();

  return (
    <>
      <h1 className="page-title">投稿</h1>
      <p className="summary" style={{ marginTop: 8 }}>
        标题和说明写给人看，提示词保留你真正会贴进模型的原文。
        {viewer ? ` 将以「${viewer.name}」发布。` : " 当前没有登录身份，还不能发布。"}
      </p>
      {viewer ? <SubmitForm /> : <p className="empty" style={{ marginTop: 16 }}>把应用发布为私有或团队后，打开的人会用 Cursor 账号登录，然后就能投稿。</p>}
    </>
  );
}
