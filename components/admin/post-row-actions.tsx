"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ActionState, deletePostAction, togglePublishAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

const initialState: ActionState = { ok: false };

export function PostRowActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [open, setOpen] = useState(false);
  const [deleteState, deleteFormAction, deletePending] = useActionState(deletePostAction, initialState);
  const [publishState, publishFormAction, publishPending] = useActionState(togglePublishAction, initialState);
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    if (deleteState.ok) {
      show("글을 삭제했습니다.");
      setOpen(false);
      router.refresh();
    } else if (deleteState.error) {
      show(deleteState.error, "error");
    }
  }, [deleteState, router, show]);

  useEffect(() => {
    if (publishState.ok) {
      show(isPublished ? "글을 비공개 처리했습니다." : "글을 발행했습니다.");
      router.refresh();
    } else if (publishState.error) {
      show(publishState.error, "error");
    }
  }, [isPublished, publishState, router, show]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={publishFormAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="publish" value={isPublished ? "false" : "true"} />
        <Button variant="outline" type="submit" disabled={publishPending}>
          {isPublished ? "비공개" : "발행"}
        </Button>
      </form>

      <Button variant="danger" type="button" onClick={() => setOpen(true)}>
        삭제
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="글 삭제" description="정말 삭제할까요? 삭제 후 복구할 수 없습니다.">
        <form action={deleteFormAction}>
          <input type="hidden" name="id" value={id} />
          <Button variant="danger" type="submit" disabled={deletePending}>정말 삭제</Button>
        </form>
      </Modal>
    </div>
  );
}
