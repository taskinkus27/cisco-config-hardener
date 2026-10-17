import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Server,
  Network,
  Lock,
  Layers,
  FileCheck,
  AlertOctagon,
  FileDown
} from 'lucide-react';
import { AuditResult } from '../types/cisco';

interface AuditSummaryProps {
  auditResult: AuditResult;
  onDownloadHardenedConfig: () => void;
  onCopyCliScript: () => void;
}

export const AuditSummary: React.FC<AuditSummaryProps> = ({
  auditResult,
  onDownloadHardenedConfig,
  onCopyCliScript,
}) => {
  const [copied, setCopied] = useState(false);
  const { score, grade, riskLevel, summary, deviceMetadata, stats } = auditResult;

  const handleCopy = () => {
    onCopyCliScript();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreTheme = (s: number) => {
    if (s >= 85) {
      return {
        bg: 'from-emerald-500/20 to-teal-500/10',
        border: 'border-emerald-500/40',
        text: 'text-emerald-400',
        ring: 'stroke-emerald-500',
        badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
        label: 'Düşük Risk / Güvenli',
      };
    } else if (s >= 65) {
      return {
        bg: 'from-yellow-500/20 to-amber-500/10',
        border: 'border-yellow-500/40',
        text: 'text-yellow-400',
        ring: 'stroke-yellow-500',
        badge: 'bg-yellow-950/80 text-yellow-400 border-yellow-800/80',
        label: 'Orta Düzey Risk',
      };
    } else if (s >= 40) {
      return {
        bg: 'from-amber-500/20 to-orange-500/10',
        border: 'border-amber-500/40',
        text: 'text-amber-400',
        ring: 'stroke-amber-500',
        badge: 'bg-amber-950/80 text-amber-400 border-amber-800/80',
        label: 'Yüksek Risk',
      };
    } else {
      return {
        bg: 'from-rose-500/20 to-red-500/10',
        border: 'border-rose-500/40',
        text: 'text-rose-400',
        ring: 'stroke-rose-500',
        badge: 'bg-rose-950/80 text-rose-400 border-rose-800/80',
        label: 'Kritik Güvenlik Riski',
      };
    }
  };

  const theme = getScoreTheme(score);
  const strokeDashoffset = 283 - (283 * Math.min(score, 100)) / 100;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Top Banner with Score and Key Summary */}
      <div className={`p-6 bg-gradient-to-r ${theme.bg} border-b border-slate-800`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Radial Score Gauge */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-800/80"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className={`${theme.ring} transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black tracking-tight ${theme.text}`}>
                  {score}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}
                >
                  {riskLevel} &bull; Derece {grade}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {theme.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Cisco Cihaz Güvenlik Değerlendirmesi
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {summary}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
            <button
              onClick={onDownloadHardenedConfig}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Sertleştirilmiş .cfg İndir</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı!' : 'Düzeltme CLI Scripti'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Counters Breakdown & Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-800 bg-slate-950/40 border-b border-slate-800 text-center">
        <div className="p-3">
          <span className="text-[10px] uppercase font-bold text-rose-400 block">Kritik</span>
          <span className="text-xl font-mono font-bold text-rose-400">{stats.criticalCount}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] uppercase font-bold text-amber-400 block">Yüksek</span>
          <span className="text-xl font-mono font-bold text-amber-400">{stats.highCount}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] uppercase font-bold text-yellow-400 block">Orta</span>
          <span className="text-xl font-mono font-bold text-yellow-400">{stats.mediumCount}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] uppercase font-bold text-blue-400 block">Düşük</span>
          <span className="text-xl font-mono font-bold text-blue-400">{stats.lowCount}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] uppercase font-bold text-emerald-400 block">Başarılı Kontrol</span>
          <span className="text-xl font-mono font-bold text-emerald-400">{stats.passedCount}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Toplam Tespit</span>
          <span className="text-xl font-mono font-bold text-slate-200">
            {stats.criticalCount + stats.highCount + stats.mediumCount + stats.lowCount}
          </span>
        </div>
      </div>

      {/* Device Metadata Bar */}
      <div className="px-6 py-3 bg-slate-950/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-2 font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">Hostname:</span>
            <span className="text-slate-200 font-semibold">{deviceMetadata.hostname || 'Router'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500">Tür:</span>
            <span className="text-slate-200">{deviceMetadata.deviceType || 'Cisco IOS'}</span>
          </div>

          {deviceMetadata.iosVersion && (
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-500">IOS Sürümü:</span>
              <span className="text-slate-200">{deviceMetadata.iosVersion}</span>
            </div>
          )}

          {deviceMetadata.interfacesDetected && deviceMetadata.interfacesDetected.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-500">Arayüzler:</span>
              <span className="text-slate-200">{deviceMetadata.interfacesDetected.length} Adet</span>
            </div>
          )}
        </div>

        {deviceMetadata.snmpCommunitiesDetected && deviceMetadata.snmpCommunitiesDetected.length > 0 && (
          <div className="flex items-center gap-1.5 text-rose-400">
            <Lock className="w-3.5 h-3.5" />
            <span>SNMP: {deviceMetadata.snmpCommunitiesDetected.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
