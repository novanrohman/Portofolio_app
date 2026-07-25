"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight dependency-free WYSIWYG (contentEditable) that emits HTML.
 * Images are inserted by URL (host in public/ or paste an external link).
 */
export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastValue = useRef<string>("");
  const savedRange = useRef<Range | null>(null);

  // Remember the caret/selection inside the editor before a prompt steals focus.
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  // Sync external value -> editor only when it actually differs (keeps caret).
  useEffect(() => {
    const el = ref.current;
    if (el && value !== lastValue.current && value !== el.innerHTML) {
      el.innerHTML = value || "";
      lastValue.current = value;
    }
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (el) {
      lastValue.current = el.innerHTML;
      onChange(el.innerHTML);
    }
  };

  const cmd = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    emit();
  };

  const insertImage = () => {
    saveSelection(); // capture caret before the prompt blurs the editor
    const url = window.prompt("Image URL (e.g. /images/foo.png or https://...):");
    if (!url) return;

    ref.current?.focus();
    restoreSelection();

    const img = document.createElement("img");
    img.src = url;
    img.alt = "";

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.collapse(false);
      range.insertNode(img);
      range.setStartAfter(img);
      range.setEndAfter(img);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      ref.current?.appendChild(img);
    }
    emit();
  };

  const insertLink = () => {
    saveSelection();
    const url = window.prompt("Link URL:");
    if (!url) return;
    ref.current?.focus();
    restoreSelection();
    document.execCommand("createLink", false, url);
    emit();
  };

  const Btn = ({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      title={title}
      // preserve the editor's selection when clicking the toolbar
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="rounded-lg px-2.5 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-700"
    >
      {children}
    </button>
  );

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-zinc-300 dark:border-zinc-700">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 p-1.5 dark:border-zinc-700 dark:bg-zinc-900">
        <Btn onClick={() => cmd("bold")} title="Bold"><strong>B</strong></Btn>
        <Btn onClick={() => cmd("italic")} title="Italic"><em>I</em></Btn>
        <span className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
        <Btn onClick={() => cmd("formatBlock", "<h2>")} title="Heading 2">H2</Btn>
        <Btn onClick={() => cmd("formatBlock", "<h3>")} title="Heading 3">H3</Btn>
        <Btn onClick={() => cmd("formatBlock", "<p>")} title="Paragraph">P</Btn>
        <span className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
        <Btn onClick={() => cmd("insertUnorderedList")} title="Bullet list">• List</Btn>
        <Btn onClick={() => cmd("insertOrderedList")} title="Numbered list">1. List</Btn>
        <span className="mx-1 h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
        <Btn onClick={insertLink} title="Insert link">🔗 Link</Btn>
        <Btn onClick={insertImage} title="Insert image by URL">🖼 Image</Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        className="admin-richtext min-h-[180px] max-h-[480px] overflow-y-auto bg-white px-4 py-3 text-sm leading-relaxed outline-none dark:bg-zinc-950"
      />
    </div>
  );
}
