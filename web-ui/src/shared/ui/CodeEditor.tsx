import { indentWithTab } from "@codemirror/commands";
import { yaml } from "@codemirror/lang-yaml";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useMemo, useRef, type CSSProperties } from "react";

type CodeEditorProps = {
  ariaLabel: string;
  maxHeight?: number;
  minHeight?: number;
  value: string;
  onChange: (value: string) => void;
};

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#1f2329",
      color: "#d8dee9",
      fontSize: "13px",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(20, 184, 166, 0.08)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(20, 184, 166, 0.12)",
      color: "#cbd5e1",
    },
    ".cm-content": {
      minHeight: "calc(var(--code-editor-min-height) - 24px)",
      padding: "12px 0",
    },
    ".cm-cursor": {
      borderLeftColor: "#5eead4",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "rgba(15, 23, 42, 0.72)",
      borderColor: "rgba(148, 163, 184, 0.28)",
      color: "#cbd5e1",
    },
    ".cm-gutters": {
      backgroundColor: "#1b2028",
      borderRight: "1px solid rgba(148, 163, 184, 0.18)",
      color: "#64748b",
    },
    ".cm-line": {
      padding: "0 18px",
    },
    ".cm-matchingBracket": {
      backgroundColor: "rgba(45, 212, 191, 0.18)",
      outline: "1px solid rgba(45, 212, 191, 0.36)",
    },
    ".cm-panels": {
      backgroundColor: "#111827",
      color: "#e2e8f0",
    },
    ".cm-scroller": {
      fontFamily: '"JetBrains Mono", "SFMono-Regular", "Cascadia Code", Menlo, Consolas, monospace',
      lineHeight: "1.62",
      maxHeight: "var(--code-editor-max-height)",
      minHeight: "var(--code-editor-min-height)",
      overflow: "auto",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(250, 204, 21, 0.28)",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(45, 212, 191, 0.24)",
    },
  },
  { dark: true },
);

export function CodeEditor({ ariaLabel, maxHeight = 680, minHeight = 520, onChange, value }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef(value);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const extensions = useMemo(
    () => [
      basicSetup,
      keymap.of([indentWithTab]),
      EditorState.tabSize.of(2),
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange(update.state.doc.toString());
      }),
      yaml(),
      oneDark,
      editorTheme,
    ],
    [ariaLabel, onChange],
  );

  useEffect(() => {
    if (!hostRef.current) return;

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: valueRef.current,
        extensions,
      }),
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [extensions]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (currentValue === value) return;

    view.dispatch({
      changes: {
        from: 0,
        insert: value,
        to: view.state.doc.length,
      },
    });
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="overflow-hidden rounded-lg border border-teal-300/80 bg-slate-950 shadow-[0_16px_38px_rgba(15,23,42,0.18),0_0_0_1px_rgba(20,184,166,0.20)] ring-2 ring-teal-100/70"
      style={
        {
          "--code-editor-max-height": `${maxHeight}px`,
          "--code-editor-min-height": `${minHeight}px`,
        } as CSSProperties
      }
    />
  );
}
