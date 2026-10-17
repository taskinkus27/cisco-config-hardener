import React, { useState, useRef, ChangeEvent } from 'react';
import { Upload, FileCode, Play, Sparkles, CheckCircle2, AlertCircle, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { SAMPLE_CONFIGS, SampleConfig } from '../data/sampleConfigs';

interface ConfigInputProps {
  configText: string;
  setConfigText: (val: string) => void;
  onAudit: () => void;
  isLoading: boolean;
  selectedDeviceType: string;
  setSelectedDeviceType: (val: string) => void;
}

export const ConfigInput: React.FC<ConfigInputProps> = ({
  configText,
  setConfigText,
  onAudit,
  isLoading,
  selectedDeviceType,
  setSelectedDeviceType,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'paste' | 'upload'>('presets');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lineCount = configText ? configText.split(/\r?\n/).length : 0;
  const charCount = configText.length;

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setConfigText(content);
        setActiveTab('paste');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const selectPreset = (preset: SampleConfig) => {
    setConfigText(preset.content);
    setSelectedDeviceType(preset.deviceType);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-4 sm:px-6 py-3 bg-slate-950/60 gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Örnek Lab Senaryoları
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Metin / Düzenle
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Dosya Yükle (.cfg / .txt)
          </button>
        </div>

        {/* Device Type Select */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 hidden sm:inline">Cihaz Türü:</span>
          <select
            value={selectedDeviceType}
            onChange={(e) => setSelectedDeviceType(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
          >
            <option value="Router">Cisco Router (2911, 4321 vb.)</option>
            <option value="Switch">Cisco Switch (Catalyst 2960/3560)</option>
            <option value="Multilayer Switch">Multilayer Switch (L3 Switch)</option>
            <option value="Firewall">Cisco ASA / FTD Firewall</option>
          </select>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Preset Cards Tab */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Analiz etmek veya Packet Tracer laboratuvarında test etmek için hazır bir Cisco konfigürasyonu seçin:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAMPLE_CONFIGS.map((sample) => {
                const isSelected = configText.trim() === sample.content.trim();
                return (
                  <div
                    key={sample.id}
                    onClick={() => selectPreset(sample)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition text-left flex flex-col justify-between group ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300 transition flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          {sample.name}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            sample.expectedRisk.includes('Kritik')
                              ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                              : sample.expectedRisk.includes('Yüksek')
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          }`}
                        >
                          {sample.expectedRisk}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {sample.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{sample.deviceType}</span>
                      <span className="text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        {isSelected ? 'Seçildi' : 'Konfigürasyonu Yükle'} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-700/80 hover:border-slate-600 bg-slate-950/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".cfg,.txt,.ios,.pt,.conf"
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                Cisco .cfg veya .txt dosyasını buraya sürükleyin
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Packet Tracer'dan dışa aktarılan veya yedeklenen running-config / startup-config dosyaları desteklenir.
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
            >
              Dosya Seçin
            </button>
          </div>
        )}

        {/* Text Area & Code Editor View */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1.5 px-1 font-mono">
            <span>Cisco IOS Yapılandırma Metni:</span>
            <span>
              {lineCount} Satır &bull; {charCount} Karakter
            </span>
          </div>
          <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
            <textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              placeholder="Cisco 'show running-config' veya .cfg dosya içeriğini buraya yapıştırın... (Örn: hostname Router, enable password cisco, transport input telnet...)"
              className="w-full h-64 p-4 bg-transparent text-slate-200 placeholder-slate-600 resize-y focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed font-mono"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Action Button & Telemetry */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Şifrelenmemiş şifreler, VTY Telnet, zayıf SNMP, eksik ACL ve CIS zafiyetleri taranır.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {configText.trim().length > 0 && (
              <button
                type="button"
                onClick={() => setConfigText('')}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl border border-slate-800 transition"
              >
                Temizle
              </button>
            )}
            <button
              type="button"
              disabled={isLoading || !configText.trim()}
              onClick={onAudit}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-lg ${
                isLoading || !configText.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-cyan-500/20 active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Gemini Güvenlik Taraması Yapıyor...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Güvenlik Denetimini Başlat</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
