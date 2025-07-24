import React from 'react';
import Editor from '@monaco-editor/react';
import { FileItem } from '../types';

interface CodeEditorProps {
  file: FileItem | null;
}

export function CodeEditor({ file }: CodeEditorProps) {
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-[#94a3b8] bg-[#0f172a] rounded-2xl border border-[#25354a] backdrop-blur-xl shadow-inner">
        Select a file to view its contents
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl overflow-hidden border border-[#25354a] shadow-xl bg-[#0d1b2a]/80 backdrop-blur-xl">
      <Editor
        height="100%"
        defaultLanguage="typescript"
        theme="vs-dark"
        value={file.content || ''}
        options={{
          readOnly: false,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          fontLigatures: true,
          automaticLayout: true,
          tabSize: 2,
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
}
