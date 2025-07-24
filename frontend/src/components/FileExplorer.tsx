import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  FolderTree,
  File,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { FileItem } from '../types';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
}

interface FileNodeProps {
  item: FileItem;
  depth: number;
  onFileClick: (file: FileItem) => void;
}

function FileNode({ item, depth, onFileClick }: FileNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-[#1e293b] rounded-xl cursor-pointer transition-colors"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
        onClick={handleClick}
      >
        {item.type === 'folder' && (
          <span className="text-[#94a3b8]">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {item.type === 'folder' ? (
          <FolderTree className="w-4 h-4 text-[#7fdbff]" />
        ) : (
          <File className="w-4 h-4 text-[#94a3b8]" />
        )}
        <span className="text-[#e0f2fe]">{item.name}</span>
      </div>
      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileNode
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorer({ files, onFileSelect }: FileExplorerProps) {
  const downloadFiles = async () => {
    const zip = new JSZip();

    const addFilesToZip = (fileList: FileItem[], folder?: JSZip) => {
      fileList.forEach((file) => {
        if (file.type === 'folder') {
          const subFolder = folder ? folder.folder(file.name) : zip.folder(file.name);
          if (file.children) {
            addFilesToZip(file.children, subFolder!);
          }
        } else {
          const content = file.content || '';
          if (folder) {
            folder.file(file.name, content);
          } else {
            zip.file(file.name, content);
          }
        }
      });
    };

    addFilesToZip(files);
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'website_files.zip');
  };

  return (
    <div className="bg-[#0d1b2a]/80 border border-[#25354a] backdrop-blur-xl rounded-2xl shadow-xl p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-[#e0f2fe]">
          <FolderTree className="w-5 h-5 text-[#7fdbff]" />
          File Explorer
        </h2>
        <button
          onClick={downloadFiles}
          className="px-4 py-2 rounded-2xl text-white bg-gradient-to-r from-[#8f75ff] to-[#7fdbff] hover:scale-105 hover:shadow-[0_0_10px_#7fdbff] transition-all duration-300"
        >
          GET CODE
        </button>
      </div>
      <div className="space-y-1">
        {files.map((file, index) => (
          <FileNode
            key={`${file.path}-${index}`}
            item={file}
            depth={0}
            onFileClick={onFileSelect}
          />
        ))}
      </div>
    </div>
  );
}
