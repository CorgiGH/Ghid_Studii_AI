import React, { useRef, useEffect } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { useApp } from '../../contexts/AppContext';

export default function CodeEditor({ value, onChange, readOnly = false }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const { dark } = useApp();

  useEffect(() => {
    if (!containerRef.current) return;

    const extensions = [
      basicSetup,
      cpp(),
      EditorView.updateListener.of(update => {
        if (update.docChanged && onChange) {
          onChange(update.state.doc.toString());
        }
      }),
    ];

    if (dark) extensions.push(oneDark);
    if (readOnly) extensions.push(EditorState.readOnly.of(true));

    const state = EditorState.create({
      doc: value || '',
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [dark]);

  // Sync external value changes
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (value !== undefined && value !== current) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="border rounded-lg overflow-hidden dark:border-gray-600 text-sm"
    />
  );
}
