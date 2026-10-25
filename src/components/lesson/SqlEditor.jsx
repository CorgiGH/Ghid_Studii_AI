import React, { useEffect, useRef } from 'react';
import { EditorView, drawSelection, highlightSpecialChars, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { PLSQL, sql } from '@codemirror/lang-sql';

// Colours come from the lesson tokens, so one highlight style serves the light and the dark theme.
const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword], color: 'var(--lt-acc)', fontWeight: '600' },
  { tag: [t.string, t.special(t.string)], color: 'var(--lt-keep)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--lt-t3)' },
  { tag: [t.lineComment, t.blockComment], color: 'var(--theme-muted-text)', fontStyle: 'italic' },
  { tag: [t.typeName, t.standard(t.name)], color: 'var(--lt-t1)' },
  { tag: t.operator, color: 'var(--theme-muted-text)' },
]);

// 16px text: a smaller size makes iOS zoom the page when the editor takes focus.
const theme = EditorView.theme({
  '&': { color: 'var(--theme-content-text)', backgroundColor: 'var(--theme-card-bg)', fontSize: '16px' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', lineHeight: '1.55' },
  '.cm-content': { padding: '10px 4px', caretColor: 'var(--theme-content-text)', minHeight: '88px' },
  '.cm-line': { padding: '0 10px' },
  '&.cm-focused': { outline: '2px solid var(--lt-acc)', outlineOffset: '1px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--lt-acc-soft)' },
  '.cm-cursor': { borderLeftColor: 'var(--theme-content-text)' },
});

// A CodeMirror 6 editor for one SQL statement or script. Ctrl/Cmd+Enter calls onRun; Tab is left to the browser so the
// keyboard can leave the editor. `readOnly` is fixed for the life of the editor (the parent changes `key` to switch).
export default function SqlEditor({ value, onChange, onRun, readOnly = false, label, className = '' }) {
  const host = useRef(null);
  const view = useRef(null);
  const cb = useRef({ onChange, onRun });
  useEffect(() => { cb.current = { onChange, onRun }; });

  useEffect(() => {
    const runKey = EditorView.domEventHandlers({
      keydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          cb.current.onRun?.();
          return true;
        }
        return false;
      },
    });
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          runKey,
          highlightSpecialChars(), history(), drawSelection(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          sql({ dialect: PLSQL, upperCaseKeywords: false }),
          syntaxHighlighting(highlight),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ 'aria-label': label || 'SQL', autocorrect: 'off', autocapitalize: 'off', spellcheck: 'false' }),
          EditorView.editable.of(!readOnly),
          EditorState.readOnly.of(readOnly),
          EditorView.updateListener.of((u) => { if (u.docChanged) cb.current.onChange?.(u.state.doc.toString()); }),
          theme,
        ],
      }),
    });
    view.current = v;
    return () => { v.destroy(); view.current = null; };
    // the editor is built once; later `value` changes are applied by the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, label]);

  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);

  return <div ref={host} className={`sx-editor ${className}`} data-lesson-editor="" data-testid="sql-editor" />;
}
