export interface SampleConfig {
  id: string;
  name: string;
  deviceType: 'Router' | 'Switch';
  description: string;
  expectedRisk: 'Kritik Risk' | 'Yüksek Risk' | 'Orta Risk' | 'Sertleştirilmiş (Güvenli)';
  content: string;
}

export const SAMPLE_CONFIGS: SampleConfig[] = [
  {
    id: 'vulnerable-branch-2911',
    name: 'Cisco 2911 Şube Router (Ağır Zafiyetli)',
    deviceType: 'Router',
    description: 'Şifrelenmemiş parolalar, açık Telnet, aktif HTTP sunucusu, varsayılan SNMP topluluk adı ve eksik ACLler içeren tipik Packet Tracer laboratuvar konfigürasyonu.',
    expectedRisk: 'Kritik Risk',
    content: `!
version 15.1
no service timestamps log datetime msec
no service timestamps debug datetime msec
no service password-encryption
!
hostname Sube-Router-2911
!
boot-start-marker
boot-end-marker
!
enable password cisco123
!
no aaa new-model
!
ip source-route
!
ip cef
no ipv6 cef
!
ip domain-lookup
!
interface GigabitEthernet0/0
 description WAN-Baglantisi-ISP
 ip address 203.0.113.14 255.255.255.252
 duplex auto
 speed auto
!
interface GigabitEthernet0/1
 description Yerel-LAN-192.168.10.0
 ip address 192.168.10.1 255.255.255.0
 duplex auto
 speed auto
!
interface GigabitEthernet0/2
 no ip address
 shutdown
 duplex auto
 speed auto
!
ip forward-protocol nd
!
no ip http secure-server
ip http server
!
snmp-server community public RO
snmp-server community private RW
!
control-plane
!
line con 0
 password cisco
 login
line aux 0
line 2
line vty 0 4
 password cisco
 login
 transport input telnet
line vty 5 15
 login
!
scheduler allocate 20000 180000
end`,
  },
  {
    id: 'edge-gateway-4321',
    name: 'Cisco 4321 Sınır Ağ Geçidi (Eksik Filtreler & Zayıf SSH)',
    deviceType: 'Router',
    description: 'Type 7 şifreleme, eksik uRPF sahte IP koruması, yönetim ACLsi eksikliği ve kontrolsüz CDP yayını olan sınır routerı.',
    expectedRisk: 'Yüksek Risk',
    content: `!
version 16.9
service timestamps debug datetime msec
service timestamps log datetime msec
service password-encryption
!
hostname Kenar-Gateway-4321
!
enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0
username admin privilege 15 password 7 0822455D0A16
!
ip domain name sirket.local
!
interface GigabitEthernet0/0/0
 description DIS-INTERNET-WAN
 ip address 198.51.100.2 255.255.255.248
 negotiation auto
 cdp enable
!
interface GigabitEthernet0/0/1
 description DMZ-SUNUCULAR
 ip address 172.16.10.1 255.255.255.0
 negotiation auto
!
interface GigabitEthernet0/0/2
 description IC-KURUMSAL-LAN
 ip address 10.0.0.1 255.255.255.0
 negotiation auto
!
ip forward-protocol nd
no ip http server
no ip http secure-server
!
snmp-server community public RO
!
line con 0
 exec-timeout 0 0
 stopbits 1
line aux 0
 stopbits 1
line vty 0 4
 transport input ssh telnet
 login local
line vty 5 15
 login local
!
end`,
  },
  {
    id: 'catalyst-2960-switch',
    name: 'Cisco Catalyst 2960 Switch (Varsayılan VLAN & Güvensiz Portlar)',
    deviceType: 'Switch',
    description: 'VLAN 1 yönetim arayüzü, port güvenliği (port-security) olmayan, DTP trunking açık ve şifrelenmemiş uzaktan yönetim içeren anahtar konfigürasyonu.',
    expectedRisk: 'Yüksek Risk',
    content: `!
version 15.0
no service password-encryption
!
hostname Kat-1-Switch-2960
!
enable password switchcisco
!
ip domain-lookup
!
spanning-tree mode pvst
spanning-tree extend system-id
!
vlan 1
!
interface FastEthernet0/1
 description Kullanici-PC-1
 switchport mode access
!
interface FastEthernet0/2
 description Kullanici-PC-2
 switchport mode access
!
interface FastEthernet0/24
 description Uplink-Router
 switchport mode dynamic desirable
!
interface Vlan1
 ip address 192.168.1.2 255.255.255.0
 no shutdown
!
ip default-gateway 192.168.1.1
!
line con 0
 password switchcon
 login
line vty 0 4
 password switchvty
 login
 transport input all
line vty 5 15
 login
!
end`,
  },
  {
    id: 'hardened-cisco-cis-compliant',
    name: 'Sertleştirilmiş Referans Router (CIS & NSA Uyumlu)',
    deviceType: 'Router',
    description: 'CIS Benchmark ve NSA yönergelerine tam uyumlu, SHA256 gizli parolalar, SSHv2 zorunlu, VTY ACL kısıtlaması, güvenli loglama ve kapatılmış gereksiz servisler.',
    expectedRisk: 'Sertleştirilmiş (Güvenli)',
    content: `!
version 15.4
service timestamps debug datetime msec
service timestamps log datetime msec
service password-encryption
!
hostname Kurumsal-Hardened-R1
!
boot-start-marker
boot-end-marker
!
enable algorithm-type sha256 secret 8 $8$9L3o8P5q.zYm...G7h9k1L3$KqL9
username sec-admin privilege 15 algorithm-type sha256 secret 8 $8$J3b98F...$M1qX
!
aaa new-model
aaa authentication login default local
aaa authorization exec default local
!
no ip source-route
no ip domain-lookup
ip domain-name guvenli-kurum.local
ip ssh version 2
ip ssh time-out 60
ip ssh authentication-retries 3
!
no ip http server
no ip http secure-server
no ip bootp server
no service finger
no service tcp-small-servers
no service udp-small-servers
!
banner motd #
*******************************************************************************
* YASAL UYARI: Bu sisteme erisim sadece yetkili guvenlik personeli icindir.   *
* Yetkisiz erisim tesebbusleri 5237 Sayili TCK kapsaminda adli takibe tabidir.*
* Tum ag trafigi ve terminal oturumlari gercek zamanli olarak loglanmaktadir. *
*******************************************************************************
#
!
interface GigabitEthernet0/0
 description WAN-Internet-Filtreli
 ip address 203.0.113.1 255.255.255.252
 no ip redirects
 no ip unreachables
 no ip proxy-arp
 no ip directed-broadcast
 ip verify unicast reverse-path rx
 ip access-group WAN_INGRESS_FILTER in
 no cdp enable
!
interface GigabitEthernet0/1
 description Guvenli-LAN
 ip address 10.10.10.1 255.255.255.0
 no ip redirects
 no ip proxy-arp
!
ip access-list standard YONETIM_IZIN_VTY
 remark Sadece Guvenli Yonetim Alt Agina Izin Ver
 permit 10.10.10.50 0.0.0.0
 deny any log
!
ip access-list extended WAN_INGRESS_FILTER
 remark Spoofed RFC1918 engelle
 deny ip 10.0.0.0 0.255.255.255 any log
 deny ip 172.16.0.0 0.15.255.255 any log
 deny ip 192.168.0.0 0.0.255.255 any log
 permit ip any any
!
snmp-server community Guc1u_Ve_Rastgele_Str! RO YONETIM_IZIN_VTY
!
line con 0
 exec-timeout 5 0
 transport output none
line aux 0
 no exec
 transport output none
line vty 0 4
 access-class YONETIM_IZIN_VTY in
 exec-timeout 5 0
 transport input ssh
 transport output none
line vty 5 15
 access-class YONETIM_IZIN_VTY in
 exec-timeout 5 0
 transport input ssh
 transport output none
!
end`,
  },
];
