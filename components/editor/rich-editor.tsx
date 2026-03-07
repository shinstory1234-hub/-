"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type Props = {
  name: string;
  initialValue?: string;
  onImageInserted?: (url: string) => void;
};

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const COLORS = ["#000000", "#e03131", "#2f9e44", "#1971c2", "#f08c00", "#7048e8"];
const HIGHLIGHTS = ["#fff3bf", "#d3f9d8", "#d0ebff", "#ffe8cc", "#f3d9fa"];

export function RichEditor({ name, initialValue = "", onImageInserted }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [html, setHtml] = useState(initialValue);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialValue,
    onCreate: ({ editor }) => setHtml(editor.getHTML()),
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[380px] rounded-b-lg border border-t-0 border-border bg-surface p-5 outline-none prose max-w-none"
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
    if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 업로드할 수 있습니다.");
    if (file.size > MAX_IMAGE_BYTES) throw new Error("이미지는 10MB 이하만 업로드할 수 있습니다.");
  };

  const insertImageAtCursor = (url: string) => {
    if (!editor) return;
    const position = editor.state.selection.from;
    editor.chain().focus().insertContentAt(position, [
      { type: "image", attrs: { src: url } },
      { type: "paragraph" }
    ]).run();
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
      const { error } = await supabase.storage.from("images").upload(path, file, { upsert: f
