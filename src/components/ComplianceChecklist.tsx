import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Search, Filter } from 'lucide-react';
import { ComplianceItem } from '../types/cisco';

interface ComplianceChecklistProps {
  items: ComplianceItem[];
}

export const ComplianceChecklist: React.FC<ComplianceChecklistProps> = ({ items }) => {
  const [filter, setFilter] = useState<'ALL' | 'PASSED' | 'FAILED' | 'WARNING'>('ALL');
  const [search, setSearch] = useState('');

  const filteredItems = items.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch =
      search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.control.toLowerCase().includes(search.toLowerCase()) ||
      item.rationale.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const passedCount = items.filter((i) => i.status === 'PASSED').length;
  const failedCount = items.filter((i) => i.status === 'FAILED').length;
  const warningCount = items.filter((i) => i.status === 'WARNING').length;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>CIS Cisco IOS Benchmark &amp; NSA Uyum Matrisi</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Level 1 &amp; 2
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Uluslararası siber güvenlik standartları ve en iyi hardening uygulamalarına uyumluluk denetimi
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {passedCount} Başarılı
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/80 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {failedCount} Başarısız
          </span>
          {warningCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-yellow-950/80 text-yellow-400 border border-yellow-800/80 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> {warningCount} Uyarı
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tümü ({items.length})
          </button>
          <button
            onClick={() => setFilter('PASSED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'PASSED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Geçenler ({passedCount})
          </button>
          <button
            onClick={() => setFilter('FAILED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'FAILED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Başarısız ({failedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Kontrol ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 placeholder-slate-600 font-mono"
          />
        </div>
      </div>

      {/* Checklist Table / Cards */}
      <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
        {filteredItems.map((item) => {
          const isPassed = item.status === 'PASSED';
          const isFailed = item.status === 'FAILED';

          return (
            <div
              key={item.id}
              className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors ${
                isFailed ? 'bg-rose-950/10' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isFailed ? (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded text-[10px]">
                      {item.control}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.standard}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-200">{item.title}</h4>
                  <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                    {item.rationale}
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    isPassed
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                      : isFailed
                      ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                      : 'bg-yellow-950/80 text-yellow-400 border-yellow-800/80'
                  }`}
                >
                  {isPassed ? 'UYUMLU' : isFailed ? 'UYUMSUZ' : 'DİKKAT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
