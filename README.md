# 🛡️ Cisco Config Hardener & Security Auditor

**Cisco Config Hardener** is an AI-powered security auditing and automated remediation tool designed for network engineers, cybersecurity analysts, and students. It parses Cisco IOS running configurations (`.cfg`, `.txt`, `.ios`), identifies critical security vulnerabilities (e.g., cleartext passwords, insecure Telnet usage, weak ACLs), and uses **Google Gemini AI** to instantly generate CIS-compliant hardening scripts and side-by-side configuration diffs.

---

## ✨ Features

### 1. 📑 Configuration File Ingestion
* **Flexible Ingestion:** Drag-and-drop support for `.cfg`, `.txt`, and `.ios` files or direct paste into an in-browser code editor.
* **Pre-loaded Scenarios:** Comes with 4 ready-to-test lab configurations:
  1. *Vulnerable Branch Router (ISR 2911)*
  2. *Perimeter Gateway Router (ISR 4321)*
  3. *Unsecured Edge Switch (Catalyst 2960)*
  4. *Fully Hardened Reference Configuration*

### 2. 🔍 Gemini AI Security Analysis & Audit
* **Authentication & Passwords:** Detects plain-text `enable password`, weakly hashed Type 7 passwords, and missing `service password-encryption`.
* **Remote Management & Protocols:** Flags unencrypted Telnet on VTY lines, enforces SSHv2, and checks for missing `exec-timeout` configurations.
* **Access Control & Port Security:** Audit missing `access-class` ACLs on VTY lines, anti-spoofing controls (`uRPF`), and interface-level security policies.
* **Insecure Services:** Identifies open HTTP servers (`ip http server`), default public/private SNMP community strings, and active CDP broadcasts on untrusted interfaces.

### 3. 🛠️ Automated Hardening & Remediation
* **One-Click CLI Fix Scripts:** Automatically generates copy-pasteable Cisco CLI command blocks (`configure terminal ... end`) ready for Cisco Packet Tracer or real device terminals.
* **Full Hardened Config Export:** Export the remediated, CIS Benchmark-compliant configuration as a standalone `.cfg` file.
* **Side-by-Side Diff Viewer:** Visual comparison panel highlighting exact line changes between original and hardened configurations.

### 4. 🧪 Packet Tracer Lab & Verification Guide
* Step-by-step guidance for applying hardening commands in Cisco Packet Tracer CLI.
* Verification commands (`show ip ssh`, `show access-lists`, `show line vty 0 4`) with expected safe output reference tables.
* Simulation Mode testing steps to verify packet drop rules and access control list (ACL) enforcement.

### 5. 📊 CIS Benchmark & NSA Compliance Matrix
* Audit checklist mapping configurations directly against international **CIS Cisco IOS Benchmarks** and **NSA Router Security Guides**.
* **Interactive AI Security Copilot:** Embedded Q&A assistant to answer network architecture and security-hardening queries in real time.

---

## 🚀 Quick Start

### Prerequisites
* **Node.js 18+**
* **Google Gemini API Key** ([Get your API Key from Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/cisco-config-hardener.git](https://github.com/YOUR_USERNAME/cisco-config-hardener.git)
   cd cisco-config-hardener
