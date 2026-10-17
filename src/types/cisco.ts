export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type FindingCategory =
  | 'AUTHENTICATION'
  | 'MANAGEMENT_ACCESS'
  | 'NETWORK_SERVICES'
  | 'FIREWALL_ACL'
  | 'LOGGING_MONITORING'
  | 'LAYER2_SWITCHING'
  | 'ROUTING_PROTOCOL';

export interface AuditFinding {
  id: string;
  title: string;
  severity: Severity;
  category: FindingCategory;
  lineNumbers?: number[];
  flaggedCode?: string;
  cveOrCisRef?: string;
  riskExplanation: string;
  remediationCommand: string;
  packetTracerImpact?: string;
}

export interface ComplianceItem {
  id: string;
  standard: 'CIS Cisco IOS Benchmark' | 'NSA Router Hardening' | 'PCI-DSS' | 'NIST 800-53';
  control: string;
  title: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  rationale: string;
}

export interface DeviceMetadata {
  hostname?: string;
  deviceType?: 'Router' | 'Switch' | 'Multilayer Switch' | 'Firewall' | 'Unknown';
  iosVersion?: string;
  interfacesDetected?: string[];
  linesDetected?: string[];
  aclsDetected?: string[];
  snmpCommunitiesDetected?: string[];
}

export interface AuditResult {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW';
  summary: string;
  deviceMetadata: DeviceMetadata;
  findings: AuditFinding[];
  complianceChecklist: ComplianceItem[];
  hardeningCliScript: string;
  hardenedConfigFile: string;
  packetTracerVerificationGuide: {
    overview: string;
    steps: { title: string; command: string; expectedOutput: string }[];
  };
  stats: {
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
    passedCount: number;
  };
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  codeSnippet?: string;
}
