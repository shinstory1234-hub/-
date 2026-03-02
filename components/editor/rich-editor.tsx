"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Props = {
  name: string;
  initialValue?: string;
  onImageInserted?: (url: string) => void;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function RichEditor({ name, initialValue = "", onImageInserted }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [html, setHtml] = useState(initialValue);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: initialValue,
    onCreate: ({ editor }) => setHtml(editor.getHTML()),
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[380px] rounded-b-lg border border-t-0 border-border bg-surface p-5 outline-none"
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
        if (!imageItem) return false;

        const file = imageItem.getAsFile();
        if (!file) return false;
        event.preventDefault();
        uploadAndInsert(file);
        return true;
      }
    }
  });

  const validateImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("이미지 파일만 업로드할 수 있습니다.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("이미지는 10MB 이하만 업로드할 수 있습니다.");
    }
  };

  const insertImageAtCursor = (url: string) => {
    if (!editor) return;

    const position = editor.state.selection.from;
    editor
      .chain()
      .focus()
      .insertContentAt(position, [
        { type: "image", attrs: { src: url } },
        { type: "paragraph" }
      ])
      .run();
  };

  const uploadAndInsert = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setLastFile(file);
    setProgress(8);

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 9));
    }, 180);

    try {
      validateImage(file);
      const supabase = createClient();
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("로그인이 필요합니다.");

      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("images").upload(path, file, { upsert: false });
      if (error) throw error;

      const { data } = supabase.storage.from("images").getPublicUrl(path);
      insertImageAtCursor(data.publicUrl);
      onImageInserted?.(data.publicUrl);
      show("이미지를 삽입했습니다.");
      setProgress(100);
    } catch (e) {
      const message = e instanceof Error ? e.message : "업로드 실패";
      setUploadError(message);
      show(message, "error");
    } finally {
      window.clearInterval(progressTimer);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 250);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-t-lg border border-border bg-surface-muted p-2">
        <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          List
        </Button>
        <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
          이미지 첨부
        </Button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadAndInsert(file);
            e.currentTarget.value = "";
          }}
        />
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />
      {uploading ? (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">이미지 업로드 중... {progress}%</p>
        </div>
      ) : null}
      {uploadError ? (
        <div className="flex items-center gap-2 text-xs text-danger">
          <span>{uploadError}</span>
          {lastFile ? (
            <Button type="button" size="sm" variant="outline" onClick={() => uploadAndInsert(lastFile)}>
              재시도
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
