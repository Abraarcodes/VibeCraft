import React from 'react';
import { Code2, Eye } from 'lucide-react';

interface TabViewProps {
  activeTab: 'code' | 'preview';
  onTabChange: (tab: 'code' | 'preview') => void;
}

export function TabView({ activeTab, onTabChange }: TabViewProps) {
  return (
    <div className="flex space-x-3 mb-6 bg-[#0d1b2a] p-2 rounded-2xl backdrop-blur-xl border border-[#25354a] shadow-md">
      <button
        onClick={() => onTabChange('code')}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300
          ${
            activeTab === 'code'
              ? 'bg-gradient-to-r from-[#8f75ff] to-[#7fdbff] text-white shadow-lg scale-105'
              : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#273449] hover:text-[#e0f2fe]'
          }`}
      >
        <Code2
          className={`w-4 h-4 ${
            activeTab === 'code' ? 'text-white' : 'text-[#7fdbff]'
          }`}
        />
        Code
      </button>

      <button
        onClick={() => onTabChange('preview')}
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300
          ${
            activeTab === 'preview'
              ? 'bg-gradient-to-r from-[#8f75ff] to-[#7fdbff] text-white shadow-lg scale-105'
              : 'bg-[#1e293b] text-[#94a3b8] hover:bg-[#273449] hover:text-[#e0f2fe]'
          }`}
      >
        <Eye
          className={`w-4 h-4 ${
            activeTab === 'preview' ? 'text-white' : 'text-[#7fdbff]'
          }`}
        />
        Preview
      </button>
    </div>
  );
}
