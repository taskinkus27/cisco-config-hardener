import React from 'react';
import { X, BookOpen, Terminal, ShieldCheck, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cisco Packet Tracer Güvenlik &amp; Hardening Rehberi</h3>
              <p className="text-[11px] text-slate-400">Denetleyici nasıl kullanılır ve yapılandırmalar nasıl aktarılır?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              1. Packet Tracer'dan Konfigürasyon Dosyası (.cfg) Nasıl Alınır?
            </h4>
            <p>
              Cisco Packet Tracer üzerinde yapılandırdığınız bir Router veya Switch'in konfigürasyonunu sisteme aktarmak için 2 basit yol vardır:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300">
              <li>
                <strong>Yöntem A (En Pratik):</strong> Cihaza tıklayın &gt; <strong>CLI</strong> sekmesine geçin &gt; <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 font-mono">show running-config</code> komutunu çalıştırın. Çıkan tüm metni seçip kopyalayın ve bu araçtaki <strong>"Metin / Düzenle"</strong> alanına yapıştırın.
              </li>
              <li>
                <strong>Yöntem B (Dosya Yükleme):</strong> Router üzerinde <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 font-mono">copy running-config startup-config</code> yaptıktan sonra Paket Tracer TFTP sunucusuna yedekleyin veya cihazın Config sekmesinden dışa aktarılan <code className="text-cyan-400">.cfg</code> dosyasını sürükleyip bırakın.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              2. Bu Denetleyici Hangi Güvenlik Açıklarını Yakalar?
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-rose-400 font-bold block mb-1">&bull; Açık Metin Parolalar:</span>
                "enable password" ve kırılması kolay Type 7 şifreleme.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">&bull; Şifrelenmemiş Telnet:</span>
                VTY hatlarında transport input telnet ile Wireshark koklamasına açık yönetim.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-yellow-400 font-bold block mb-1">&bull; Güvensiz HTTP Sunucusu:</span>
                "ip http server" komutu ile uzaktan yönetim zaafiyeti (CVE-2023-20198).
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">&bull; Varsayılan SNMP Toplulukları:</span>
                "public" ve "private" ile yetkisiz cihaz bilgisi okuma/yazma.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">&bull; Eksik Yönetim ACLleri:</span>
                VTY hatlarında "access-class" olmadan tüm alt ağlardan kaba kuvvet saldırı riski.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">&bull; Sahte IP (uRPF) Eksikliği:</span>
                Dış arayüzlerde RFC1918 ve IP spoofing koruması eksikliği.
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-cyan-400 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              3. Sertleştirilmiş (Hardened) Konfigürasyon Packet Tracer'a Nasıl Geri Yüklenir?
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-300">
              <li>Denetim tamamlandıktan sonra <strong>"Düzeltme CLI Scripti"</strong> butonuna tıklayın.</li>
              <li>Packet Tracer'daki Router veya Switch CLI sekmesine geçin.</li>
              <li><code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 font-mono">Router# configure terminal</code> yazıp CLI penceresindeki <strong>Paste</strong> butonuna tıklayın.</li>
              <li>Komutlar uygulandıktan sonra <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 font-mono">write memory</code> veya <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 font-mono">copy run start</code> ile kaydedin.</li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
