import React from 'react';
import { ShieldCheck, Terminal, Cpu, BookOpen, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenHelp }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Cisco<span className="text-cyan-400 font-mono">SecAudit</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Packet Tracer &amp; IOS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Router &amp; Switch Konfigürasyon Güvenlik ve Hardening Denetleyicisi
              </p>
            </div>
          </div>

          {/* Badges & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gemini 3.8 Flash Engine</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>CIS Benchmark v4.1 &amp; NSA</span>
            </div>

            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
              title="Kullanım Rehberi & Bilgi"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Rehber</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
