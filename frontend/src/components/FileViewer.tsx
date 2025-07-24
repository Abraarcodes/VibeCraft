import React from 'react';
import { X } from 'lucide-react';
import { FileViewerProps } from '../types';

export function FileViewer({ file, onClose }: FileViewerProps) {
  if (!file) return null;

  return (
    <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-[#0d1b2a]/80 border border-[#25354a] rounded-2xl shadow-xl backdrop-blur-xl w-full max-w-3xl max-h-[80vh] overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#25354a]">
          <h3 className="text-lg font-semibold text-[#e0f2fe] tracking-wide">
            {file.path}
          </h3>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#7fdbff] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Content */}
        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)] bg-[#1e293b] rounded-b-2xl border-t border-[#25354a]">
          <pre className="text-sm font-mono text-[#e0f2fe] whitespace-pre-wrap">
            {file.content || 'No content available'}
          </pre>
        </div>
      </div>
    </div>
  );
}
