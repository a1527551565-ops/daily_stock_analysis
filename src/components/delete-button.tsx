"use client";

import { useActionState } from "react";
import { deletePromptAction } from "@/lib/actions";

export function DeleteButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deletePromptAction, null);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("删除这条提示词？")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn ghost" disabled={pending}>
        删除
      </button>
      {state?.error ? <p className="error">{state.error}</p> : null}
    </form>
  );
}
