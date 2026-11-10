"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <h1 className="page-title">这一页没有打开</h1>
      <p className="empty" style={{ marginTop: 12 }}>
        可以再试一次。如果是刚发布，数据库可能还在准备。
      </p>
      <p style={{ marginTop: 16 }}>
        <button className="btn" type="button" onClick={() => reset()}>
          重试
        </button>
      </p>
    </>
  );
}
