import { AuditFinding, DeviceMetadata } from '../types/cisco';

export interface ParsedConfig {
  lines: string[];
  metadata: DeviceMetadata;
  heuristicFindings: AuditFinding[];
}

export function parseCiscoConfig(rawConfig: string): ParsedConfig {
  const lines = rawConfig.split(/\r?\n/);
  const metadata: DeviceMetadata = {
    interfacesDetected: [],
    linesDetected: [],
    aclsDetected: [],
    snmpCommunitiesDetected: [],
    deviceType: 'Router',
  };

  const heuristicFindings: AuditFinding[] = [];

  // Metadata extraction
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    // Hostname
    const hostMatch = line.match(/^hostname\s+([A-Za-z0-9_-]+)/i);
    if (hostMatch) {
      metadata.hostname = hostMatch[1];
    }

    // Version
    const verMatch = line.match(/^version\s+([0-9.]+)/i);
    if (verMatch) {
      metadata.iosVersion = verMatch[1];
    }

    // Interface
    const intMatch = line.match(/^interface\s+([A-Za-z0-9/.-]+)/i);
    if (intMatch) {
      metadata.interfacesDetected?.push(intMatch[1]);
      if (/vlan|FastEthernet|GigabitEthernet.*switchport/i.test(line)) {
        // Might be switch
      }
    }

    // Lines (con, aux, vty)
    const lineMatch = line.match(/^line\s+(con|aux|vty)\s+([0-9\s]+)/i);
    if (lineMatch) {
      metadata.linesDetected?.push(`line ${lineMatch[1]} ${lineMatch[2]}`);
    }

    // ACLs
    const aclMatch = line.match(/^access-list\s+(\d+|[A-Za-z0-9_-]+)/i);
    if (aclMatch && !metadata.aclsDetected?.includes(aclMatch[1])) {
      metadata.aclsDetected?.push(aclMatch[1]);
    }
    const ipAclMatch = line.match(/^ip\s+access-list\s+(standard|extended)\s+([A-Za-z0-9_-]+)/i);
    if (ipAclMatch && !metadata.aclsDetected?.includes(ipAclMatch[2])) {
      metadata.aclsDetected?.push(ipAclMatch[2]);
    }

    // SNMP
    const snmpMatch = line.match(/^snmp-server\s+community\s+([^\s]+)/i);
    if (snmpMatch) {
      metadata.snmpCommunitiesDetected?.push(snmpMatch[1]);
    }

    // Switch indicators
    if (/spanning-tree|vlan\s+\d+|switchport/i.test(line)) {
      metadata.deviceType = 'Switch';
    }
  }

  // Security Heuristic Scans
  const fullText = rawConfig.toLowerCase();

  // 1. Plaintext Enable Password
  const enablePlainMatch = rawConfig.match(/^enable\s+password\s+(?:0\s+)?([^\s\r\n]+)/m);
  if (enablePlainMatch) {
    const lineIdx = lines.findIndex((l) => /^enable\s+password/i.test(l.trim()));
    heuristicFindings.push({
      id: 'FIND-PLAIN-ENABLE',
      title: 'Düz Metin (Plaintext) Enable Şifresi Tespit Edildi',
      severity: 'CRITICAL',
      category: 'AUTHENTICATION',
      lineNumbers: lineIdx !== -1 ? [lineIdx + 1] : undefined,
      flaggedCode: enablePlainMatch[0],
      cveOrCisRef: 'CIS Cisco IOS Benchmark 1.1.1 (Level 1)',
      riskExplanation:
        'Konfigürasyon dosyasında "enable password" kullanıldığında ayrıcalıklı EXEC modu parolası şifrelenmemiş (açık metin) olarak saklanır. Konfigürasyonu görüntüleyen veya yedek dosyasını ele geçiren herhangi biri cihazın tam yönetici yetkilerini ele geçirir.',
      remediationCommand:
        'no enable password\nenable algorithm-type sha256 secret <Guclu_Parola_Belirleyin>',
      packetTracerImpact:
        'Packet Tracer CLI üzerinde "show run" çıktısında şifre açıkça okunabilir.',
    });
  }

  // 2. Type 7 Reversible Passwords
  const type7Matches: { lineNum: number; text: string }[] = [];
  lines.forEach((l, idx) => {
    if (/\bpassword\s+7\s+[0-9a-fA-F]+/i.test(l) || /\bsecret\s+7\s+[0-9a-fA-F]+/i.test(l)) {
      type7Matches.push({ lineNum: idx + 1, text: l.trim() });
    }
  });
  if (type7Matches.length > 0) {
    heuristicFindings.push({
      id: 'FIND-TYPE-7-PW',
      title: 'Zayıf ve Tersine Çevrilebilir (Type 7) Şifreleme Kullanımı',
      severity: 'HIGH',
      category: 'AUTHENTICATION',
      lineNumbers: type7Matches.map((m) => m.lineNum),
      flaggedCode: type7Matches.map((m) => m.text).join('\n'),
      cveOrCisRef: 'CWE-326 / CIS Cisco IOS Benchmark 1.1.2',
      riskExplanation:
        'Cisco Type 7 şifrelemesi sabit bir Vigenère XOR tablosu kullanır. İnternetteki basit araçlarla ve scriptlerle mikrosaniyeler içinde orijinal açık metin haline dönüştürülebilir.',
      remediationCommand:
        'username <kullanici> algorithm-type scrypt secret <guclu_parola>\nveya enable secret <guclu_parola>',
      packetTracerImpact:
        'Packet Tracer senaryolarında şifre tersine çevrilebilir ve laboratuvar güvenliği ihlal edilebilir.',
    });
  }

  // 3. Missing service password-encryption
  if (!fullText.includes('service password-encryption')) {
    heuristicFindings.push({
      id: 'FIND-NO-PW-ENCRYPT',
      title: 'Parola Şifreleme Servisi Devre Dışı (no service password-encryption)',
      severity: 'MEDIUM',
      category: 'AUTHENTICATION',
      cveOrCisRef: 'CIS Cisco IOS Benchmark 1.1.3',
      riskExplanation:
        '"service password-encryption" komutu tanımlı olmadığında, konsol, aux ve vty hatlarında tanımlanan yeni parolalar açık metin olarak görünür.',
      remediationCommand: 'service password-encryption',
      packetTracerImpact:
        'Packet Tracer üzerinde "show run" çalıştırıldığında hat parolaları açıkça okunabilir.',
    });
  }

  // 4. Insecure Telnet allowed on VTY
  let vtyHasTelnet = false;
  let vtyHasSSH = false;
  const vtyLineNumbers: number[] = [];
  let inVty = false;

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/^line\s+vty\s+/i.test(trimmed)) {
      inVty = true;
      vtyLineNumbers.push(idx + 1);
    } else if (/^line\s+(con|aux)/i.test(trimmed) || /^interface\s+/i.test(trimmed) || /^router\s+/i.test(trimmed)) {
      inVty = false;
    }

    if (inVty) {
      if (/transport\s+input\s+.*(telnet|all)/i.test(trimmed)) {
        vtyHasTelnet = true;
        vtyLineNumbers.push(idx + 1);
      }
      if (/transport\s+input\s+.*ssh/i.test(trimmed) && !/telnet/i.test(trimmed)) {
        vtyHasSSH = true;
      }
    }
  });

  if (vtyHasTelnet || (!vtyHasSSH && metadata.linesDetected?.some((l) => l.includes('vty')))) {
    heuristicFindings.push({
      id: 'FIND-TELNET-VTY',
      title: 'Güvensiz Telnet Protokolü Açık (Şifrelenmemiş Uzak Yönetim)',
      severity: 'CRITICAL',
      category: 'MANAGEMENT_ACCESS',
      lineNumbers: vtyLineNumbers.length > 0 ? vtyLineNumbers : undefined,
      flaggedCode: 'line vty 0 4\n transport input telnet (veya all)',
      cveOrCisRef: 'CIS Cisco IOS Benchmark 2.2.1 / NIST SP 800-52',
      riskExplanation:
        'Telnet protokolü kimlik doğrulama parolalarını ve girilen tüm komutları açık metin olarak ağda iletir. Wireshark veya Packet Tracer "Simulation Mode" incelemesinde oturum açma parolaları anında ele geçirilebilir.',
      remediationCommand:
        'ip domain-name sirket.local\ncrypto key generate rsa modulus 2048\nip ssh version 2\nline vty 0 4\n transport input ssh\n login local',
      packetTracerImpact:
        'Packet Tracer Simulation Mode altında paketler incelendiğinde Telnet şifresi okunabilir; SSH yapılandırıldığında güvenli hale gelir.',
    });
  }

  // 5. Insecure HTTP Server Enabled
  const httpLineIdx = lines.findIndex((l) => /^ip\s+http\s+server\b/i.test(l.trim()));
  if (httpLineIdx !== -1 && !fullText.includes('no ip http server')) {
    heuristicFindings.push({
      id: 'FIND-HTTP-SERVER',
      title: 'Güvensiz Web Yönetim Sunucusu Aktif (ip http server)',
      severity: 'HIGH',
      category: 'NETWORK_SERVICES',
      lineNumbers: [httpLineIdx + 1],
      flaggedCode: lines[httpLineIdx].trim(),
      cveOrCisRef: 'CIS Cisco IOS Benchmark 2.1.1 / CVE-2023-20198',
      riskExplanation:
        'Cisco IOS üzerindeki eski dahili HTTP sunucusu şifrelenmemiş (HTTP port 80) üzerinden çalışır ve tarihsel olarak uzaktan yetki yükseltme ve kimlik doğrulama bypass zafiyetlerine açıktır.',
      remediationCommand: 'no ip http server\nip http secure-server',
      packetTracerImpact:
        'Packet Tracer PC Web Browser üzerinden cihaza şifrelenmemiş web erişimi sağlanabilir.',
    });
  }

  // 6. Default SNMP Community Strings
  const defaultSnmp = metadata.snmpCommunitiesDetected?.filter((c) =>
    ['public', 'private', 'cisco', 'read', 'write'].includes(c.toLowerCase())
  );
  if (defaultSnmp && defaultSnmp.length > 0) {
    const snmpLineIdxs = lines
      .map((l, idx) => (defaultSnmp.some((comm) => new RegExp(`snmp-server\\s+community\\s+${comm}`, 'i').test(l)) ? idx + 1 : -1))
      .filter((idx) => idx !== -1);

    heuristicFindings.push({
      id: 'FIND-DEFAULT-SNMP',
      title: 'Varsayılan ve Zayıf SNMP Topluluk Dizgisi (public / private)',
      severity: 'CRITICAL',
      category: 'MANAGEMENT_ACCESS',
      lineNumbers: snmpLineIdxs,
      flaggedCode: lines.filter((l) => defaultSnmp.some((c) => l.toLowerCase().includes(c.toLowerCase()))).join('\n'),
      cveOrCisRef: 'CIS Cisco IOS Benchmark 2.3.1 / CWE-1188',
      riskExplanation:
        '"public" veya "private" gibi tahmin edilebilir SNMP community stringleri saldırganların router OID ağaçlarını okumasına, arayüz durumlarını görmesine ve RW (Read-Write) yetkisi varsa router konfigürasyonunu TFTP ile değiştirmesine izin verir.',
      remediationCommand:
        'no snmp-server community public\nno snmp-server community private\n! SNMPv3 SHA/AES veya ACL ile kısıtlanmış karmaşık community tanımlayın:\nsnmp-server community Guc1u_Snmp_Kodu_2026! RO 10',
      packetTracerImpact:
        'Packet Tracer MIB Browser kullanarak yetkisiz cihaz parametreleri çekilebilir.',
    });
  }

  // 7. Missing VTY Access-Class (ACL protection on management lines)
  if (!fullText.includes('access-class')) {
    heuristicFindings.push({
      id: 'FIND-NO-ACCESS-CLASS',
      title: 'Uzak Yönetim Hatlarında (VTY) Erişim Kontrol Listesi (ACL) Eksik',
      severity: 'HIGH',
      category: 'FIREWALL_ACL',
      cveOrCisRef: 'CIS Cisco IOS Benchmark 2.2.3',
      riskExplanation:
        'VTY hatlarına "access-class" atanmadığında, router veya switch IP adresine erişebilen herhangi bir ağdaki (misafir ağı, internet veya yan subnet) istemciler yönetim portuna kaba kuvvet (brute-force) saldırısı başlatabilir.',
      remediationCommand:
        'ip access-list standard VTY_YONETIM_IZIN\n permit 192.168.1.0 0.0.0.255\n deny any log\nline vty 0 4\n access-class VTY_YONETIM_IZIN in',
      packetTracerImpact:
        'Packet Tracer laboratuvarında diğer router veya PClerden gelen VTY bağlantıları kısıtlanmaz.',
    });
  }

  // 8. Missing Banner MOTD / Login Warning
  if (!fullText.includes('banner motd') && !fullText.includes('banner login')) {
    heuristicFindings.push({
      id: 'FIND-NO-BANNER',
      title: 'Yasal Uyarı Başlığı (Banner MOTD) Eksik',
      severity: 'LOW',
      category: 'MANAGEMENT_ACCESS',
      cveOrCisRef: 'CIS Cisco IOS Benchmark 1.3.1 / NSA Router Hardening',
      riskExplanation:
        'Yasal bir uyarı başlığının bulunmaması, yetkisiz erişim teşebbüslerinde yasal kovuşturma süreçlerini zorlaştırır ve yetkisiz kişilere hoşgeldiniz (default IOS banner) mesajı vererek hedef hakkında bilgi sızdırabilir.',
      remediationCommand:
        'banner motd #\n*****************************************************************\n* UYARI: Bu sisteme yalnızca yetkili personelin erisimi serbesttir.*\n* Yetkisiz erisim girisimleri kaydedilmekte ve cezai kovusturmaya *\n* tabidir. Tum oturumlar izlenmektedir.                         *\n*****************************************************************\n#',
      packetTracerImpact:
        'Packet Tracer CLI veya Telnet/SSH oturum başlangıcında uyarı metni görüntülenmez.',
    });
  }

  // 9. Missing Exec-Timeout on Lines
  if (!fullText.includes('exec-timeout')) {
    heuristicFindings.push({
      id: 'FIND-NO-EXEC-TIMEOUT',
      title: 'Oturum Zaman Aşımı (exec-timeout) Yapılandırılmamış',
      severity: 'MEDIUM',
      category: 'MANAGEMENT_ACCESS',
      cveOrCisRef: 'CIS Cisco IOS Benchmark 2.2.2',
      riskExplanation:
        'Varsayılan veya "exec-timeout 0 0" (zaman aşımı yok) ayarında yönetici terminali terk ettiğinde açık kalan konsol veya VTY oturumu süresiz açık kalır ve yetkisiz fiziksel/ağ erişimine maruz bırakır.',
      remediationCommand:
        'line con 0\n exec-timeout 5 0\nline vty 0 4\n exec-timeout 5 0',
      packetTracerImpact:
        'Packet Tracer terminalinde oturum açık unutulduğunda kapanmaz.',
    });
  }

  // 10. CDP Enabled Globally without restriction
  if (fullText.includes('cdp run') || (!fullText.includes('no cdp run') && metadata.deviceType === 'Router')) {
    heuristicFindings.push({
      id: 'FIND-CDP-RUNNING',
      title: 'Cisco Discovery Protocol (CDP) Denetimsiz Aktif',
      severity: 'LOW',
      category: 'NETWORK_SERVICES',
      cveOrCisRef: 'CIS Cisco IOS Benchmark 3.1 / NSA Router Hardening',
      riskExplanation:
        'CDP periyodik olarak donanım modelini, IOS sürümünü ve yerel IP adreslerini Layer 2 yayınlar halinde yayar. Dış ağa veya güvenilmeyen arayüzlere açıldığında saldırganların keşif (reconnaissance) yapmasını kolaylaştırır.',
      remediationCommand:
        'no cdp run\n! Veya sadece ic anahtarlama portlarinda calisip dis WAN arayuzunde kapatin:\ninterface GigabitEthernet0/1\n no cdp enable',
      packetTracerImpact:
        'Packet Tracer "Simulation Mode" altında CDP paketlerinin dış hatlara da yayınlandığı gözlemlenebilir.',
    });
  }

  // 11. IP Proxy-ARP & Directed-Broadcast
  if (!fullText.includes('no ip proxy-arp') && metadata.deviceType === 'Router') {
    heuristicFindings.push({
      id: 'FIND-PROXY-ARP',
      title: 'IP Proxy-ARP Devre Dışı Bırakılmamış',
      severity: 'LOW',
      category: 'NETWORK_SERVICES',
      cveOrCisRef: 'CIS Cisco IOS Benchmark 3.4',
      riskExplanation:
        'Proxy-ARP, routerın kendisi yerine başkası gibi ARP isteklerine yanıt vermesine olanak tanır. Ağda ARP zehirlenmesi (Man-in-the-Middle) ve DoS saldırılarını kolaylaştırır.',
      remediationCommand:
        'interface <tum_arayuzler>\n no ip proxy-arp\n no ip redirects\n no ip unreachables',
      packetTracerImpact:
        'Cihaz varsayılan olarak başkası adına ARP isteklerine cevap verir.',
    });
  }

  // 12. Unicast RPF (uRPF) Missing on Router
  if (metadata.deviceType === 'Router' && !fullText.includes('ip verify unicast reverse-path')) {
    heuristicFindings.push({
      id: 'FIND-NO-URPF',
      title: 'Sahte IP Engelleme (Unicast Reverse Path Forwarding - uRPF) Eksik',
      severity: 'MEDIUM',
      category: 'FIREWALL_ACL',
      cveOrCisRef: 'NSA Network Hardening / BCP 38 (RFC 2827)',
      riskExplanation:
        'Kenar (edge/WAN) arayüzlerinde uRPF olmadığında sahte kaynak IP adresli (IP spoofing) DoS paketleri router üzerinden iç ağa yönlendirilebilir.',
      remediationCommand:
        'interface GigabitEthernet0/0\n ip verify unicast reverse-path rx',
      packetTracerImpact:
        'Packet Tracer senaryolarında IP spoofing simülasyonları filtrelenmeden geçer.',
    });
  }

  return {
    lines,
    metadata,
    heuristicFindings,
  };
}
