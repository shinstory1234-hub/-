"use client";

import { useState } from "react";
import { deletePostFormAction, togglePublishFormAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function PostRowActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={togglePublishFormAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="publish" value={isPublished ? "false" : "true"} />
        <Button variant="outline" type="submit">{isPublished ? "비공개" : "발행"}</Button>
      </form>

      <Button variant="danger" type="button" onClick={() => setOpen(true)}>
        삭제
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="글 삭제" description="정말 삭제할까요? 삭제 후 복구할 수 없습니다.">
        <form action={deletePostFormAction}>
          <input type="hidden" name="id" value={id} />
          <Button variant="danger" type="submit">정말 삭제</Button>
        </form>
      </Modal>
    </div>
  );
}
