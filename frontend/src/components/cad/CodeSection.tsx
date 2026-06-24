import { useState, useRef } from 'react';
import { Copy, Check, Download } from 'lucide-react';

interface CodeSectionProps {
  code: string;
}

export function CodeSection({ code }: CodeSectionProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = code.split('\n');
  const lineNumWidth = String(lines.length).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 pb-4">
      <div className="relative rounded-2xl overflow-hidden border border-adam-neutral-700 bg-adam-bg-dark">
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-adam-text-tertiary hover:text-adam-text-secondary hover:bg-adam-neutral-800/80 transition-colors bg-black/30 backdrop-blur-sm"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-adam-text-tertiary hover:text-adam-text-secondary hover:bg-adam-neutral-800/80 transition-colors bg-black/30 backdrop-blur-sm"
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <pre className="text-[11px] text-adam-text-secondary bg-black/20 overflow-auto max-h-[calc(100vh-400px)] font-mono leading-relaxed p-0">
          <code className="block p-3 pt-9">
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-white/[0.02] rounded-sm">
                <span
                  className="text-adam-text-tertiary/25 text-right select-none shrink-0 mr-3 tabular-nums"
                  style={{ minWidth: `${lineNumWidth}ch` }}
                >
                  {i + 1}
                </span>
                <span className="flex-1 whitespace-pre">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
