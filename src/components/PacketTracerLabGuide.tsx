import React, { useState } from 'react';
import { Cpu, CheckCircle2, Terminal, Shield, ArrowRight, Copy, Check, Play, HelpCircle } from 'lucide-react';

interface VerificationStep {
  title: string;
  command: string;
  expectedOutput: string;
}

interface PacketTracerLabGuideProps {
  guide?: {
    overview: string;
    steps: VerificationStep[];
  };
}

export const PacketTracerLabGuide: React.FC<PacketTracerLabGuideProps> = ({ guide }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const defaultSteps: VerificationStep[] = guide?.steps || [
    {
      title: '1. SSHv2 Yapılandırmasını ve Şifrelenmiş Durumu Doğrulayın',
      command: 'show ip ssh',
      expectedOutput: 'SSH Enabled - version 2.0\nAuthentication timeout: 60 secs; Authentication retries: 3',
    },
    {
      title: '2. VTY Hatlarında Telnet Engellemesini ve SSH Zorunluluğunu Kontrol Edin',
      command: 'show line vty 0 4',
      expectedOutput: 'Allowed input transports are ssh.\nAllowed output transports are none.',
    },
    {
      title: '3. Açık HTTP / Web Yönetim Portunun Kapandığını Doğrulayın',
      command: 'show ip http server status',
      expectedOutput: 'HTTP server is disabled\nHTTP secure server is disabled (or enabled with TLS)',
    },
    {
      title: '4. VTY ve WAN Filtreleme ACL Kurallarının Eşleşmelerini İnceleyin',
      command: 'show access-lists',
      expectedOutput: 'Standard IP access list YONETIM_IZIN_VTY\n  10 permit 192.168.1.0, wildcard bits 0.0.0.255 (match count ...)\n  20 deny any log',
    },
    {
      title: '5. Şifrelerin Açık Metin Kalmadığını ve SHA256/Secret Olduğunu Doğrulayın',
      command: 'show running-config | include (secret|password)',
      expectedOutput: 'enable secret 8 $8$... (Açık metin "password" bulunmamalıdır)',
    },
  ];

  const stepsToDisplay = guide?.steps && guide.steps.length > 0 ? guide.steps : defaultSteps;

  const toggleComplete = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const copyCommand = (cmd: string, idx: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Cisco Packet Tracer Doğrulama &amp; Test Laboratuvarı</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                PT 7.x / 8.x
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hardening komutlarını uyguladıktan sonra laboratuvar ortamında güvenliği test etme yönergeleri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <span>İlerleme:</span>
          <span className="text-emerald-400 font-bold">
            {completedSteps.size} / {stepsToDisplay.length} Adım
          </span>
        </div>
      </div>

      {/* Guide Overview */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
        <h4 className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
          <Terminal className="w-3.5 h-3.5" />
          <span>Packet Tracer'da Hardening Nasıl Uygulanır?</span>
        </h4>
        <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>Packet Tracer topolojinizde ilgili <strong>Router</strong> veya <strong>Switch</strong> cihazına tıklayın.</li>
          <li>Açılan pencerede <strong>CLI</strong> sekmesine geçin ve <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">enable</code> moduna geçin.</li>
          <li>"Düzeltme CLI Scripti" sekmesindeki komutları kopyalayıp CLI altındaki <strong>Paste</strong> butonuna tıklayarak yapıştırın.</li>
          <li>Aşağıdaki adımları sırayla çalıştırarak güvenlik açıklarının başarıyla kapatıldığını teyit edin.</li>
        </ol>
      </div>

      {/* Verification Steps List */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
          Güvenlik Doğrulama Adımları &amp; Beklenen Çıktılar:
        </h4>

        <div className="space-y-3">
          {stepsToDisplay.map((step, idx) => {
            const isCompleted = completedSteps.has(idx);
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-800/60'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleComplete(idx)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-700 hover:border-slate-500 bg-slate-900'
                      }`}
                      title={isCompleted ? 'Tamamlandı olarak işaretlendi' : 'Tamamlandı olarak işaretle'}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <span className="text-xs font-semibold text-slate-200">{step.title}</span>
                  </div>

                  <button
                    onClick={() => copyCommand(step.command, idx)}
                    className="px-2 py-1 text-[11px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1 transition"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Komutu Kopyala</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Command & Output block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Cisco IOS Doğrulama Komutu:</span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                      {step.command}
                    </pre>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Beklenen Güvenli Çıktı:</span>
                    <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400/90 overflow-x-auto whitespace-pre-wrap">
                      {step.expectedOutput}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packet Tracer Simulation Mode Tips */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-cyan-950/20 border border-blue-900/40 text-xs text-slate-300 space-y-2">
        <h5 className="font-semibold text-cyan-400 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4" />
          <span>Packet Tracer "Simulation Mode" ile Atak &amp; Savunma Testi:</span>
        </h5>
        <p className="leading-relaxed">
          Packet Tracer'da sağ alttaki <strong>Simulation (Shift+S)</strong> moduna geçerek istemci PC'den router'a doğru bir Telnet paketi gönderin. Router VTY arayüzünde paketin <span className="text-rose-400 font-bold">[X]</span> ile reddedildiğini ve sadece SSH (TCP 22) paketlerine yanıt verildiğini paket filtreleme animasyonuyla canlı olarak gözlemleyebilirsiniz.
        </p>
      </div>
    </div>
  );
};
