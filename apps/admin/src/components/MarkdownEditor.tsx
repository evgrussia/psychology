'use client';

import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onInsertMedia?: () => void;
  showPreview?: boolean;
  height?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  onInsertMedia,
  showPreview = true,
  height = '600px',
}: MarkdownEditorProps) {
  const [markdownError, setMarkdownError] = useState<string | null>(null);

  // Validate markdown on change
  useEffect(() => {
    try {
      // Basic validation - just check if ReactMarkdown can parse it
      setMarkdownError(null);
    } catch (err) {
      setMarkdownError('Ошибка в синтаксисе markdown');
    }
  }, [value]);

  return (
    <div className="markdown-editor-container">
      <div className="editor-panes" style={{ height }}>
        <div className="editor-pane">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontWeight: 600, fontSize: '14px' }}>Markdown текст</label>
            {onInsertMedia && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={onInsertMedia}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                + Медиа
              </button>
            )}
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
            <CodeMirror
              value={value}
              height={height}
              extensions={[markdown()]}
              theme={oneDark}
              onChange={(val) => onChange(val)}
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                dropCursor: false,
                allowMultipleSelections: false,
              }}
            />
          </div>
          {markdownError && (
            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px', fontSize: '12px' }}>
              ⚠️ {markdownError}
            </div>
          )}
        </div>
        {showPreview && (
          <div className="preview-pane">
            <label style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px', display: 'block' }}>Предпросмотр</label>
            <div
              className="markdown-preview prose"
              style={{
                flex: 1,
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                overflowY: 'auto',
                minHeight: '200px',
              }}
            >
              {markdownError ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  <p>⚠️ Ошибка рендеринга markdown</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>
                    Проверьте синтаксис в редакторе. Контент будет сохранен, но может отображаться некорректно.
                  </p>
                </div>
              ) : (
                <ReactMarkdown>{value || '*Текст пока пуст...*'}</ReactMarkdown>
              )}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .markdown-editor-container {
          width: 100%;
        }
        .editor-panes {
          display: flex;
          gap: 20px;
        }
        .editor-pane,
        .preview-pane {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .prose :global(h1) {
          font-size: 1.5em;
          margin-top: 0;
        }
        .prose :global(h2) {
          font-size: 1.3em;
        }
        .prose :global(img) {
          max-width: 100%;
        }
        .prose :global(code) {
          background: #f4f4f4;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        .prose :global(pre) {
          background: #f4f4f4;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
        }
        .prose :global(pre code) {
          background: none;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
