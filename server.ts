import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cisco Security Audit Endpoint
app.post('/api/audit', async (req, res) => {
  try {
    const { configContent, deviceType = 'Router' } = req.body;

    if (!configContent || typeof configContent !== 'string' || !configContent.trim()) {
      return res.status(400).json({ error: 'Konfigürasyon içeriği boş olamaz.' });
    }

    const systemPrompt = `Sen kıdemli bir Ağ Güvenlik Mimarı (Senior Cisco Network Security Architect) ve CCIE Güvenlik denetçisisin.
Görevin: Verilen Cisco IOS / Cisco Packet Tracer (.cfg, startup-config, running-config) yapılandırma dosyasını derinlemesine denetlemek.

Aşağıdaki güvenlik alanlarını incele:
1. Kimlik Doğrulama & Parolalar (Plaintext 'enable password', Type 7 şifreler, eksik 'service password-encryption', eksik secret algoritmaları, varsayılan kullanıcılar).
2. Uzak Erişim & Hatlar (Telnet açık mı? SSHv2 zorunlu mu? VTY hatlarında 'access-class' ACL koruması var mı? 'exec-timeout' zaman aşımı var mı? Konsol ve AUX hatları korunuyor mu?).
3. Ağ Servisleri & Kontrol Düzlemi ('ip http server' açık mı? CDP/LLDP kontrolsüz veya dış arayüzde mi? Gereksiz küçük servisler açık mı: finger, udp-small-servers? Varsayılan SNMP community: public/private?).
4. ACL & Güvenlik Duvarı Filtreleri (Sahte IP koruması - uRPF var mı? RFC1918 anti-spoofing filtreleri, dış arayüzlerde ingress/egress ACL var mı?).
5. L2 Anahtarlama & VLAN Güvenliği (Eğer switch ise: VLAN 1 yönetimde mi? Port-security var mı? DTP trunking dinamik mi? Spanning-tree BPDU guard var mı?).
6. Yasal Uyarı & Loglama (Banner MOTD var mı? 'service timestamps log datetime msec' aktif mi?).

Analiz sonucunda tam ve geçerli bir JSON yanıt üret. Yanıtta:
- score: 0 ile 100 arasında bir güvenlik puanı (100 en güvenli, 0 tamamen açık).
- grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
- riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW'
- summary: 2-3 cümlelik Türkçe yönetici özeti.
- deviceMetadata: { hostname, deviceType, iosVersion, interfacesDetected: [], linesDetected: [], aclsDetected: [], snmpCommunitiesDetected: [] }
- findings: dizi. Her eleman:
  * id: tekil string (örn: 'FIND-001')
  * title: Açıklayıcı Türkçe başlık
  * severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  * category: 'AUTHENTICATION' | 'MANAGEMENT_ACCESS' | 'NETWORK_SERVICES' | 'FIREWALL_ACL' | 'LOGGING_MONITORING' | 'LAYER2_SWITCHING' | 'ROUTING_PROTOCOL'
  * flaggedCode: Konfigürasyondaki ilgili zafiyetli satır(lar)
  * cveOrCisRef: İlgili CIS Cisco IOS Benchmark referansı veya CWE/CVE kodu
  * riskExplanation: Saldırganın bu zafiyeti nasıl suistimal edebileceğine dair teknik Türkçe açıklama
  * remediationCommand: Düzeltmek için girilmesi gereken kesin Cisco IOS komutları
  * packetTracerImpact: Bu zafiyetin Cisco Packet Tracer simülasyonundaki davranışı ve etkisi
- complianceChecklist: CIS / NSA kontrol listesi elemanları (CIS 1.1.1, CIS 2.2.1 vb., status: 'PASSED' | 'FAILED' | 'WARNING')
- hardeningCliScript: Cisco IOS terminaline doğrudan kopyalanıp yapıştırılabilecek tam düzeltme scripti (configure terminal ile başlayan)
- hardenedConfigFile: Orijinal konfigürasyonun tüm zafiyetleri düzeltilmiş, temiz, açıklamalı tam hali (.cfg)
- packetTracerVerificationGuide: {
    overview: Packet Tracer laboratuvarında test etme adımları özeti,
    steps: [{ title, command, expectedOutput }]
  }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Lütfen aşağıdaki Cisco IOS / Packet Tracer konfigürasyonunu denetle:\n\n\`\`\`cisco\n${configContent}\n\`\`\``,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: '0 to 100 security score' },
            grade: { type: Type.STRING, description: 'A+, A, B, C, D, or F' },
            riskLevel: { type: Type.STRING, description: 'CRITICAL, HIGH, ELEVATED, MODERATE, or LOW' },
            summary: { type: Type.STRING, description: 'Executive summary in Turkish' },
            deviceMetadata: {
              type: Type.OBJECT,
              properties: {
                hostname: { type: Type.STRING },
                deviceType: { type: Type.STRING },
                iosVersion: { type: Type.STRING },
                interfacesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
                linesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
                aclsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
                snmpCommunitiesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  category: { type: Type.STRING },
                  flaggedCode: { type: Type.STRING },
                  cveOrCisRef: { type: Type.STRING },
                  riskExplanation: { type: Type.STRING },
                  remediationCommand: { type: Type.STRING },
                  packetTracerImpact: { type: Type.STRING },
                },
                required: ['id', 'title', 'severity', 'category', 'riskExplanation', 'remediationCommand'],
              },
            },
            complianceChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  standard: { type: Type.STRING },
                  control: { type: Type.STRING },
                  title: { type: Type.STRING },
                  status: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                },
                required: ['id', 'standard', 'control', 'title', 'status', 'rationale'],
              },
            },
            hardeningCliScript: { type: Type.STRING, description: 'Cisco CLI copy-paste commands to apply the fix' },
            hardenedConfigFile: { type: Type.STRING, description: 'Complete hardened Cisco .cfg text' },
            packetTracerVerificationGuide: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      command: { type: Type.STRING },
                      expectedOutput: { type: Type.STRING },
                    },
                    required: ['title', 'command', 'expectedOutput'],
                  },
                },
              },
              required: ['overview', 'steps'],
            },
          },
          required: [
            'score',
            'grade',
            'riskLevel',
            'summary',
            'findings',
            'complianceChecklist',
            'hardeningCliScript',
            'hardenedConfigFile',
            'packetTracerVerificationGuide',
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');

    // Calculate statistics
    const findings = parsedJson.findings || [];
    const stats = {
      criticalCount: findings.filter((f: any) => f.severity === 'CRITICAL').length,
      highCount: findings.filter((f: any) => f.severity === 'HIGH').length,
      mediumCount: findings.filter((f: any) => f.severity === 'MEDIUM').length,
      lowCount: findings.filter((f: any) => f.severity === 'LOW').length,
      infoCount: findings.filter((f: any) => f.severity === 'INFO').length,
      passedCount: (parsedJson.complianceChecklist || []).filter((c: any) => c.status === 'PASSED').length,
    };

    return res.json({
      ...parsedJson,
      stats,
    });
  } catch (error: any) {
    console.error('Audit Error:', error);
    res.status(500).json({
      error: 'Güvenlik analizi sırasında bir hata oluştu: ' + (error?.message || String(error)),
    });
  }
});

// Interactive Network Security Copilot Endpoint
app.post('/api/copilot', async (req, res) => {
  try {
    const { question, configContext, findingsSummary } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Soru metni gereklidir.' });
    }

    const prompt = `Sen uzman bir Cisco Ağ Güvenlik Danışmanı (CCIE Security Consultant) ve Cisco Packet Tracer eğitmenisin.
Kullanıcının Cisco ağ güvenliği, router/switch hardening, Packet Tracer simülasyonları veya tespit edilen güvenlik açıkları hakkındaki sorusunu yanıtla.

Mevcut Ağ Bağlamı:
${configContext ? `Mevcut Konfigürasyon Kesiti:\n\`\`\`cisco\n${configContext.slice(0, 3000)}\n\`\`\`` : 'Genel Cisco IOS ortamı'}
${findingsSummary ? `Tespit Edilen Zafiyet Özeti:\n${findingsSummary}` : ''}

Kullanıcı Sorusu:
"${question}"

Yanıtında:
- Doğrudan ve teknik olarak net ol.
- Gerektiğinde tam ve test edilmiş Cisco IOS CLI komut blokları (\`\`\`cisco ... \`\`\`) ver.
- Packet Tracer laboratuvarında nasıl test edileceğini veya doğrulanacağını açıkla.
- Yanıtını Türkçe olarak yaz.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Copilot Error:', error);
    res.status(500).json({ error: 'Copilot yanıtı oluşturulamadı: ' + (error?.message || String(error)) });
  }
});

// Serve frontend with Vite middlewares in dev, or dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cisco Security Auditor server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
