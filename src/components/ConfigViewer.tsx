import React, { useState, useMemo } from 'react';
import { Search, AlertTriangle, ShieldCheck, Copy, Check } from 'lucide-react';
import { AuditFinding } from '../types/cisco';

interface ConfigViewerProps {
  configText: string;
  findings: AuditFinding[];
}

export const ConfigViewer: React.FC<ConfigViewerProps> = ({ configText, findings }) => {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  // Map of flagged line numbers to finding titles
  const flaggedLineMap = useMemo(() => {
    const map = new Map<number, AuditFinding[]>();
    findings.forEach((finding) => {
      if (finding.lineNumbers) {
        finding.lineNumbers.forEach((num) => {
          const list = map.get(num) || [];
          list.push(finding);
          map.set(num, list);
        });
      }
    });
    return map;
  }, [findings]);

  const lines = useMemo(() => {
    return configText.split(/\r?\n/);
  }, [configText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cisco IOS syntax colorizer
  const renderLineContent = (text: string) => {
    const trimmed = text.trim();

    if (trimmed.startsWith('!')) {
      return <span className="text-slate-600 italic">{text}</span>;
    }
    if (/^hostname\b/i.test(trimmed)) {
      return (
        <span>
          <span className="text-cyan-400 font-bold">hostname </span>
          <span className="text-emerald-300">{text.replace(/^hostname\s+/i, '')}</span>
        </span>
      );
    }
    if (/^interface\b/i.test(trimmed)) {
      return <span className="text-cyan-300 font-semibold">{text}</span>;
    }
    if (/^line\s+(con|aux|vty)\b/i.test(trimmed)) {
      return <span className="text-amber-300 font-semibold">{text}</span>;
    }
    if (/\b(password|secret)\b/i.test(trimmed)) {
      return <span className="text-rose-400 font-semibold">{text}</span>;
    }
    if (/\b(transport\s+input\s+telnet|transport\s+input\s+all)\b/i.test(trimmed)) {
      return <span className="text-rose-400 font-bold underline decoration-rose-500/50">{text}</span>;
    }
    if (/^ip\s+(address|route|access-list|http)\b/i.test(trimmed)) {
      return <span className="text-sky-300">{text}</span>;
    }
    if (/^snmp-server\b/i.test(trimmed)) {
      return <span className="text-purple-300">{text}</span>;
    }

    return <span className="text-slate-200">{text}</span>;
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
      {/* Header Controls */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-slate-300 px-2 py-0.5 rounded bg-slate-800">
            running-config
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {lines.length} Satır &bull; {flaggedLineMap.size} Zafiyetli Satır Vurgulandı
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Konfigürasyonda ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1 focus:outline-none focus:border-cyan-500 font-mono w-48 sm:w-64"
            />
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
            title="Konfigürasyonu kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
          </button>
        </div>
      </div>

      {/* Code Viewer Body */}
      <div className="flex-1 overflow-auto font-mono text-xs p-4 bg-slate-950 select-text leading-relaxed">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const associatedFindings = flaggedLineMap.get(lineNum);
          const isFlagged = associatedFindings && associatedFindings.length > 0;
          const isSearchMatch = search && line.toLowerCase().includes(search.toLowerCase());

          return (
            <div
              key={idx}
              className={`flex items-start group hover:bg-slate-900/60 rounded px-1 transition-colors ${
                isFlagged ? 'bg-rose-950/20 border-l-2 border-rose-500 pl-2' : ''
              } ${isSearchMatch ? 'bg-cyan-950/40 ring-1 ring-cyan-500/40' : ''}`}
            >
              {/* Line number */}
              <span className="w-10 shrink-0 text-slate-600 select-none text-right pr-4 font-mono group-hover:text-slate-400">
                {lineNum}
              </span>

              {/* Line content */}
              <div className="flex-1 whitespace-pre overflow-x-visible">
                {renderLineContent(line)}
              </div>

              {/* Warning badge if flagged */}
              {isFlagged && (
                <div className="ml-2 shrink-0 flex items-center gap-1 text-[10px] text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/80">
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="hidden sm:inline">{associatedFindings[0].title}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
