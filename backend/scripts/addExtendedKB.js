import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseURL = "http://localhost:5000/api";

async function loginAndGetToken() {
  try {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "admin@organization.com", password: "password123" }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("✅ Logged in as admin");
      return data.token;
    } else {
      console.error("❌ Login failed:", data.error || data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Login error:", error.message);
    return null;
  }
}

// Extended IT Support Knowledge Base with 100+ entries
const extendedKB = [
  {
    title: "Zoom Video Conferencing Setup",
    text: "To set up Zoom for work meetings, download the Zoom client from zoom.company.com/download. Sign in with your work email. Configure audio and video in Settings > Audio/Video. Test microphone and speakers. For meetings, ensure camera permissions are enabled. Schedule meetings through Outlook integration. For troubleshooting: Check internet connection. Update Zoom to latest version. Clear cache in Settings > Advanced > Clear. Restart computer. If audio issues, select correct input/output devices. For video problems, check camera settings and permissions. Contact IT if firewall blocks Zoom."
  },
  {
    title: "Slack Workspace Setup",
    text: "To join the company Slack workspace, visit slack.company.com/invite and enter your work email. Download the desktop or mobile app. Sign in and set your profile. Create channels for teams. Customize notifications in Preferences > Notifications. For troubleshooting: Check internet connection. Clear app cache. Restart app. Update to latest version. If login fails, reset password at portal.company.com. Verify workspace URL. For notification issues, check system notification settings. Contact IT for workspace access problems."
  },
  {
    title: "OneDrive Sync Issues",
    text: "If OneDrive isn't syncing files, first check your internet connection. Ensure you're signed in with work account. Go to OneDrive settings > Account > Unlink, then sign back in. Check available storage space. For sync errors: Pause and resume sync. Reset OneDrive by right-clicking tray icon > Settings > Reset. Update OneDrive app. Exclude large files if needed. For shared files, ensure permissions. If sync stuck, restart computer. Contact IT for account issues."
  },
  {
    title: "SharePoint Site Access Issues",
    text: "To access SharePoint sites, visit sharepoint.company.com and sign in with work credentials. If access denied: Check if site is shared with you. Request access from site owner. For permission issues: Contact department admin. Clear browser cache. Try different browser. Ensure VPN connected for external access. Update browser. For site not loading, check network connectivity."
  },
  {
    title: "Active Directory Account Issues",
    text: "Active Directory manages user accounts. For password issues, use self-service at ad.company.com/reset. Account unlocks require IT approval. To check account status: Contact IT support. For group membership changes: Submit request via IT portal. Ensure computer joined to domain. Run gpupdate /force for policy updates. If login fails, verify domain connectivity. Contact IT for account modifications."
  },
  {
    title: "Domain Join Problems",
    text: "To join computer to company domain, go to Settings > Accounts > Access work or school > Connect. Enter domain.company.com. Provide admin credentials. Restart computer. For troubleshooting: Check DNS settings. Ensure network connectivity. Verify domain controller availability. Run ipconfig /flushdns. If join fails, contact IT with error code. For wireless devices, domain join may not apply."
  },
  {
    title: "Firewall Configuration",
    text: "Company firewall protects network. For access issues: Check if application allowed in firewall rules. Submit exception request via IT portal. For blocked sites: Verify URL whitelist. Use VPN for external access. Update firewall client. Restart firewall service. If internet slow, check firewall logs. Contact IT for rule changes."
  },
  {
    title: "Proxy Server Setup",
    text: "To configure proxy, go to Settings > Network & Internet > Proxy. Enter proxy.company.com:8080. For browser-specific: Configure in browser settings. For troubleshooting: Check proxy address. Verify credentials if authenticated. Clear proxy cache. Restart browser. If sites blocked, check proxy rules. Contact IT for proxy exceptions."
  },
  {
    title: "VPN Client Installation",
    text: "Download VPN client from vpn.company.com/download. Run installer as admin. Enter server: vpn.company.com. Configure authentication. For troubleshooting: Check system requirements. Disable antivirus temporarily. Run installer in compatibility mode. Update Windows. If installation fails, contact IT. Test connection after install."
  },
  {
    title: "Software Update Procedures",
    text: "Software updates ensure security. Check for updates in application menus. For automatic updates: Enable in settings. For manual: Download from software.company.com. Install during off-hours. For troubleshooting: Check disk space. Close application. Run as admin. If update fails, download full installer. Contact IT for version-specific issues."
  },
  {
    title: "Hardware Request Process",
    text: "To request hardware, submit form at it.company.com/hardware-request. Include justification and specifications. Approval required from manager. Delivery takes 3-5 business days. For urgent requests: Contact IT directly. Track status in IT portal. For setup: IT will configure. Warranty covers 3 years."
  },
  {
    title: "Monitor Calibration",
    text: "For accurate colors, calibrate monitor. Use built-in calibrator or download from display.company.com/tools. Adjust brightness, contrast, color temperature. For troubleshooting: Reset to factory defaults. Update graphics drivers. Check cable connections. Clean screen. If colors inaccurate, recalibrate. Contact IT for professional calibration."
  },
  {
    title: "Webcam Issues",
    text: "If webcam not working, check Device Manager for errors. Update camera drivers. Test in different applications. For privacy settings: Allow camera access. Clean lens. Check cable if external. Restart computer. If hardware issue, request replacement. For meetings, test before use."
  },
  {
    title: "Audio Problems",
    text: "For audio problems, check volume settings. Test speakers/headphones. Update audio drivers. Run audio troubleshooter. Check playback devices. For Bluetooth audio: Pair device correctly. Restart audio service. If no sound, check mute status. Contact IT for hardware replacement."
  },
  {
    title: "Bluetooth Connectivity",
    text: "To pair Bluetooth devices, enable Bluetooth in Settings. Put device in pairing mode. Select device to pair. Enter PIN if required. For troubleshooting: Remove and re-pair. Update Bluetooth drivers. Restart Bluetooth service. Check device compatibility. If pairing fails, contact IT."
  },
  {
    title: "Cloud Storage Setup",
    text: "Use OneDrive for cloud storage. Sign in at onedrive.company.com. Configure sync folders. Set backup options. For troubleshooting: Check storage quota. Update app. Reset sync. Clear cache. If upload fails, check file size limits. Contact IT for increased storage."
  },
  {
    title: "Data Encryption",
    text: "Enable BitLocker for drive encryption. Go to Control Panel > BitLocker. Choose drive and method. For troubleshooting: Ensure TPM enabled. Create recovery key. Backup key securely. If encryption fails, check disk health. Contact IT for enterprise encryption tools."
  },
  {
    title: "Phishing Awareness",
    text: "Phishing emails appear legitimate but steal info. Check sender email carefully. Hover links before clicking. Don't open attachments from unknown. Report suspicious emails to security@company.com. For training: Visit security.company.com/phishing. If clicked malicious link, change password immediately."
  },
  {
    title: "Security Policies",
    text: "Follow security policies at security.company.com/policies. Use strong passwords. Lock screen when away. Don't share credentials. Report incidents immediately. For violations: Contact security team. Regular training required. Compliance mandatory for all employees."
  },
  {
    title: "BYOD Setup",
    text: "For personal devices, enroll at byod.company.com. Install MDM agent. Configure security settings. For troubleshooting: Check device compatibility. Update OS. Reset network settings. If enrollment fails, contact IT. Personal devices must meet security standards."
  },
  {
    title: "Mobile Device Management",
    text: "MDM manages mobile devices. Enroll at mdm.company.com. Install company apps. Set policies. For troubleshooting: Check enrollment status. Update apps. Restart device. Clear Company Portal cache. If policies not applying, re-enroll device. Contact IT support."
  },
  {
    title: "Single Sign-On Setup",
    text: "SSO allows one login for multiple apps. Sign in at sso.company.com. For issues: Clear browser cache. Try different browser. Reset password. Check account status. If SSO fails, contact IT. Ensure cookies enabled."
  },
  {
    title: "Multi-Factor Authentication",
    text: "Enable MFA at mfa.company.com. Choose authenticator app. Scan QR code. For troubleshooting: Check time sync. Re-scan QR code. Use backup codes. If app lost, contact IT. MFA required for sensitive access."
  },
  {
    title: "Password Policies",
    text: "Passwords must be 12+ characters, include symbols. Change every 90 days. Use password manager. For reset: Visit portal.company.com/reset. If forgotten, use recovery options. Don't reuse passwords. Contact IT for policy exceptions."
  },
  {
    title: "Account Unlock Process",
    text: "Accounts lock after failed attempts. Wait 15 minutes or contact IT. For self-service: Use unlock portal at unlock.company.com. Provide verification. If account compromised, change password immediately. Prevent locks by careful typing."
  },
  {
    title: "Group Policy Issues",
    text: "Group policies control settings. Run gpupdate /force. Check event logs. For issues: Ensure domain connectivity. Restart computer. Check policy application. Contact IT for policy changes. gpresult /r shows applied policies."
  },
  {
    title: "SCCM Client Problems",
    text: "SCCM manages software deployment. Check client status in Control Panel. For updates: Run machine policy. Restart SMS service. If software not installing, check requirements. Contact IT for deployment issues."
  },
  {
    title: "Intune Enrollment",
    text: "Enroll device at intune.company.com. Install Company Portal. Sign in with work account. For troubleshooting: Check device compliance. Update apps. Restart device. Clear Company Portal cache. If enrollment fails, contact IT."
  },
  {
    title: "Azure AD Sync",
    text: "Azure AD syncs accounts. Check sync status at aad.company.com. For issues: Run sync manually. Check connectivity. Update Azure AD Connect. Review sync logs. Contact IT for sync failures."
  },
  {
    title: "Office 365 Issues",
    text: "Office 365 includes Word, Excel, etc. Sign in at office.company.com. For activation: Use work account. Update apps. Repair installation. If login fails, reset password. Contact IT for license issues."
  },
  {
    title: "Exchange Server Problems",
    text: "Exchange handles email. Check connectivity to exchange.company.com. For Outlook issues: Recreate profile. Test connectivity. Update Outlook. If sync fails, check permissions. Contact IT for server problems."
  },
  {
    title: "Skype for Business Setup",
    text: "Download from skype.company.com. Sign in with work email. Configure audio/video. For troubleshooting: Check firewall. Update client. Clear cache. Test connectivity. If sign-in fails, verify credentials."
  },
  {
    title: "Yammer Usage",
    text: "Join Yammer at yammer.company.com. Create groups. Post updates. For issues: Check permissions. Update browser. Clear cache. If access denied, request group membership. Contact IT for setup help."
  },
  {
    title: "Microsoft Planner",
    text: "Create plans at planner.company.com. Add tasks and assign. Set due dates. For troubleshooting: Check permissions. Update browser. Clear cache. If not syncing, refresh page. Contact IT for access issues."
  },
  {
    title: "Windows 10 Upgrade",
    text: "Download tool from windows.company.com/upgrade. Run as admin. Choose upgrade option. Backup data first. For issues: Check compatibility. Free up space. Disable antivirus. If upgrade fails, use clean install."
  },
  {
    title: "Windows 11 Requirements",
    text: "Check requirements at windows.company.com/11. Ensure TPM 2.0, Secure Boot. For upgrade: Use Windows Update. Backup data. For issues: Update BIOS. Enable TPM. If not compatible, stay on Windows 10."
  },
  {
    title: "macOS Setup",
    text: "For Mac users, enroll at mac.company.com. Install MDM profile. Configure settings. For troubleshooting: Check system preferences. Update macOS. Restart device. If enrollment fails, contact IT."
  },
  {
    title: "Linux Support",
    text: "For Linux users, use supported distributions. Update packages with apt/yum. For issues: Check repositories. Update kernel. Restart services. If problems persist, contact IT for supported software."
  },
  {
    title: "Blue Screen Errors",
    text: "Blue screens indicate crashes. Note error code. Update drivers. Run memory diagnostic. Check disk health. For persistent: Boot in safe mode. Uninstall recent software. If hardware issue, contact IT."
  },
  {
    title: "Boot Issues",
    text: "If computer won't boot, check power. Try different outlet. For Windows: Boot from installation media. Run startup repair. Check boot order in BIOS. If hardware, contact IT."
  },
  {
    title: "Disk Space Management",
    text: "Check disk usage in File Explorer. Delete temp files. Empty recycle bin. Uninstall unused software. Move files to external drive. For low space: Run disk cleanup. Clear browser cache. Contact IT for storage upgrade."
  },
  {
    title: "Memory Issues",
    text: "For memory issues, check Task Manager. Close unnecessary apps. Run memory diagnostic. Upgrade RAM if needed. For leaks: Restart computer. Update software. If persistent, contact IT."
  },
  {
    title: "CPU Performance",
    text: "High CPU usage slows system. Check Task Manager for processes. End high CPU tasks. Update drivers. Scan for malware. Disable startup programs. If overheating, clean vents."
  },
  {
    title: "GPU Driver Updates",
    text: "Update GPU drivers from manufacturer site. For NVIDIA: Use GeForce Experience. For AMD: Use Radeon Software. For issues: Roll back driver. Clean install. Update Windows. If display problems, contact IT."
  },
  {
    title: "BIOS Updates",
    text: "Download BIOS from manufacturer. Create bootable USB. Update in BIOS menu. For issues: Ensure power stable. Don't interrupt update. If update fails, contact manufacturer."
  },
  {
    title: "Firmware Updates",
    text: "Check device manager for firmware. Download from manufacturer. Install updates. For issues: Close other apps. Restart after update. If update fails, contact support."
  },
  {
    title: "Scanner Setup",
    text: "Install scanner drivers from scanner.company.com. Connect device. Test scan. For issues: Check connections. Update drivers. Restart scanner. If not detected, check USB ports."
  },
  {
    title: "Projector Issues",
    text: "Check connections. Adjust resolution. Clean lens. For issues: Check bulb. Update firmware. Reset projector. If image problems, check source settings."
  },
  {
    title: "Conference Room Setup",
    text: "Book room at rooms.company.com. Check equipment. For issues: Restart devices. Check connections. Update software. Contact facilities if hardware broken."
  },
  {
    title: "VoIP Phone Setup",
    text: "Configure phone at voip.company.com. Enter extension. Test call. For issues: Check network. Restart phone. Update firmware. If no dial tone, contact IT."
  },
  {
    title: "IP Phone Problems",
    text: "For IP phone issues, check network cable. Restart phone. Check DHCP. For audio: Adjust volume. If registration fails, contact IT."
  },
  {
    title: "Video Conferencing Rooms",
    text: "Test equipment before meeting. Check camera, mic, speakers. For issues: Restart codec. Update software. Check network. Contact AV support."
  },
  {
    title: "Smart Board Setup",
    text: "Calibrate smart board. Install drivers. Connect to computer. For issues: Recalibrate. Update firmware. Clean surface. If not responding, check connections."
  },
  {
    title: "Wireless Presenter",
    text: "Pair presenter with computer. Install software. Test buttons. For issues: Change batteries. Re-pair device. Update drivers. Check Bluetooth."
  },
  {
    title: "External Hard Drive",
    text: "Connect drive. Check disk management. Format if needed. For issues: Try different USB port. Update drivers. Check power supply. If not recognized, contact IT."
  },
  {
    title: "NAS Access",
    text: "Access NAS at nas.company.com. Map drive. For issues: Check network. Update credentials. Restart NAS. If access denied, check permissions."
  },
  {
    title: "Server Access Issues",
    text: "Check server status at status.company.com. Ping server. For access: Use VPN. Check firewall. If down, contact IT."
  },
  {
    title: "Database Connection",
    text: "Connect using approved tools. Check connection string. For issues: Verify credentials. Check network. Update drivers. Contact DBA."
  },
  {
    title: "API Access Problems",
    text: "Check API documentation at api.company.com. Use correct endpoints. For issues: Check authentication. Update client. Check rate limits. Contact developer."
  },
  {
    title: "SSL Certificate Issues",
    text: "Check certificate validity at ssl.company.com. Renew if expired. For issues: Update browser. Clear cache. Check date/time. Contact IT for renewal."
  },
  {
    title: "Certificate Authority",
    text: "Download CA cert from ca.company.com. Install in trusted root. For issues: Check format. Restart browser. Update OS. Contact security."
  },
  {
    title: "Digital Signature",
    text: "Install signing certificate. Configure in application. For issues: Check certificate validity. Update software. Contact IT for new cert."
  },
  {
    title: "VPN Split Tunneling",
    text: "Configure split tunnel in VPN settings. Specify routes. For issues: Check configuration. Restart VPN. Update client. Contact IT."
  },
  {
    title: "Remote Desktop Gateway",
    text: "Configure RD Gateway at rdg.company.com. Enter credentials. For issues: Check certificate. Update client. Clear cache. Contact IT."
  },
  {
    title: "Citrix Access",
    text: "Launch Citrix at citrix.company.com. Sign in. For issues: Update receiver. Clear cache. Check network. Contact IT."
  },
  {
    title: "VMware Horizon",
    text: "Install Horizon client. Connect to server. For issues: Update client. Check compatibility. Restart computer. Contact IT."
  },
  {
    title: "Virtual Machine Setup",
    text: "Create VM with approved specs. Install OS. For issues: Check host resources. Update VMware. Allocate more RAM. Contact IT."
  },
  {
    title: "Hyper-V Problems",
    text: "Enable Hyper-V in Windows features. Create VM. For issues: Check virtualization. Update Windows. Restart host. Contact IT."
  },
  {
    title: "Docker Container Issues",
    text: "Install Docker. Pull images. Run containers. For issues: Check daemon. Update Docker. Restart service. Contact devops."
  },
  {
    title: "Kubernetes Access",
    text: "Access cluster at k8s.company.com. Use kubectl. For issues: Check config. Update kubeconfig. Restart client. Contact IT."
  },
  {
    title: "Git Repository Access",
    text: "Clone repo from git.company.com. Configure credentials. For issues: Check SSH keys. Update Git. Clear cache. Contact IT."
  },
  {
    title: "SVN Problems",
    text: "Checkout from svn.company.com. Enter credentials. For issues: Check network. Update client. Clear auth cache. Contact IT."
  },
  {
    title: "Jenkins Build Issues",
    text: "Access Jenkins at jenkins.company.com. Check builds. For issues: Check agents. Update plugins. Restart service. Contact devops."
  },
  {
    title: "Jira Access",
    text: "Sign in at jira.company.com. Create issues. For issues: Check permissions. Update browser. Clear cache. Contact IT."
  },
  {
    title: "Confluence Wiki",
    text: "Access wiki at confluence.company.com. Search docs. For issues: Check permissions. Update browser. Clear cache. Contact IT."
  },
  {
    title: "Salesforce Setup",
    text: "Sign in at salesforce.company.com. Configure dashboard. For issues: Check permissions. Update browser. Clear cache. Contact IT."
  },
  {
    title: "SAP Access",
    text: "Log in to SAP at sap.company.com. Use GUI. For issues: Check connection. Update client. Restart SAP. Contact IT."
  },
  {
    title: "Oracle Database",
    text: "Connect to oracle.company.com. Use approved tools. For issues: Check TNS. Update client. Check listener. Contact DBA."
  },
  {
    title: "SQL Server Issues",
    text: "Connect to sql.company.com. Use SSMS. For issues: Check firewall. Update drivers. Restart service. Contact DBA."
  },
  {
    title: "MySQL Problems",
    text: "Connect to mysql.company.com. Use Workbench. For issues: Check port. Update client. Restart MySQL. Contact DBA."
  },
  {
    title: "PostgreSQL Setup",
    text: "Connect to postgres.company.com. Use pgAdmin. For issues: Check authentication. Update client. Restart server. Contact DBA."
  },
  {
    title: "MongoDB Access",
    text: "Connect to mongo.company.com. Use Compass. For issues: Check auth. Update driver. Restart MongoDB. Contact DBA."
  },
  {
    title: "Redis Cache",
    text: "Connect to redis.company.com. Use redis-cli. For issues: Check port. Update client. Restart Redis. Contact IT."
  },
  {
    title: "Elasticsearch Issues",
    text: "Access at elastic.company.com. Use Kibana. For issues: Check cluster. Update ES. Restart nodes. Contact IT."
  },
  {
    title: "Logstash Configuration",
    text: "Configure pipelines. Check logs. For issues: Validate config. Update Logstash. Restart service. Contact IT."
  },
  {
    title: "Kibana Dashboards",
    text: "Create dashboards at kibana.company.com. For issues: Check permissions. Update Kibana. Clear cache. Contact IT."
  },
  {
    title: "Grafana Monitoring",
    text: "Access Grafana at grafana.company.com. Create panels. For issues: Check data sources. Update Grafana. Restart service. Contact IT."
  },
  {
    title: "Prometheus Metrics",
    text: "Configure targets. Check metrics. For issues: Validate config. Update Prometheus. Restart service. Contact IT."
  },
  {
    title: "Nagios Alerts",
    text: "Check status at nagios.company.com. Configure checks. For issues: Update plugins. Restart Nagios. Contact IT."
  },
  {
    title: "Zabbix Monitoring",
    text: "Access Zabbix at zabbix.company.com. Check hosts. For issues: Update agents. Restart server. Contact IT."
  },
  {
    title: "Splunk Logging",
    text: "Search logs at splunk.company.com. Create alerts. For issues: Check forwarders. Update Splunk. Restart service. Contact IT."
  },
  {
    title: "Wireshark Packet Capture",
    text: "Install Wireshark. Capture packets. For issues: Run as admin. Update Wireshark. Check interfaces. Contact IT."
  },
  {
    title: "Nmap Scanning",
    text: "Use Nmap for scans. Check syntax. For issues: Run as admin. Update Nmap. Check firewall. Contact IT."
  },
  {
    title: "Burp Suite",
    text: "Configure proxy. Intercept requests. For issues: Check certificates. Update Burp. Restart browser. Contact security."
  },
  {
    title: "Metasploit Framework",
    text: "Update Metasploit. Run modules. For issues: Check database. Update framework. Restart service. Contact security."
  },
  {
    title: "OWASP ZAP",
    text: "Install ZAP. Scan applications. For issues: Update ZAP. Configure proxy. Restart ZAP. Contact security."
  },
  {
    title: "Nessus Vulnerability Scanner",
    text: "Run scans with Nessus. Check policies. For issues: Update plugins. Restart Nessus. Contact security."
  },
  {
    title: "QualysGuard",
    text: "Access Qualys at qualys.company.com. Run scans. For issues: Check credentials. Update agent. Contact security."
  },
  {
    title: "SIEM Systems",
    text: "Check logs in SIEM at siem.company.com. Create rules. For issues: Update agents. Restart SIEM. Contact security."
  },
  {
    title: "Incident Response",
    text: "Report incidents to security@company.com. Follow response plan. For breaches: Isolate systems. Preserve evidence. Contact legal. Follow chain of custody."
  }
];

async function addExtendedKB() {
  console.log("📚 Adding extended IT support knowledge base...\n");

  const token = await loginAndGetToken();
  if (!token) {
    console.error("❌ Cannot proceed without token");
    return;
  }

  console.log(`📝 Adding ${extendedKB.length} extended Q&A pairs...\n`);

  for (let i = 0; i < extendedKB.length; i++) {
    const content = extendedKB[i];
    try {
      const response = await fetch(`${baseURL}/kb/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Added: ${content.title}`);
      } else {
        console.error(`❌ Failed to add "${content.title}":`, data.error || data.message);
      }
    } catch (error) {
      console.error(`❌ Failed to add "${content.title}":`, error.message);
    }
  }

  console.log("\n✨ Extended knowledge base addition complete!");
  console.log("\n🧪 Test with queries like:");
  console.log("  - \"How do I set up Zoom?\"");
  console.log("  - \"My OneDrive isn't syncing\"");
  console.log("  - \"How do I join the domain?\"");
  console.log("  - \"Firewall blocking my app\"");
  console.log("  - \"Need new hardware\"");
  console.log("\n🤖 The chatbot now has 125+ Q&A pairs for comprehensive IT support!");
}

addExtendedKB().catch(console.error);