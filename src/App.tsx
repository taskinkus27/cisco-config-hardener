import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileCode,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Bot,
  SplitSquareVertical,
  Download,
  Share2,
  RefreshCw,
  Printer
} from 'lucide-react';
import { Header } from './components/Header';
import { ConfigInput } from './components/ConfigInput';
import { AuditSummary } from './components/AuditSummary';
import { VulnerabilityList } from './components/VulnerabilityList';
import { ConfigViewer } from './components/ConfigViewer';
import { HardenedDiffViewer } from './components/HardenedDiffViewer';
import { PacketTracerLabGuide } from './components/PacketTracerLabGuide';
import { ComplianceChecklist } from './components/ComplianceChecklist';
import { CopilotChat } from './components/CopilotChat';
import { HelpModal } from './components/HelpModal';
import { SAMPLE_CONFIGS } from './data/sampleConfigs';
import { AuditResult } from './types/cisco';
import { parseCiscoConfig } from './utils/ciscoParser';

export default function App() {
  const [configText, setConfigText] = useState<string>(SAMPLE_CONFIGS[0].content);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('Router');
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'vulnerabilities' | 'config' | 'diff' | 'ptLab' | 'compliance' | 'copilot'>('vulnerabilities');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Automatically run initial audit on mount for a zero-empty-state experience
  useEffect(() => {
    runAudit();
  }, []);

  const runAudit = async () => {
    if (!configText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configContent: configText,
          deviceType: selectedDeviceType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Denetim API yanıt vermedi (HTTP ${response.status})`);
      }

      const data = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      console.warn('API Denetim hatası, yerel kural motoruna geçiliyor:', err);
      // Fallback: Run deterministic scanner with rich default schema
      const parsed = parseCiscoConfig(configText);
      const criticals = parsed.heuristicFindings.filter((f) => f.severity === 'CRITICAL').length;
      const highs = parsed.heuristicFindings.filter((f) => f.severity === 'HIGH').length;
      const score = Math.max(10, 100 - criticals * 25 - highs * 15 - parsed.heuristicFindings.length * 5);

      const fallbackResult: AuditResult = {
        score,
        grade: score >= 85 ? 'A' : score >= 65 ? 'B' : score >= 45 ? 'C' : 'F',
        riskLevel: score >= 80 ? 'LOW' : score >= 60 ? 'MODERATE' : score >= 40 ? 'HIGH' : 'CRITICAL',
        summary: `Yerel Cisco IOS Kural Motoru tarafından ${parsed.heuristicFindings.length} adet güvenlik bulgusu tespit edildi. Cihazda düz metin parola ve güvensiz servisler mevcuttur.`,
        deviceMetadata: parsed.metadata,
        findings: parsed.heuristicFindings,
        complianceChecklist: [
          {
            id: 'CIS-1.1.1',
            standard: 'CIS Cisco IOS Benchmark',
            control: '1.1.1',
            title: 'Enable Secret Algoritması Kullanımı',
            status: configText.includes('enable secret') ? 'PASSED' : 'FAILED',
            rationale: 'Enable parolası güçlü sha256 veya scrypt algoritması ile saklanmalıdır.',
          },
          {
            id: 'CIS-2.2.1',
            standard: 'CIS Cisco IOS Benchmark',
            control: '2.2.1',
            title: 'VTY Hatlarında Telnet Engellenmesi & SSH Zorunluluğu',
            status: configText.includes('transport input ssh') && !configText.includes('telnet') ? 'PASSED' : 'FAILED',
            rationale: 'Yönetim oturumları ağda şifrelenmemiş Telnet yerine daima SSHv2 ile gerçekleştirilmelidir.',
          },
          {
            id: 'CIS-2.1.1',
            standard: 'CIS Cisco IOS Benchmark',
            control: '2.1.1',
            title: 'ip http server Devre Dışı Bırakılması',
            status: !configText.includes('ip http server') || configText.includes('no ip http server') ? 'PASSED' : 'FAILED',
            rationale: 'Güvensiz HTTP sunucusu kapatılmalı veya HTTPS güvenli sunucuya dönüştürülmelidir.',
          },
        ],
        hardeningCliScript: `configure terminal
! Cisco IOS Güvenlik Sertleştirme Scripti
service password-encryption
no enable password
enable algorithm-type sha256 secret GucluParola2026!
no ip http server
no ip source-route
ip domain-name sirket.local
crypto key generate rsa modulus 2048
ip ssh version 2
banner motd #
*************************************************************
* YASAL UYARI: Bu sisteme sadece yetkili personelin erisimi *
* serbesttir. Tum oturumlar izlenmekte ve loglanmaktadir.   *
*************************************************************
#
line con 0
 exec-timeout 5 0
line vty 0 4
 transport input ssh
 exec-timeout 5 0
end
write memory`,
        hardenedConfigFile: `! Sertleştirilmiş Cisco IOS Yapılandırması\nversion 15.4\nservice timestamps log datetime msec\nservice password-encryption\nhostname ${parsed.metadata.hostname || 'Router'}\nenable algorithm-type sha256 secret GucluParola2026!\nno ip http server\nline vty 0 4\n transport input ssh\n exec-timeout 5 0\nend`,
        packetTracerVerificationGuide: {
          overview: 'Packet Tracer CLI ekranında show ip ssh ve show access-lists komutlarıyla güvenliği test edin.',
          steps: [
            {
              title: 'SSH Durumunu Kontrol Edin',
              command: 'show ip ssh',
              expectedOutput: 'SSH Enabled - version 2.0',
            },
            {
              title: 'Açık Metin Parolaların Maskelendiğini Teyit Edin',
              command: 'show run | include (secret|password)',
              expectedOutput: 'enable secret ... (açık metin parola görünmemelidir)',
            },
          ],
        },
        stats: {
          criticalCount: criticals,
          highCount: highs,
          mediumCount: parsed.heuristicFindings.filter((f) => f.severity === 'MEDIUM').length,
          lowCount: parsed.heuristicFindings.filter((f) => f.severity === 'LOW').length,
          infoCount: 0,
          passedCount: 2,
        },
      };

      setAuditResult(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadHardenedFile = () => {
    if (!auditResult) return;
    const blob = new Blob([auditResult.hardenedConfigFile], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${auditResult.deviceMetadata.hostname || 'cisco-router'}-hardened.cfg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCliScript = () => {
    if (!auditResult) return;
    navigator.clipboard.writeText(auditResult.hardeningCliScript);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* App Header */}
      <Header onOpenHelp={() => setIsHelpOpen(true)} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification if any */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-4 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Input & File Selector Section */}
        <section>
          <ConfigInput
            configText={configText}
            setConfigText={setConfigText}
            onAudit={runAudit}
            isLoading={isLoading}
            selectedDeviceType={selectedDeviceType}
            setSelectedDeviceType={setSelectedDeviceType}
          />
        </section>

        {/* Audit Results Dashboard */}
        {auditResult && (
          <section className="space-y-6 animate-fade-in">
            {/* Top Security Score & Device Stats */}
            <AuditSummary
              auditResult={auditResult}
              onDownloadHardenedConfig={downloadHardenedFile}
              onCopyCliScript={copyCliScript}
            />

            {/* Navigation Tabs Bar */}
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-1.5 flex flex-wrap items-center gap-1.5 shadow-md">
              <button
                onClick={() => setActiveTab('vulnerabilities')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'vulnerabilities'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Güvenlik Açıkları ({auditResult.findings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'config'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCode className="w-4 h-4" />
                <span>İnteraktif Konfigürasyon Görüntüleyici</span>
              </button>

              <button
                onClick={() => setActiveTab('diff')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'diff'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <SplitSquareVertical className="w-4 h-4" />
                <span>Hardening CLI Script &amp; Diff</span>
              </button>

              <button
                onClick={() => setActiveTab('ptLab')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'ptLab'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Packet Tracer Test Rehberi</span>
              </button>

              <button
                onClick={() => setActiveTab('compliance')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'compliance'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>CIS &amp; NSA Uyum Matrisi</span>
              </button>

              <button
                onClick={() => setActiveTab('copilot')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'copilot'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Güvenlik Copilotu (Gemini AI)</span>
              </button>

              <div className="ml-auto hidden sm:flex items-center gap-1">
                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-1"
                  title="Güvenlik Raporunu Yazdır / PDF olarak kaydet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır / PDF</span>
                </button>
              </div>
            </div>

            {/* Active Tab Views */}
            <div className="transition-all">
              {activeTab === 'vulnerabilities' && (
                <VulnerabilityList findings={auditResult.findings} />
              )}

              {activeTab === 'config' && (
                <ConfigViewer configText={configText} findings={auditResult.findings} />
              )}

              {activeTab === 'diff' && (
                <HardenedDiffViewer
                  originalConfig={configText}
                  hardenedConfig={auditResult.hardenedConfigFile}
                  cliScript={auditResult.hardeningCliScript}
                  hostname={auditResult.deviceMetadata.hostname}
                />
              )}

              {activeTab === 'ptLab' && (
                <PacketTracerLabGuide guide={auditResult.packetTracerVerificationGuide} />
              )}

              {activeTab === 'compliance' && (
                <ComplianceChecklist items={auditResult.complianceChecklist} />
              )}

              {activeTab === 'copilot' && (
                <CopilotChat
                  configContext={configText}
                  findingsSummary={auditResult.summary}
                />
              )}
            </div>
          </section>
        )}
      </main>

      {/* Quick Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
