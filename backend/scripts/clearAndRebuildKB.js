import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KbDocument from '../src/models/KbDocument.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

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

async function clearKnowledgeBase() {
  try {
    console.log("🗑️ Clearing existing knowledge base...");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 Connected to database");

    // Delete all KB documents
    const result = await KbDocument.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} KB documents`);

    // Clear FAISS index file
    const indexPath = path.join(__dirname, '..', 'faiss_index.json');
    if (fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath);
      console.log("✅ Cleared FAISS index file");
    }

    await mongoose.disconnect();
    console.log("📡 Disconnected from database");

  } catch (error) {
    console.error("❌ Error clearing knowledge base:", error);
    throw error;
  }
}

// Comprehensive Knowledge Base with Better Content
const comprehensiveKB = [
  {
    title: "Complete Password Reset Guide for Work Accounts",
    text: `**How to Reset Your Work Password - Step by Step**

**Forgetting your password is common and easy to fix!**

**Method 1: Self-Service Password Reset (Recommended)**
1. Go to the company login page: login.company.com
2. Click "Forgot Password?" or "Reset Password"
3. Enter your work email address
4. Check your email for a password reset link
5. Click the link and create a new password
6. Your new password must be:
   - At least 8 characters long
   - Include uppercase and lowercase letters
   - Include at least one number
   - Include at least one special character (!@#$%^&*)

**Method 2: If You Remember Your Old Password**
1. Log in to any company system with your current password
2. Go to Account Settings or Profile
3. Click "Change Password"
4. Enter your old password
5. Enter your new password twice
6. Click Save

**Method 3: Contact IT Helpdesk**
If the above methods don't work:
1. Call the IT helpdesk: extension 1234
2. Provide your employee ID
3. Verify your identity with supervisor name or birth date
4. IT will reset your password and give you a temporary one
5. Change it immediately when you log in

**Important Notes:**
- Passwords expire every 90 days
- You cannot reuse your last 5 passwords
- Never share your password with anyone
- Use a password manager if needed
- Enable two-factor authentication when available

**Common Issues:**
- Check your spam/junk folder for reset emails
- Make sure you're using your work email, not personal
- Try a different browser if the link doesn't work
- Clear browser cache if having login issues

If you continue having issues after trying these steps, contact IT support directly.`
  },
  {
    title: "WiFi Connection Guide - Company Networks",
    text: `**How to Connect to Company WiFi Networks**

**Available Networks:**
- CorpNet (Corporate Network) - For work devices
- CompanyGuest - For visitors and personal devices
- CorpSecure - For sensitive work (requires special access)

**Connecting to CorpNet:**
1. Click the WiFi icon in your taskbar
2. Select "CorpNet" from the list of networks
3. Enter password: Welcome@2024 (case sensitive)
4. Click Connect
5. Open browser and accept terms if prompted
6. You should now be connected

**Connecting to CompanyGuest:**
1. Select "CompanyGuest" from WiFi networks
2. No password required
3. Open browser - you'll be redirected to guest portal
4. Accept terms and conditions
5. Limited internet access for guests

**Troubleshooting WiFi Issues:**
1. Forget the network and reconnect:
   - Right-click WiFi icon → Open Network Settings
   - Go to WiFi → Manage known networks
   - Find CorpNet → Forget
   - Then reconnect as above

2. Check signal strength - move closer to access point
3. Restart your device
4. Update WiFi drivers
5. Try connecting with different device to isolate issue

**Security Notes:**
- Never use personal hotspots for work
- Report suspicious WiFi networks
- Use CorpNet for all work-related activities
- CompanyGuest has limited access and is monitored

If you cannot connect after trying these steps, your device may need IT configuration. Contact support.`
  },
  {
    title: "Microsoft Outlook Email Setup and Troubleshooting",
    text: `**Complete Outlook Email Configuration Guide**

**Setting Up Outlook for the First Time:**
1. Open Outlook application
2. Click "File" → "Add Account"
3. Enter your work email address
4. Click "Connect"
5. Choose "Exchange" when prompted
6. Enter your password
7. Outlook will auto-configure settings

**Manual Configuration (if auto-setup fails):**
1. In Outlook: File → Account Settings → Account Settings
2. Click "New" or select your account
3. Account Type: Exchange
4. Email: your.name@company.com
5. Username: your.name@company.com
6. Password: your work password
7. Server: mail.company.com
8. Click "More Settings" → "Security" → Enable encryption

**Common Outlook Problems:**

**"Cannot Connect to Server":**
1. Check internet connection
2. Verify password is correct
3. Try sending/receiving manually: Send/Receive → Send/Receive All
4. Restart Outlook
5. Repair account: File → Account Settings → Repair

**"Sending Failed":**
1. Check attachment size (limit: 25MB)
2. Verify recipient email is correct
3. Check for special characters in subject
4. Try sending without attachments first
5. Clear Outbox: Send/Receive → Work Offline → Delete stuck emails

**"Receiving Emails Delayed":**
1. Check send/receive interval: File → Options → Advanced
2. Set to "Send immediately when connected"
3. Manually send/receive
4. Check server status with IT

**Outlook Running Slow:**
1. Close and restart Outlook
2. Disable add-ins: File → Options → Add-ins → Manage COM Add-ins
3. Compact mailbox: File → Account Settings → Data Files → Compact
4. Clear cache: File → Options → Advanced → Empty Cache
5. Repair Office installation

**Signature Issues:**
1. Create signature: File → Options → Mail → Signatures
2. Set as default for new messages and replies
3. Include company disclaimer if required
4. Test by sending email to yourself

If Outlook issues persist after these steps, your account may need server-side configuration. Contact IT support.`
  },
  {
    title: "VPN Connection Setup and Troubleshooting",
    text: `**Complete VPN Setup Guide for Remote Work**

**Installing VPN Software:**
1. Go to company software portal or IT website
2. Download the approved VPN client (Cisco AnyConnect, FortiClient, etc.)
3. Run installer as administrator
4. Accept default settings
5. Launch the VPN application

**Connecting to VPN:**
1. Open VPN client
2. Server address: vpn.company.com
3. Enter your work username and password
4. If prompted, enter two-factor authentication code
5. Click "Connect"
6. Wait for "Connected" status

**VPN Connection Issues:**

**"Connection Failed":**
1. Check internet connection stability
2. Verify server address is correct
3. Try connecting from different network
4. Restart VPN client
5. Restart computer
6. Check if VPN is blocked by firewall/antivirus

**"Authentication Failed":**
1. Verify username and password
2. Check if account is locked
3. Reset password if needed
4. Ensure two-factor app is working
5. Try different authentication method

**Slow VPN Performance:**
1. Test local internet speed first
2. Try different VPN protocols if available
3. Close bandwidth-heavy applications
4. Connect during off-peak hours
5. Check VPN server load

**VPN Disconnects Frequently:**
1. Check internet stability
2. Disable sleep mode on computer
3. Configure VPN to reconnect automatically
4. Update VPN client to latest version
5. Check for conflicting software

**Cannot Access Internal Resources:**
1. Verify VPN is connected and shows "Connected"
2. Try accessing resources by IP address instead of name
3. Flush DNS cache: cmd → ipconfig /flushdns
4. Check if split tunneling is enabled
5. Contact IT if DNS issues persist

**Mobile VPN Setup:**
1. Download company VPN app from app store
2. Configure with provided settings
3. Test connection on cellular data first
4. Enable always-on VPN if available
5. Set up biometric authentication

**Security Best Practices:**
- Never save passwords in VPN client
- Use strong, unique passwords
- Enable two-factor authentication
- Log off when not using VPN
- Report suspicious login attempts

If VPN issues continue after these steps, your account may need special configuration or there may be network issues. Contact IT support.`
  },
  {
    title: "Computer Performance Optimization Guide",
    text: `**Complete Guide to Speed Up Your Computer**

**Immediate Performance Boost:**
1. **Restart your computer** - Clears memory and closes hung processes
2. **Close unnecessary programs** - Check Task Manager (Ctrl+Shift+Esc)
3. **Clear desktop clutter** - Move files to appropriate folders
4. **Empty Recycle Bin** - Right-click → Empty Recycle Bin

**System Maintenance:**

**Free Up Disk Space:**
1. Open File Explorer → This PC
2. Check each drive's free space (need 20% free minimum)
3. Delete unnecessary files from Downloads, Documents, Desktop
4. Use Disk Cleanup: Search → "Disk Cleanup" → Clean system files
5. Uninstall unused programs: Settings → Apps → Uninstall

**Manage Startup Programs:**
1. Press Ctrl+Shift+Esc → Startup tab
2. Disable unnecessary programs
3. Keep only essential ones (antivirus, system tools)
4. Restart to apply changes

**Update Software:**
1. Windows Update: Settings → Update & Security → Check for updates
2. Update all Microsoft Office applications
3. Update antivirus and other security software
4. Update drivers: Search → "Device Manager" → Check for updates

**Malware Scan:**
1. Run full system scan with Windows Defender
2. Update virus definitions first
3. Quarantine or remove any threats found
4. Consider additional anti-malware scans

**Browser Optimization:**
1. Clear cache and cookies: Settings → Privacy → Clear browsing data
2. Disable unnecessary extensions
3. Update browser to latest version
4. Try different browser if issues persist

**Advanced Troubleshooting:**

**Check System Resources:**
1. Task Manager → Performance tab
2. Monitor CPU, Memory, Disk usage
3. Identify programs using excessive resources
4. End suspicious processes

**Disk Health Check:**
1. Run CHKDSK: Search → "cmd" → Right-click Run as admin
2. Type: chkdsk C: /f /r (requires restart)
3. Check for bad sectors

**Memory Issues:**
1. Run Windows Memory Diagnostic
2. Test with single RAM module if possible
3. Check for proper RAM seating
4. Update BIOS if needed

**Hardware Issues:**
1. Check fan operation and clean dust
2. Monitor temperatures with HWMonitor
3. Test hard drive with CrystalDiskInfo
4. Check power supply voltages

**System Restore (if recent issues):**
1. Search → "Create a restore point"
2. System Protection → System Restore
3. Choose a recent restore point
4. Follow wizard to restore

If performance issues persist after these steps, it may indicate hardware failure or need for upgrades. Contact IT support for further diagnosis.`
  },
  {
    title: "Printer Setup and Troubleshooting",
    text: `**Complete Printer Setup and Troubleshooting Guide**

**Setting Up a New Printer:**

**Network Printer Setup:**
1. Ensure printer is connected to network and powered on
2. Download drivers from manufacturer website
3. Go to Settings → Devices → Printers & scanners
4. Click "Add a printer or scanner"
5. Select your printer from the list
6. Install drivers if prompted
7. Print a test page

**USB Printer Setup:**
1. Connect printer to computer with USB cable
2. Windows should auto-detect and install drivers
3. If not, download drivers from manufacturer
4. Add printer in Settings → Devices → Printers & scanners
5. Select "The printer I want isn't listed"
6. Choose "Add a local printer" → USB option

**Wireless Printer Setup:**
1. Connect printer to WiFi network
2. Print network configuration page from printer
3. Note IP address
4. Add printer by IP: Settings → Devices → Printers & scanners
5. "Add a printer" → "The printer I want isn't listed"
6. Select "Add a printer using TCP/IP" → Enter IP address

**Common Printing Problems:**

**Printer Not Responding:**
1. Check printer power and connections
2. Restart printer and computer
3. Check printer queue: Settings → Devices → Printers
4. Cancel stuck print jobs
5. Restart Print Spooler service

**Print Quality Issues:**
1. Check toner/ink levels
2. Clean print heads (printer menu or software)
3. Align cartridges
4. Use correct paper type
5. Check for jammed paper

**Slow Printing:**
1. Reduce print quality settings
2. Check printer memory
3. Update printer firmware
4. Try different file formats
5. Check network speed for network printers

**Paper Jams:**
1. Turn off printer before clearing jam
2. Follow printer manual for jam location
3. Remove jammed paper gently
4. Check for torn paper pieces
5. Clean paper feed rollers

**Color Printing Problems:**
1. Check color cartridge levels
2. Clean color print heads
3. Run color calibration
4. Check printer color settings
5. Replace faulty cartridges

**Network Printer Issues:**
1. Check printer IP address and connectivity
2. Ping printer from command prompt
3. Check firewall settings
4. Update printer firmware
5. Reset printer network settings

**Driver Issues:**
1. Update printer drivers from manufacturer
2. Remove old printer and reinstall
3. Try generic printer driver
4. Check compatibility with Windows version
5. Run printer troubleshooter

**Multiple Printer Issues:**
1. Set correct printer as default
2. Remove duplicate printer instances
3. Clear print spooler: services.msc → Print Spooler → Restart
4. Update Windows print components

If printer issues persist after these steps, it may require hardware repair or replacement. Contact IT support.`
  },
  {
    title: "File Access and Permission Issues",
    text: `**Complete Guide to File Access Problems**

**Basic File Access Checks:**
1. Verify file path is correct
2. Check if file exists in that location
3. Try accessing from different user account
4. Check file properties for read-only status

**Permission Issues:**

**Local File Permissions:**
1. Right-click file/folder → Properties → Security tab
2. Check if your username is listed
3. Verify you have Read/Write permissions
4. Take ownership if needed: Advanced → Change owner

**Network Share Permissions:**
1. Check if you're connected to company VPN
2. Map network drive if not auto-connected
3. Verify share permissions with IT
4. Check group membership for access

**OneDrive/SharePoint Issues:**
1. Check file sync status
2. Verify you're logged in with correct account
3. Check if file is checked out by another user
4. Clear browser cache for web access

**Common Access Problems:**

**"Access Denied" Error:**
1. Check file/folder permissions
2. Verify account has proper access rights
3. Check if file is encrypted
4. Try accessing as administrator

**"File Not Found" Error:**
1. Check file path and spelling
2. Verify file wasn't moved or deleted
3. Check if file is hidden
4. Search for file using different criteria

**"File Is Open By Another User":**
1. Check who has file open (SharePoint/OneDrive)
2. Ask user to close file
3. Wait for auto-checkout timeout
4. Contact IT for forced checkout if needed

**"Permission Changes":**
1. Check if permissions were recently modified
2. Verify group memberships are current
3. Check for permission inheritance issues
4. Contact IT for permission audits

**Mapped Drive Issues:**
1. Check drive mapping: net use command
2. Remap drives: net use Z: \\\\server\\share
3. Check network connectivity
4. Verify credentials are correct

**Cloud Storage Issues:**
1. Check account quota and usage
2. Verify file size limits
3. Check upload/download speeds
4. Clear local cache

**Encryption Issues:**
1. Check if you have encryption certificates
2. Verify encryption key access
3. Check BitLocker status for drives
4. Contact IT for encryption recovery

**Recent Changes:**
1. Check if permissions changed recently
2. Review audit logs
3. Check for system updates affecting permissions
4. Verify account status (not locked/disabled)

**Temporary Solutions:**
1. Save file with different name
2. Save to different location
3. Ask colleague to share file
4. Use alternative access method

If file access issues persist after these steps, contact IT support with specific error messages and file paths.`
  },
  {
    title: "Software Installation and Update Issues",
    text: `**Complete Software Installation Troubleshooting**

**Pre-Installation Checks:**
1. Check system requirements for the software
2. Verify you have administrator rights
3. Ensure sufficient disk space (2-3x installation size)
4. Close all other applications
5. Temporarily disable antivirus

**Installation Process:**
1. Download from official company portal or vendor site
2. Right-click installer → "Run as administrator"
3. Accept license agreement
4. Choose custom installation if needed
5. Follow installation wizard completely
6. Restart computer after installation

**Common Installation Errors:**

**"Access Denied" or "Insufficient Privileges":**
1. Run installer as administrator
2. Check user account permissions
3. Verify account is not restricted
4. Contact IT for elevated privileges

**"Installation Failed" or "Setup Interrupted":**
1. Check available disk space
2. Close background applications
3. Disable antivirus temporarily
4. Try installation in Safe Mode
5. Check Windows Installer service status

**"Missing DLL" or Dependency Errors:**
1. Install required prerequisites first
2. Update .NET Framework and Visual C++ Redistributables
3. Run Windows Update for latest patches
4. Check software compatibility

**"Corrupt Download" Errors:**
1. Verify file checksum/hash if provided
2. Redownload from trusted source
3. Scan file with antivirus
4. Try different download method

**Update Installation Issues:**
1. Check internet connection stability
2. Temporarily disable firewall
3. Close all applications before updating
4. Install updates individually if batch fails
5. Check disk space for update files

**Uninstallation Problems:**
1. Use Programs and Features in Control Panel
2. Try third-party uninstaller if standard fails
3. Remove leftover registry entries carefully
4. Clean temporary files

**License/Activation Issues:**
1. Verify license key is correct and unused
2. Check license type (perpetual/subscription)
3. Ensure internet connection for online activation
4. Contact vendor for license issues

**Compatibility Issues:**
1. Check software compatibility with OS version
2. Run compatibility troubleshooter
3. Try running in compatibility mode
4. Update software to latest version

**Post-Installation Steps:**
1. Run Windows Update
2. Update installed software
3. Configure software settings
4. Test basic functionality
5. Create system restore point

**Software-Specific Issues:**

**Microsoft Office Installation:**
1. Use Office Deployment Tool for enterprise installs
2. Check Office 365 license status
3. Repair Office installation if needed
4. Update Windows Installer

**Antivirus Software Conflicts:**
1. Temporarily disable existing antivirus
2. Install new antivirus
3. Configure exclusions for system files
4. Run both products in compatibility mode

If installation issues persist after these steps, the software may be incompatible or corrupted. Contact IT support or software vendor.`
  },
  {
    title: "System Crash and Blue Screen Troubleshooting",
    text: `**Complete Guide to System Crashes and Blue Screens**

**Immediate Response to Crashes:**
1. Note the exact error message and code
2. Check if crash happens at specific times
3. Restart computer and monitor for recurrence
4. Check system temperatures and fan operation

**Blue Screen (BSOD) Analysis:**
1. Record the error code (e.g., IRQL_NOT_LESS_OR_EQUAL)
2. Note if same error repeats
3. Check for pattern (specific program, time, activity)
4. Boot into Safe Mode to isolate issues

**Memory-Related Crashes:**
1. Run Windows Memory Diagnostic Tool
2. Test RAM with MemTest86 or similar
3. Check RAM seating and compatibility
4. Test with single RAM module
5. Update BIOS to latest version

**Driver Issues:**
1. Check Device Manager for yellow exclamation marks
2. Update all drivers from manufacturer websites
3. Roll back recently updated drivers
4. Uninstall problematic drivers
5. Use Driver Verifier for testing

**Overheating Problems:**
1. Clean dust from fans and heat sinks
2. Check CPU/GPU temperatures (should be <80°C)
3. Ensure proper case ventilation
4. Replace thermal paste if needed
5. Monitor with HWMonitor or similar

**Hard Drive Issues:**
1. Run CHKDSK: cmd → "chkdsk C: /f /r"
2. Check SMART status with CrystalDiskInfo
3. Test drive speed with HD Tune
4. Check for bad sectors
5. Backup data before further testing

**Power Supply Problems:**
1. Check PSU voltages with multimeter
2. Listen for unusual fan noises
3. Test with known good power supply
4. Check power connectors are secure
5. Verify power strip is functioning

**Software Conflicts:**
1. Uninstall recently installed programs
2. Run System Restore to previous date
3. Check for malware with multiple scanners
4. Disable startup programs
5. Test in Clean Boot environment

**Windows Update Issues:**
1. Check for problematic updates in history
2. Hide or uninstall bad updates
3. Run Windows Update Troubleshooter
4. Reset Windows Update components
5. Install updates manually

**BIOS/UEFI Problems:**
1. Reset BIOS to default settings
2. Update to latest BIOS version
3. Check boot order settings
4. Clear CMOS if needed
5. Test with minimal hardware

**Crash Dump Analysis:**
1. Enable crash dump creation in System Properties
2. Use WinDbg to analyze memory dumps
3. Check Microsoft crash databases
4. Look for known issues and fixes
5. Update drivers based on analysis

**Hardware Testing:**
1. Test components individually
2. Use Ultimate Boot CD for diagnostics
3. Check event logs for hardware errors
4. Monitor voltages and temperatures
5. Swap components to isolate failures

**Advanced Diagnostics:**
1. Run System File Checker: "sfc /scannow"
2. Check disk for errors: "chkdsk /f /r"
3. Run DISM: "DISM /Online /Cleanup-Image /RestoreHealth"
4. Check for Windows corruption
5. Prepare for repair installation

If crashes continue after these steps, it likely indicates hardware failure requiring professional service. Contact IT support immediately with error codes and crash details.`
  },
  {
    title: "Mobile Device Management and Security",
    text: `**Complete Mobile Device Setup and Security Guide**

**Company Device Enrollment:**
1. Install company MDM app from app store
2. Launch app and enter work email
3. Accept device management policies
4. Install required certificates and profiles
5. Set up work email and accounts

**Security Configuration:**
1. Set strong device passcode (6+ digits)
2. Enable biometric authentication (fingerprint/face)
3. Set auto-lock to 1-2 minutes
4. Enable remote wipe capability
5. Turn on Find My Device features

**Email Setup on Mobile:**
1. Add Exchange account in Settings → Accounts
2. Enter work email and password
3. Configure server settings if prompted
4. Enable SSL/TLS encryption
5. Set sync preferences (how far back to sync)

**VPN Setup for Mobile:**
1. Install approved VPN app
2. Configure with company VPN settings
3. Set up authentication (certificate/password)
4. Enable always-on VPN if required
5. Test connection to internal resources

**App Management:**
1. Install required work apps from company portal
2. Check app permissions and grant as needed
3. Keep apps updated regularly
4. Remove personal apps if company policy requires
5. Use work profiles when available

**WiFi Configuration:**
1. Connect to CorpNet with proper credentials
2. Accept security certificates
3. Configure proxy settings if required
4. Set WiFi to auto-connect
5. Test connectivity to work resources

**Device Performance Issues:**
1. Close unnecessary background apps
2. Clear app cache regularly
3. Check available storage space
4. Update OS and apps
5. Restart device weekly

**Battery Optimization:**
1. Check battery usage in settings
2. Close power-intensive apps
3. Adjust screen brightness and timeout
4. Disable unnecessary notifications
5. Use battery saver mode when needed

**Security Best Practices:**
1. Never jailbreak/root the device
2. Install updates as soon as available
3. Use strong, unique passwords
4. Enable two-factor authentication
5. Report lost/stolen devices immediately

**Remote Management:**
1. IT can remotely lock lost devices
2. Full wipe capability for security
3. Location tracking when enabled
4. App installation and configuration
5. Security policy enforcement

**Compliance Monitoring:**
1. Regular security scans
2. Policy compliance checks
3. App and OS version verification
4. Network access control
5. Data encryption verification

**Troubleshooting Mobile Issues:**
1. Force restart device (varies by model)
2. Reset network settings
3. Clear app cache and data
4. Remove and re-add accounts
5. Contact IT for MDM-related issues

If mobile device issues persist, contact IT support with device model, OS version, and specific error messages.`
  }
];

async function rebuildKnowledgeBase() {
  console.log("🔄 Rebuilding knowledge base with comprehensive content...\n");

  const token = await loginAndGetToken();
  if (!token) {
    console.error("❌ Cannot proceed without token");
    return;
  }

  console.log(`📝 Adding ${comprehensiveKB.length} comprehensive guides...\n`);

  for (let i = 0; i < comprehensiveKB.length; i++) {
    const content = comprehensiveKB[i];
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

  console.log("\n🎯 Knowledge base rebuilt successfully!");
  console.log("\n🧪 Now test these common issues:");
  console.log("  ✅ 'password reset of work account' → Direct step-by-step guide");
  console.log("  ✅ 'how do I connect to company WiFi' → Complete instructions");
  console.log("  ✅ 'outlook not working' → Detailed email troubleshooting");
  console.log("  ✅ 'VPN not connecting' → Comprehensive VPN guide");
  console.log("  ✅ 'computer running slow' → Performance optimization");
  console.log("  ✅ 'printer not working' → Full printer setup");
  console.log("  ✅ 'cannot access file' → Permission troubleshooting");
  console.log("  ✅ 'software won't install' → Installation guide");
  console.log("  ✅ 'system crashes' → Crash analysis and fixes");
  console.log("  ✅ 'mobile device setup' → MDM and security guide");

  console.log("\n📈 Total knowledge base articles: 10 comprehensive guides");
  console.log("\n🧠 Password reset and other common issues should now be resolved directly!");
}

async function main() {
  try {
    await clearKnowledgeBase();
    console.log("\n" + "=".repeat(50));
    await rebuildKnowledgeBase();
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

main();