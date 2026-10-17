import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, ShieldCheck, FileText, SplitSquareVertical } from 'lucide-react';

interface HardenedDiffViewerProps {
  originalConfig: string;
  hardenedConfig: string;
  cliScript: string;
  hostname?: string;
}

export const HardenedDiffViewer: React.FC<HardenedDiffViewerProps> = ({
  originalConfig,
  hardenedConfig,
  cliScript,
  hostname = 'Router',
}) => {
  const [activeTab, setActiveTab] = useState<'script' | 'hardened' | 'split'>('script');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(cliScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(hardenedConfig);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([hardenedConfig], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${hostname || 'cisco-device'}-hardened.cfg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[700px]">
      {/* Header bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('script')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'script'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Cisco CLI Düzeltme Komutları (Fix Script)
          </button>

          <button
            onClick={() => setActiveTab('hardened')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'hardened'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Tam Sertleştirilmiş .cfg
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`hidden md:flex px-3 py-1.5 rounded-lg text-xs font-medium transition items-center gap-1.5 ${
              activeTab === 'split'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Yan Yana Karşılaştırma (Diff)
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'script' ? (
            <button
              onClick={handleCopyScript}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition shadow"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Kopyalandı!' : 'CLI Scriptini Kopyala'}</span>
            </button>
          ) : (
            <button
              onClick={handleCopyConfig}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              {copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedConfig ? 'Kopyalandı!' : 'Tüm .cfg Kopyala'}</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 transition shadow"
            title="Sertleştirilmiş yapılandırma dosyasını (.cfg) indir"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">.cfg İndir</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs">
        {/* Tab 1: Terminal Copy-Paste Fix Script */}
        {activeTab === 'script' && (
          <div className="p-4 space-y-3">
            <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-3 text-cyan-300 text-xs flex items-center justify-between">
              <div>
                <p className="font-semibold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  Packet Tracer veya Gerçek Cihaz Terminaline Yapıştırın
                </p>
                <p className="text-[11px] text-cyan-400/80 mt-0.5">
                  Cisco Packet Tracer CLI sekmesinde 'enable' yazdıktan sonra bu komut bloğunu doğrudan 'Paste' butonuna basarak uygulayabilirsiniz.
                </p>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all overflow-x-auto shadow-inner">
              {cliScript || `configure terminal
! Hardening Script
service password-encryption
enable algorithm-type sha256 secret GucluParola2026!
no ip http server
line vty 0 4
 transport input ssh
 exec-timeout 5 0
end
write memory`}
            </pre>
          </div>
        )}

        {/* Tab 2: Full Hardened Config */}
        {activeTab === 'hardened' && (
          <div className="p-4">
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto select-all">
              {hardenedConfig}
            </pre>
          </div>
        )}

        {/* Tab 3: Split Diff */}
        {activeTab === 'split' && (
          <div className="grid grid-cols-2 divide-x divide-slate-800 h-full">
            {/* Original Column */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-4 py-2 bg-rose-950/30 border-b border-slate-800 text-rose-400 font-semibold text-xs flex items-center justify-between">
                <span>Orijinal (Zafiyetli) Konfigürasyon</span>
                <span className="text-[10px] text-rose-400/70 font-mono">Eski</span>
              </div>
              <div className="flex-1 overflow-auto p-4 text-slate-400 font-mono text-xs leading-relaxed whitespace-pre">
                {originalConfig}
              </div>
            </div>

            {/* Hardened Column */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="px-4 py-2 bg-emerald-950/30 border-b border-slate-800 text-emerald-400 font-semibold text-xs flex items-center justify-between">
                <span>Sertleştirilmiş (CIS / NSA Uyumlu) Konfigürasyon</span>
                <span className="text-[10px] text-emerald-400/70 font-mono">Yeni</span>
              </div>
              <div className="flex-1 overflow-auto p-4 text-emerald-300 font-mono text-xs leading-relaxed whitespace-pre">
                {hardenedConfig}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
