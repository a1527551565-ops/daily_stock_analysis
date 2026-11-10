"use client";

import { useActionState, useState } from "react";
import { createPromptAction } from "@/lib/actions";
import type { Medium } from "@/lib/types";
import { ASPECTS, IMAGE_MODELS, STYLES, VIDEO_MODELS } from "@/lib/validate";
import { FrameMark } from "./frame-mark";

export function SubmitForm() {
  const [state, action, pending] = useActionState(createPromptAction, null);
  const [medium, setMedium] = useState<Medium>("image");
  const [model, setModel] = useState<string>(IMAGE_MODELS[0]);
  const [aspect, setAspect] = useState<string>("3:4");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const models = medium === "video" ? VIDEO_MODELS : IMAGE_MODELS;

  return (
    <div className="composer">
      <form className="form" action={action}>
        <label>
          标题
          <input name="title" value={title} maxLength={32} required onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          媒介
          <select
            name="medium"
            value={medium}
            onChange={(event) => {
              const next = event.target.value === "video" ? "video" : "image";
              const nextModels = next === "video" ? VIDEO_MODELS : IMAGE_MODELS;
              setMedium(next);
              setModel(nextModels[0]);
            }}
          >
            <option value="image">图片</option>
            <option value="video">视频</option>
          </select>
        </label>
        <label>
          模型
          <select name="model" value={model} onChange={(event) => setModel(event.target.value)}>
            {models.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          风格
          <select name="style" defaultValue="电影感">
            {STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>
        <label>
          画幅
          <select name="aspect" value={aspect} onChange={(event) => setAspect(event.target.value)}>
            {ASPECTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          参数
          <input name="params" maxLength={200} placeholder="例如 5 秒 · 16:9 · 运动幅度低" />
        </label>
        <label className="wide">
          一句说明
          <input name="summary" maxLength={80} placeholder="这条适合什么镜头，用中文写给人看" />
        </label>
        <label className="wide">
          提示词
          <textarea
            name="prompt"
            required
            maxLength={4000}
            value={prompt}
            placeholder="贴你真正会放进模型的原文"
            onChange={(event) => setPrompt(event.target.value)}
          />
          <span className="count">{prompt.length}/4000</span>
        </label>
        <label className="wide">
          负面词
          <textarea name="negativePrompt" maxLength={1500} placeholder="没有就留空" style={{ minHeight: 80 }} />
        </label>
        <label className="wide">
          标签
          <input name="tags" maxLength={80} placeholder="用逗号分开，最多 6 个" />
        </label>
        {state?.error ? <p className="error wide">{state.error}</p> : null}
        <div className="actions">
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "提交中" : "发布这条"}
          </button>
        </div>
      </form>
      <aside className="preview">
        <p className="kicker">预览</p>
        <FrameMark id={title || "draft"} aspect={aspect} />
        <h2>{title || "未命名"}</h2>
        <pre>{prompt || "提示词会显示在这里。"}</pre>
      </aside>
    </div>
  );
}
