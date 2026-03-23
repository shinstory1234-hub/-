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

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (el) => el.style.height || null,
        renderHTML: (attrs) => attrs.height ? { style: `height: ${attrs.height}` } : {},
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (el) => el.style.height || null,
        renderHTML: (attrs) => attrs.height ? { style: `height: ${attrs.height}` } : {},
      },
    };
  },
});
import { Extension } from "@tiptap/core";
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
const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
 } as any;
  },
});

export function RichEditor({ name, initialValue = "", onImageInserted }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [html, setHtml] = useState(initialValue);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      CustomTableHeader,
      CustomTableCell,
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
      setTimeout(() => { setUploading(false); setProgress(0); }, 250);
    }
  };

  const [tableHover, setTableHover] = useState<{ rows: number; cols: number } | null>(null);
  const [showTableGrid, setShowTableGrid] = useState(false);

  const insertTable = (rows: number, cols: number) => {
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableGrid(false);
    setTableHover(null);
  };

  return (
    <div className="space-y-2">
      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-t-lg border border-border bg-surface-muted p-2">
        <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          List
        </Button>

        {/* 글자 크기 */}
        <div className="relative">
          <Button type="button" variant="outline" size="sm" onClick={() => { setShowFontSizePicker(!showFontSizePicker); setShowColorPicker(false); setShowHighlightPicker(false); }}>
            글자크기
          </Button>
          {showFontSizePicker && (
            <div className="absolute top-9 left-0 z-50 flex flex-col rounded-lg border border-border bg-surface p-2 shadow-lg">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className="px-3 py-1 text-left hover:bg-surface-muted rounded"
                  style={{ fontSize: size }}
                  onClick={() => { (editor?.chain().focus() as any).setFontSize(size).run(); setShowFontSizePicker(false); }}
                >
                  {size}
                </button>
              ))}
              <button
                type="button"
                className="rounded px-3 py-1 text-left text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { (editor?.chain().focus() as any).unsetFontSize().run(); setShowFontSizePicker(false); }}
              >
                기본
              </button>
            </div>
          )}
        </div>

        {/* 글자 색 */}
        <div className="relative">
          <Button type="button" variant="outline" size="sm" onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); setShowFontSizePicker(false); }}>
            글자색
          </Button>
          {showColorPicker && (
            <div className="absolute top-9 left-0 z-50 flex gap-1 rounded-lg border border-border bg-surface p-2 shadow-lg">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                  onClick={() => { editor?.chain().focus().setColor(color).run(); setShowColorPicker(false); }}
                />
              ))}
              <button
                type="button"
                className="rounded px-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { editor?.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
              >
                기본
              </button>
            </div>
          )}
        </div>

        {/* 형광펜 */}
        <div className="relative">
          <Button type="button" variant="outline" size="sm" onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); setShowFontSizePicker(false); }}>
            형광펜
          </Button>
          {showHighlightPicker && (
            <div className="absolute top-9 left-0 z-50 flex gap-1 rounded-lg border border-border bg-surface p-2 shadow-lg">
              {HIGHLIGHTS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-6 w-6 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                  onClick={() => { editor?.chain().focus().setHighlight({ color }).run(); setShowHighlightPicker(false); }}
                />
              ))}
              <button
                type="button"
                className="rounded px-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => { editor?.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
              >
                제거
              </button>
            </div>
          )}
        </div>

        {/* 표 */}
        <div className="relative">
          <Button type="button" variant="outline" size="sm" onClick={() => setShowTableGrid(!showTableGrid)}>
            표 삽입
          </Button>
          {showTableGrid && (
            <div className="absolute top-9 left-0 z-50 rounded-lg border border-border bg-surface p-2 shadow-lg">
              <p className="mb-1 text-xs text-muted-foreground">
                {tableHover ? `${tableHover.rows} × ${tableHover.cols}` : "표 크기 선택"}
              </p>
              <div className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
                {Array.from({ length: 64 }, (_, i) => {
                  const row = Math.floor(i / 8) + 1;
                  const col = (i % 8) + 1;
                  const isActive = tableHover && row <= tableHover.rows && col <= tableHover.cols;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`h-5 w-5 border rounded-sm transition ${isActive ? "bg-accent border-accent" : "border-border hover:border-accent"}`}
                      onMouseEnter={() => setTableHover({ rows: row, cols: col })}
                      onMouseLeave={() => setTableHover(null)}
                      onClick={() => insertTable(row, col)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {editor?.isActive("table") && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()}>열 추가</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()}>행 추가</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().deleteColumn().run()}>열 삭제</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().deleteRow().run()}>행 삭제</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => editor.chain().focus().deleteTable().run()}>표 삭제</Button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="40"
                max="1000"
                placeholder="열 너비(px)"
                className="h-8 w-20 rounded-md border border-border bg-surface px-2 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    if (val > 0) {
                      editor.chain().focus().setCellAttribute("colwidth", [val]).run();
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
              <input
                type="number"
                min="20"
                max="500"
                placeholder="행 높이(px)"
                className="h-8 w-20 rounded-md border border-border bg-surface px-2 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseInt((e.target as HTMLInputElement).value);
                    if (val > 0) {
                      editor.chain().focus().setCellAttribute("height", `${val}px`).run();
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">Enter↵</span>
            </div>
          </>
        )}

        {/* 이미지 */}
        <Button type="button" variant="outline" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
          이미지 첨부
        </Button>
        <input ref={fileRef} type="file" className="hidden" accept="image/*"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadAndInsert(file); e.currentTarget.value = ""; }}
        />
      </div>

      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} readOnly />

      {uploading && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">이미지 업로드 중... {progress}%</p>
        </div>
      )}
      {uploadError && (
        <div className="flex items-center gap-2 text-xs text-danger">
          <span>{uploadError}</span>
          {lastFile && (
            <Button type="button" size="sm" variant="outline" onClick={() => uploadAndInsert(lastFile)}>재시도</Button>
          )}
        </div>
      )}
    </div>
  );
}
