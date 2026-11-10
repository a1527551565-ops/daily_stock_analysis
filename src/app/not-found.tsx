import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1 className="page-title">没有这条提示词</h1>
      <p className="empty" style={{ marginTop: 12 }}>
        它可能被删了，或者不在当前这个环境里。
      </p>
      <p style={{ marginTop: 16 }}>
        <Link className="btn" href="/">
          回到全部
        </Link>
      </p>
    </>
  );
}
