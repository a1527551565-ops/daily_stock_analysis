import { FrameMark } from "./frame-mark";

const LOCAL_MEDIA = /^\/media\/[a-z0-9.-]+$/;

function localMedia(url: string): string {
  return LOCAL_MEDIA.test(url) ? url : "";
}

export function PromptMedia({
  id,
  title,
  aspect,
  coverUrl,
  mediaUrl,
  size = "card",
  playable = false,
}: {
  id: string;
  title: string;
  aspect: string;
  coverUrl: string;
  mediaUrl: string;
  size?: "card" | "lead";
  playable?: boolean;
}) {
  const cover = localMedia(coverUrl);
  const media = localMedia(mediaUrl);
  const video = playable && media.endsWith(".mp4");
  if (!cover && !video) {
    return <FrameMark id={id} aspect={aspect} size={size} />;
  }
  const frameStyle = size === "lead" ? { width: "100%", height: "auto", display: "block" } : undefined;

  return (
    <div className={size === "lead" ? "frame-stage stage-lead natural" : "frame-stage"}>
      {video ? (
        <video
          className="media"
          style={frameStyle}
          controls
          playsInline
          preload="metadata"
          poster={cover || undefined}
        >
          <source src={media} type="video/mp4" />
        </video>
      ) : (
        <img className="media" style={frameStyle} src={cover} alt={title} />
      )}
      {!playable && media.endsWith(".mp4") ? <span className="play-mark">视频</span> : null}
    </div>
  );
}
