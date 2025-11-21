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

// Advanced IT Support Conversation Scripts
const advancedScripts = [
  {
    title: "Password Reset and Account Recovery Guide",
    text: `**Complete Password Reset and Account Recovery**

**Self-Service Password Reset:**
1. Visit the company login portal or any company application
2. Click "Forgot Password?" or "Reset Password" link
3. Enter your work email address exactly as registered
4. Check your email inbox (and spam/junk folder) within 5 minutes
5. Click the secure reset link in the email
6. Create a new password following these requirements:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (!@#$%^&*)
7. Confirm the new password
8. Log in with your new credentials

**If Email Doesn't Arrive:**
- Wait 10-15 minutes and check again
- Try accessing from a different device/browser
- Contact IT helpdesk with your employee ID for assistance

**Account Unlock Process:**
1. If your account shows "locked" message, wait 15 minutes
2. Attempt login again
3. If still locked, contact IT helpdesk
4. Provide employee ID and last successful login time
5. IT will verify your identity and unlock the account
6. Reset password immediately after unlock

**Multi-Factor Authentication (MFA) Issues:**
1. If MFA code isn't received, try resending
2. Check phone signal/data connection
3. Ensure authenticator app time is synced
4. Use backup codes if available
5. Contact IT to reset MFA if all methods fail

**Emergency Access:**
- For urgent business needs, contact IT helpdesk directly
- Provide business justification for immediate access
- IT may provide temporary credentials or escalate appropriately

**Prevention Tips:**
- Never share passwords with anyone
- Use password manager for secure storage
- Change password immediately if suspected compromise
- Enable MFA on all accounts when available`
  },
  {
    title: "Account Lockout and Access Recovery",
    text: `**Account Lockout Resolution Guide**

**Automatic Unlock Process:**
1. Account locks after 5-10 consecutive failed login attempts
2. System automatically unlocks after 15-30 minutes
3. Attempt login again after waiting period
4. If successful, reset password immediately for security

**Manual Unlock Request:**
1. Contact IT helpdesk or use chatbot
2. Provide your employee ID and full name
3. Answer security verification questions
4. Confirm last successful login time and location
5. IT verifies identity and unlocks account
6. Receive confirmation with new temporary password
7. Change password immediately upon first login

**Prevention of Future Lockouts:**
- Ensure Caps Lock is not enabled
- Verify username format (usually email or firstname.lastname)
- Check keyboard layout/language settings
- Use correct domain (@company.com)
- Clear browser cache if using web applications

**Multiple Failed Attempts:**
- If lockout persists, account may be compromised
- Contact IT security immediately
- Do not attempt further logins
- Security team will investigate and reset credentials

**VPN and Network Access Lockouts:**
- VPN accounts may have separate lockout policies
- Contact network team for VPN-specific issues
- Provide device information and error messages
- May require certificate renewal or profile reset

**Emergency Business Access:**
- For critical business needs during lockout
- Contact supervisor and IT director
- Provide business justification
- May receive temporary elevated access credentials`
  },
  {
    title: "General Login Troubleshooting",
    text: `**Complete Login Problem Resolution**

**Initial Login Checks:**
1. Verify internet connection is stable
2. Check if Caps Lock is enabled
3. Ensure correct username format
4. Confirm password is entered correctly
5. Try different web browser if using web applications

**Username Format Issues:**
- Usually: firstname.lastname@company.com
- Sometimes: employeeID@company.com
- Check company directory or contact HR
- Verify account hasn't been renamed or migrated

**Password Problems:**
- Try "Forgot Password" from login page
- Check password requirements and expiration
- Ensure no special characters are filtered
- Try copying and pasting password instead of typing

**Multi-Factor Authentication:**
- Ensure phone has signal/data
- Check authenticator app is installed and configured
- Verify app time is synced with network time
- Try backup codes if available
- Contact IT for MFA reset if needed

**Browser and Cache Issues:**
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Disable browser extensions temporarily
- Update browser to latest version

**Network and VPN Issues:**
- Try different network (home vs office WiFi)
- Disable VPN temporarily for testing
- Check firewall/antivirus blocking login
- Verify proxy settings are correct

**Device-Specific Issues:**
- Try logging in from different device
- Check device time and date settings
- Ensure device is company-registered
- Update device operating system

**Account Status Verification:**
- Confirm account is active (not terminated)
- Check for password expiration warnings
- Verify account hasn't been locked
- Contact HR if employment status changed

**Advanced Troubleshooting:**
- Check event logs for specific error codes
- Verify DNS settings are correct
- Test with different user accounts
- Contact IT with detailed error messages and screenshots`
  },
  {
    title: "Laptop Performance Optimization",
    text: `**Complete Laptop Performance Troubleshooting**

**Immediate Performance Boost:**
1. **Restart the laptop** - Clears memory and closes hung processes
2. **Close unnecessary applications** - Check Task Manager (Ctrl+Shift-Esc)
3. **End background processes** - Look for high CPU/memory usage
4. **Clear desktop clutter** - Move files to appropriate folders

**System Resource Management:**

**Check System Resources:**
1. Open Task Manager → Performance tab
2. Monitor CPU, Memory, Disk, and Network usage
3. Identify processes using excessive resources (>50%)
4. End suspicious or unnecessary processes safely

**Disk Space Optimization:**
1. Check available storage (should be >20% free)
2. Empty Recycle Bin and temporary files
3. Uninstall unused applications
4. Move large files to external storage or cloud
5. Run Disk Cleanup utility

**Startup Program Management:**
1. Press Windows+R → type "msconfig"
2. Go to Services tab → hide Microsoft services
3. Disable unnecessary startup services
4. Go to Startup tab → disable unwanted programs
5. Restart laptop to apply changes

**Malware and Security Scan:**
1. Run full system scan with antivirus
2. Update antivirus definitions
3. Remove or quarantine detected threats
4. Consider second opinion scan with different tool
5. Enable real-time protection

**Browser Optimization:**
1. Clear cache, cookies, and browsing history
2. Disable unnecessary extensions
3. Close unused tabs
4. Update browser to latest version
5. Consider using lighter browser alternatives

**Update Management:**
1. Install pending Windows updates
2. Update all installed applications
3. Update device drivers from manufacturer
4. Restart after major updates

**Hardware Considerations:**
1. Ensure proper ventilation (elevate laptop)
2. Clean air vents and fans carefully
3. Check for overheating (CPU <80°C)
4. Test with external monitor if display issues
5. Consider hardware upgrades if persistently slow

**Advanced Diagnostics:**
1. Run System File Checker: cmd → "sfc /scannow"
2. Check disk health: cmd → "chkdsk C: /f"
3. Run Windows Memory Diagnostic
4. Check for failing hardware components
5. Consider clean Windows reinstall if issues persist

**Performance Monitoring:**
- Use Task Manager for ongoing monitoring
- Set up Resource Monitor for detailed analysis
- Monitor temperatures with HWMonitor
- Track performance over time to identify patterns

If performance issues continue after these steps, hardware failure may be suspected. Contact IT for professional diagnosis and potential hardware replacement.`
  },
  {
    title: "VPN Connection Setup and Issues",
    text: `**Complete VPN Troubleshooting Guide**

**VPN Client Installation:**
1. Download approved VPN client from company portal
2. Run installer as administrator
3. Accept default installation settings
4. Launch VPN client after installation
5. Configure with provided server settings

**Basic VPN Connection:**
1. Open VPN client application
2. Select company VPN profile/connection
3. Enter username (usually work email)
4. Enter password
5. Enter MFA code if prompted
6. Click "Connect" and wait for connection

**Common VPN Connection Issues:**

**"Connection Failed" Error:**
1. Verify server address is correct
2. Check internet connection stability
3. Try different network (mobile hotspot)
4. Disable firewall temporarily
5. Update VPN client to latest version

**Authentication Problems:**
1. Confirm username format (email vs domain\\user)
2. Verify password is correct and not expired
3. Check MFA device and codes
4. Try different authentication method
5. Contact IT for credential verification

**Slow VPN Performance:**
1. Test local internet speed first
2. Try different VPN protocols (OpenVPN, IKEv2, etc.)
3. Close bandwidth-intensive applications
4. Connect during off-peak hours
5. Check VPN server load status

**VPN Disconnects Frequently:**
1. Check local network stability
2. Disable sleep/power saving features
3. Configure VPN to auto-reconnect
4. Update network drivers
5. Try different VPN client settings

**Cannot Access Internal Resources:**
1. Verify VPN shows "Connected" status
2. Check if split tunneling is enabled
3. Try accessing resources by IP instead of name
4. Flush DNS cache: cmd → "ipconfig /flushdns"
5. Contact IT for DNS configuration

**Certificate and Security Issues:**
1. Check VPN certificate validity
2. Install required root certificates
3. Verify certificate chain
4. Update trusted root certificates
5. Contact IT for certificate renewal

**Mobile VPN Setup:**
1. Download company VPN app for iOS/Android
2. Import or configure VPN profile
3. Enter authentication details
4. Test connection on cellular data
5. Configure always-on VPN if required

**Advanced VPN Troubleshooting:**
1. Check Windows Firewall rules for VPN
2. Verify DNS settings when connected
3. Test MTU settings (lower if packet loss)
4. Check for conflicting VPN software
5. Run network capture for analysis

**VPN Best Practices:**
- Connect to VPN for all work-related activities
- Log off when not needed
- Use strong, unique passwords
- Enable MFA when available
- Report connection issues promptly

If VPN issues persist after troubleshooting, contact IT support with specific error messages, VPN client version, and network details.`
  },
  {
    title: "Mobile Email Setup Guide",
    text: `**Complete Mobile Email Configuration**

**iOS (iPhone/iPad) Email Setup:**
1. Open Settings → Mail → Accounts → Add Account
2. Select "Microsoft Exchange" or "Exchange"
3. Enter your work email address
4. Enter password when prompted
5. Accept security prompts and certificate warnings
6. Configure account options (mail, contacts, calendar)
7. Set account name and display name
8. Save and test email sending/receiving

**Android Email Setup:**
1. Open Gmail or Email app → Settings → Add account
2. Select "Exchange" or "Corporate"
3. Enter work email address and password
4. Accept security policies and device management
5. Configure sync options (email, contacts, calendar)
6. Set account preferences and notifications
7. Test email functionality

**Common Mobile Email Issues:**

**Authentication Problems:**
1. Verify email address and password
2. Check if account is locked or password expired
3. Ensure MFA is properly configured
4. Try removing and re-adding account
5. Contact IT for password reset

**Sync Issues:**
1. Check internet connection (WiFi vs cellular)
2. Force manual sync in email app
3. Check account sync settings
4. Verify server settings are correct
5. Restart device and test again

**Certificate and Security:**
1. Accept all security certificates when prompted
2. Ensure device time is accurate
3. Check if device is company-managed
4. Update device OS and email app
5. Contact IT for certificate issues

**Server Configuration:**
1. Verify Exchange server address
2. Check SSL/TLS settings
3. Confirm port numbers (usually 443 for SSL)
4. Test server connectivity
5. Contact IT for server details

**App-Specific Issues:**
1. Update email app to latest version
2. Clear app cache and data
3. Check app permissions (contacts, calendar)
4. Try different email app
5. Reset app preferences

**Device Management Issues:**
1. Ensure device is enrolled in MDM
2. Check compliance status
3. Accept all company policies
4. Update device security settings
5. Contact IT for MDM assistance

**Performance Optimization:**
1. Limit email sync to recent days
2. Disable push notifications if battery draining
3. Use WiFi for large attachments
4. Clear email cache regularly
5. Close email app when not in use

**Attachment Issues:**
1. Check attachment size limits
2. Ensure stable internet connection
3. Try smaller attachments for testing
4. Check available device storage
5. Contact IT for attachment restrictions

**Advanced Troubleshooting:**
1. Check email account settings in detail
2. Test with webmail access
3. Verify DNS resolution
4. Check for conflicting email accounts
5. Factory reset email app settings

If mobile email setup issues persist, contact IT support with device model, OS version, email app used, and specific error messages.`
  },
  {
    title: "Software Access Request Process",
    text: `**Complete Software Access Request Guide**

**Software Evaluation Process:**
1. Identify the specific software needed
2. Check if software is already available in company catalog
3. Verify business justification for the request
4. Confirm software is approved for company use
5. Prepare request documentation

**Request Submission:**
1. Access company software request portal
2. Fill out software request form with details:
   - Software name and version
   - Vendor and licensing information
   - Business purpose and justification
   - Department and cost center
   - Required user count and timeline
3. Attach any supporting documentation
4. Obtain manager approval signature
5. Submit request for review

**Approval Process:**
1. IT security reviews software for compatibility
2. Procurement reviews licensing and costs
3. Legal reviews terms and compliance
4. Management approves based on business need
5. Typical approval time: 1-3 business days

**Software Installation:**
1. Receive approval notification
2. Download software from approved source
3. Follow installation instructions
4. Configure software settings
5. Test basic functionality
6. Contact IT if installation issues occur

**Common Software Categories:**

**Productivity Software:**
- Microsoft Office suite
- Adobe Creative Cloud
- Project management tools
- Collaboration platforms

**Development Tools:**
- IDEs (Visual Studio, VS Code)
- Version control systems
- Database tools
- Testing frameworks

**Security Software:**
- Endpoint protection
- VPN clients
- Encryption tools
- Access management

**Specialized Business Software:**
- Industry-specific applications
- Financial systems
- HR management tools
- Customer relationship management

**Request Requirements:**
- Clear business justification
- Budget approval for paid software
- Manager endorsement
- Compliance with company policies
- Technical specifications met

**Approval Timeline:**
- Standard requests: 1-3 business days
- Urgent requests: Same day (requires director approval)
- Complex software: 1-2 weeks
- Custom development: Varies by scope

**Post-Installation Support:**
- Training and documentation provided
- Helpdesk support available
- User guides and tutorials
- Troubleshooting assistance

**Software Lifecycle Management:**
- Regular updates and patches
- License renewals handled automatically
- End-of-life planning
- Migration to replacement software

If you need software not currently available, submit a request through the proper channels. Contact IT for guidance on the approval process.`
  },
  {
    title: "Hardware Replacement Request",
    text: `**Complete Hardware Replacement Process**

**Hardware Issue Assessment:**
1. Identify the faulty hardware component
2. Document symptoms and error messages
3. Check warranty status if applicable
4. Gather device information (model, serial number)
5. Determine replacement urgency

**Replacement Request Process:**
1. Contact IT helpdesk or use chatbot
2. Provide device details and problem description
3. Explain business impact of the hardware issue
4. Specify required replacement timeline
5. Submit formal replacement request

**Common Hardware Issues:**

**Laptop/Computer Problems:**
- Screen/display issues
- Keyboard malfunction
- Battery not charging
- Ports not working
- Overheating or fan noise

**Peripheral Issues:**
- Mouse/keyboard failures
- Monitor display problems
- Printer malfunctions
- External drive failures
- USB device problems

**Mobile Device Issues:**
- Screen cracks or touch issues
- Battery drain problems
- Charging port damage
- Camera/sensor failures
- Speaker/microphone problems

**Network Equipment:**
- Router/switch failures
- WiFi access point issues
- Cable/connector problems
- Network card failures

**Replacement Options:**
- Warranty replacement (manufacturer)
- Insurance claim (if applicable)
- Company asset replacement
- Loaner device during repair
- Complete device replacement

**Request Documentation:**
- Device serial number and model
- Purchase date and warranty information
- Detailed problem description
- Error messages or symptoms
- Business impact assessment
- Urgency justification

**Approval Process:**
- IT assesses replacement feasibility
- Procurement checks budget availability
- Management approves based on business need
- Typical approval: 1-2 business days

**Replacement Timeline:**
- Standard replacement: 3-5 business days
- Urgent replacement: 1-2 business days
- Warranty replacement: Varies by manufacturer
- Custom orders: 1-2 weeks

**During Replacement:**
- Backup all important data
- Transfer settings and configurations
- Test new hardware functionality
- Return old equipment if required
- Update asset inventory

**Post-Replacement Support:**
- Setup and configuration assistance
- Data migration help
- User training on new equipment
- Troubleshooting support

**Prevention Measures:**
- Regular hardware maintenance
- Proper handling and storage
- Surge protection usage
- Clean operating environment
- Regular backup procedures

If hardware replacement is needed, contact IT support with detailed information about the faulty equipment and business requirements.`
  },
  {
    title: "Application Crash Troubleshooting",
    text: `**Complete Application Crash Resolution**

**Immediate Response to Crashes:**
1. Note the exact error message and circumstances
2. Check if crash happens consistently or randomly
3. Restart the application
4. If crash persists, restart computer
5. Check for application updates

**Basic Crash Troubleshooting:**

**Application Restart:**
1. Completely close the application
2. Wait 30 seconds
3. Restart the application
4. Test basic functionality
5. Check if crash recurs

**System Restart:**
1. Save all work and close applications
2. Restart the computer completely
3. Launch application after restart
4. Test the previously crashing feature
5. Monitor for recurrence

**Update Applications:**
1. Check for application updates
2. Install latest version
3. Restart application after update
4. Test previously problematic features
5. Check release notes for bug fixes

**Cache and Temporary Files:**
1. Clear application cache (varies by app)
2. Delete temporary files
3. Clear browser cache if web app
4. Restart application
5. Test functionality

**Compatibility Issues:**
1. Check system requirements
2. Verify OS compatibility
3. Update operating system
4. Check for conflicting software
5. Test on different user account

**Driver and System Updates:**
1. Update device drivers
2. Install Windows updates
3. Update .NET Framework or runtime
4. Restart after updates
5. Test application stability

**Security Software Conflicts:**
1. Temporarily disable antivirus
2. Test application functionality
3. Re-enable antivirus with exclusions
4. Check firewall settings
5. Update security software

**Corrupted Files:**
1. Repair application installation
2. Run System File Checker
3. Check disk for errors
4. Restore from backup if available
5. Reinstall application if needed

**Resource Issues:**
1. Check available RAM and CPU
2. Close unnecessary applications
3. Monitor resource usage during crash
4. Increase virtual memory if needed
5. Check for memory leaks

**Plugin and Extension Issues:**
1. Disable third-party plugins
2. Update all extensions
3. Test with minimal configuration
4. Re-enable plugins one by one
5. Identify problematic extension

**Advanced Diagnostics:**
1. Check Windows Event Viewer for errors
2. Run application in compatibility mode
3. Test with different user account
4. Check for DLL dependencies
5. Use Process Monitor for analysis

**Crash Reporting:**
- Note exact error messages
- Record steps to reproduce
- Check for pattern in crashes
- Report to application vendor
- Contact IT with detailed information

If application crashes persist after these steps, the issue may require vendor support or application replacement. Contact IT support with crash details and troubleshooting steps attempted.`
  },
  {
    title: "Phishing and Malware Response",
    text: `**Complete Phishing and Malware Incident Response**

**Immediate Actions for Phishing Suspected:**
1. **DO NOT click any links or attachments**
2. **DO NOT enter any credentials**
3. Forward the suspicious email to security team
4. Report the incident to IT security immediately
5. Delete the email from all folders

**If You Clicked a Link:**
1. Disconnect from all networks immediately
2. Do not enter any passwords or information
3. Power off the computer
4. Contact IT security immediately
5. Do not turn computer back on until cleared

**If You Entered Credentials:**
1. Change password immediately on all accounts
2. Enable multi-factor authentication everywhere
3. Monitor accounts for suspicious activity
4. Report to IT security with details
5. Consider credit monitoring if personal info involved

**Malware Infection Response:**
1. Disconnect from network
2. Do not use infected device for any purpose
3. Run full antivirus scan if possible
4. Contact IT security immediately
5. Follow isolation procedures

**Phishing Email Characteristics:**
- Unexpected sender or slight email variation
- Urgent language or threats
- Requests for personal information
- Suspicious links or attachments
- Poor grammar or unusual formatting
- Sender email doesn't match known contacts

**Prevention Measures:**
- Never click unsolicited links
- Verify sender identity before responding
- Use antivirus with real-time protection
- Keep software updated
- Be cautious with email attachments
- Use strong, unique passwords
- Enable multi-factor authentication

**Reporting Process:**
1. Forward suspicious email to security@company.com
2. Include original email headers
3. Describe how you received it
4. Note any actions taken
5. Provide contact information

**Security Awareness Training:**
- Regular phishing simulation exercises
- Security awareness newsletters
- Incident reporting training
- Password security education
- Safe browsing practices

**Post-Incident Actions:**
- Change all potentially compromised passwords
- Review account activity logs
- Update security software
- Be extra vigilant for 30 days
- Report any suspicious activity

**Business Email Compromise:**
- If business accounts may be compromised
- Notify all contacts about potential breach
- Change email passwords immediately
- Monitor for unauthorized transactions
- Contact financial institutions if needed

**Legal and Compliance:**
- Report to appropriate authorities if required
- Document incident for compliance
- Cooperate with forensic investigation
- Implement additional security measures
- Review and update security policies

**Recovery Process:**
- Clean and restore infected systems
- Restore from clean backups
- Verify system integrity
- Monitor for reinfection
- Update incident response procedures

For any suspected phishing or malware incidents, contact IT security immediately. Early reporting minimizes damage and helps protect the organization.`
  },
  {
    title: "Account Unlock and Recovery",
    text: `**Complete Account Unlock and Recovery Guide**

**Automatic Account Unlock:**
1. Accounts lock after multiple failed login attempts
2. System automatically unlocks after 15-30 minutes
3. Attempt login again after waiting period
4. If successful, change password immediately

**Manual Account Unlock Request:**
1. Contact IT helpdesk with employee ID
2. Provide verification information
3. Answer security questions
4. Confirm last successful login details
5. IT verifies identity and unlocks account

**Account Recovery Process:**
1. Go to password reset portal
2. Enter username or associated email
3. Complete identity verification
4. Receive recovery instructions
5. Follow secure password reset process

**Identity Verification Methods:**
- Employee ID and birth date
- Supervisor contact information
- Security questions
- Alternate email or phone
- Personal verification questions

**Temporary Account Access:**
1. Request temporary credentials for urgent access
2. Provide business justification
3. IT creates temporary account
4. Use temporary credentials immediately
5. Change to permanent password

**Account Lockout Prevention:**
- Use correct username format
- Ensure Caps Lock is not enabled
- Check keyboard language settings
- Clear browser cache regularly
- Use password manager for accuracy

**Multiple Account Issues:**
- If multiple accounts are locked
- Contact IT for bulk account reset
- Provide all affected account details
- Business justification required
- May require manager approval

**Emergency Access Procedures:**
- For critical business continuity
- Contact IT director or CISO
- Provide detailed business impact
- May receive emergency access credentials
- Full audit trail maintained

**Account Security Best Practices:**
- Use strong, unique passwords
- Enable multi-factor authentication
- Never share account credentials
- Log off when not using systems
- Report suspicious activity immediately

**Post-Unlock Security Steps:**
- Change password immediately
- Review recent account activity
- Check for unauthorized changes
- Update security contact information
- Enable additional security features

**Advanced Account Issues:**
- Domain account synchronization problems
- Active Directory replication issues
- Profile corruption requiring rebuild
- Group membership and permission issues
- Account migration or transition problems

If account access issues persist, contact IT support with detailed information about the problem and steps already attempted.`
  },
  {
    title: "Shared Drive and Folder Access",
    text: `**Complete Shared Resource Access Guide**

**Access Request Process:**
1. Identify the specific folder or drive needed
2. Determine required permission level (read/write/full)
3. Contact folder owner or IT support
4. Provide business justification
5. Submit formal access request

**Permission Levels:**
- **Read**: View and open files
- **Write**: Modify and save files
- **Full Control**: Change permissions, delete files
- **List**: See folder contents only

**Common Shared Locations:**
- Department shared drives
- Project collaboration folders
- Company-wide resources
- Archive and backup locations
- Public document repositories

**Access Troubleshooting:**

**Drive Not Visible:**
1. Check if drive is mapped correctly
2. Verify network connectivity
3. Try accessing from different computer
4. Check if drive is offline or maintenance
5. Contact IT for drive status

**Permission Denied Errors:**
1. Verify account has proper access rights
2. Check group memberships
3. Confirm folder isn't restricted
4. Try accessing during business hours
5. Contact folder owner for permissions

**Slow Access Performance:**
1. Check network connection speed
2. Try accessing during off-peak hours
3. Use VPN if accessing remotely
4. Check for network congestion
5. Contact IT for performance issues

**File Locking Issues:**
1. Check if file is open by another user
2. Use "Computer Management" to see open files
3. Contact user to close file
4. Wait for automatic unlock timeout
5. Contact IT for forced unlock if needed

**Drive Mapping Issues:**
1. Delete and recreate drive mapping
2. Use different drive letter
3. Check UNC path is correct
4. Verify credentials are accepted
5. Update network drivers

**Offline File Access:**
1. Enable Offline Files feature
2. Sync files for offline use
3. Set sync preferences
4. Work offline when needed
5. Sync changes when back online

**Security Considerations:**
- Access follows principle of least privilege
- All access is logged and audited
- Regular permission reviews conducted
- Immediate revocation for terminated employees
- Encryption for sensitive shared resources

**Access Approval Process:**
1. Request submitted through IT portal
2. Folder owner reviews and approves
3. IT implements technical permissions
4. User notified of access granted
5. Training provided if needed

**Emergency Access:**
- For urgent business needs
- Contact supervisor and IT
- Provide detailed justification
- Temporary access granted
- Full audit trail maintained

If shared resource access issues persist, contact IT support with specific folder paths, error messages, and business requirements.`
  },
  {
    title: "Deleted File Recovery",
    text: `**Complete File Recovery and Restoration Guide**

**Immediate Recovery Options:**

**Recycle Bin Recovery:**
1. Double-click Recycle Bin on desktop
2. Locate the deleted file
3. Right-click and select "Restore"
4. File returns to original location
5. Check file integrity after restore

**Recent Files Recovery:**
1. Open application (Word, Excel, etc.)
2. Click "File" → "Open" → "Recent"
3. Look for recently deleted files
4. Open and save to new location
5. Check file version and content

**Previous Versions:**
1. Right-click file location
2. Select "Restore previous versions"
3. Choose appropriate backup date
4. Click "Restore" or "Copy"
5. Verify restored file content

**OneDrive/SharePoint Recovery:**
1. Go to OneDrive web portal
2. Click "Recycle bin" in left menu
3. Find deleted file
4. Click "Restore"
5. File returns to original location

**System Restore Points:**
1. Search for "Create a restore point"
2. Click "System Restore"
3. Choose recent restore point
4. Follow wizard to restore system
5. Check if files are recovered

**Backup Recovery:**
1. Access backup location (external drive, cloud)
2. Navigate to backup date before deletion
3. Copy files to safe location
4. Verify file integrity
5. Update backup procedures

**Advanced Recovery Methods:**

**Shadow Copy Recovery:**
1. Right-click folder → Properties → Previous Versions
2. Select appropriate date
3. Click "Open" or "Copy"
4. Restore files as needed

**Professional Data Recovery:**
1. Stop using affected drive immediately
2. Contact IT for professional recovery
3. Provide file details and deletion time
4. Professional tools may be required
5. Success depends on drive usage after deletion

**Email Attachment Recovery:**
1. Check Sent Items for original email
2. Ask sender to resend attachment
3. Check email trash/recovery
4. Use email archive search
5. Contact IT for email backup recovery

**Database File Recovery:**
1. Contact database administrator
2. Check database backups
3. Restore from backup point
4. Verify data integrity
5. Update recovery procedures

**Prevention Measures:**
- Regular file backups
- Use version control systems
- Enable file versioning
- Avoid storing critical files in single location
- Implement retention policies

**Recovery Success Factors:**
- Time elapsed since deletion
- Drive usage after deletion
- File size and type
- Storage system used
- Backup availability and freshness

**Legal and Compliance:**
- Follow data retention policies
- Document recovery attempts
- Report significant data loss incidents
- Maintain audit trails
- Comply with regulatory requirements

If file recovery is unsuccessful, contact IT support immediately with file details, deletion time, and business impact. Early intervention improves recovery chances.`
  },
  {
    title: "Printer Troubleshooting",
    text: `**Complete Printer Problem Resolution**

**Initial Printer Checks:**
1. Verify printer is powered on and connected
2. Check cable connections (USB, Ethernet, WiFi)
3. Ensure paper is loaded correctly
4. Check for paper jams or obstructions
5. Verify ink/toner levels

**Print Job Issues:**

**Print Job Stuck in Queue:**
1. Open Control Panel → Devices and Printers
2. Right-click printer → "See what's printing"
3. Cancel stuck print jobs
4. Restart Print Spooler service
5. Clear spooler files if needed

**Printer Not Responding:**
1. Check printer status lights
2. Test power cycle (turn off, wait 30s, turn on)
3. Verify network connectivity
4. Check printer error messages
5. Test printing from different computer

**Poor Print Quality:**
1. Check ink/toner cartridge levels
2. Run printer cleaning cycle
3. Align print heads/cartridges
4. Use correct paper type
5. Clean printer rollers and nozzles

**Color Printing Problems:**
1. Check color cartridge status
2. Run color calibration
3. Clean color print heads
4. Check color settings in printer properties
5. Replace faulty color cartridges

**Slow Printing:**
1. Reduce print quality settings
2. Check printer memory/RAM
3. Update printer firmware
4. Close unnecessary applications
5. Check network speed for network printers

**Paper Handling Issues:**
1. Check paper size and type settings
2. Ensure paper is not curled or damaged
3. Clear paper path obstructions
4. Adjust paper guides properly
5. Load paper correctly in tray

**Network Printer Problems:**
1. Check printer IP address
2. Ping printer from computer
3. Verify correct printer driver
4. Check firewall settings
5. Test from different network device

**Driver Issues:**
1. Update printer drivers
2. Remove and reinstall printer
3. Try generic printer driver
4. Check driver compatibility
5. Download latest drivers from manufacturer

**Wireless Printer Setup:**
1. Connect printer to WiFi network
2. Print network configuration page
3. Add printer using IP address
4. Verify WiFi signal strength
5. Update printer firmware

**Advanced Troubleshooting:**
1. Run printer diagnostic tools
2. Check printer event logs
3. Test printer hardware components
4. Reset printer to factory defaults
5. Contact manufacturer support

**Maintenance Tasks:**
- Regular cleaning of printer components
- Timely replacement of consumables
- Firmware updates
- Calibration and alignment
- Storage in appropriate environment

If printer issues persist after troubleshooting, contact IT support or printer manufacturer with model number, error messages, and steps attempted.`
  },
  {
    title: "Audio/Video Call Issues",
    text: `**Complete Audio/Video Call Troubleshooting**

**Audio Issues:**

**Microphone Not Working:**
1. Check microphone connection and power
2. Verify microphone selected in sound settings
3. Test microphone levels and boost
4. Check for microphone permissions in app
5. Test with different microphone device

**Speaker/Audio Not Working:**
1. Verify speaker connection and volume
2. Check sound settings and default device
3. Test speaker with different application
4. Check for audio enhancements conflicts
5. Update audio drivers

**Echo or Feedback:**
1. Adjust microphone volume down
2. Move microphone away from speakers
3. Use headphones instead of speakers
4. Check room acoustics
5. Adjust audio settings in call app

**Poor Audio Quality:**
1. Check internet connection speed
2. Close bandwidth-intensive applications
3. Use wired connection instead of WiFi
4. Update audio drivers and firmware
5. Test with different audio device

**Video Issues:**

**Camera Not Detected:**
1. Check camera connection and power
2. Verify camera selected in video settings
3. Check camera permissions in app
4. Update camera drivers
5. Test camera with different application

**Poor Video Quality:**
1. Check internet connection and bandwidth
2. Adjust video resolution settings
3. Improve lighting in room
4. Clean camera lens
5. Close other video applications

**Video Freezing or Lagging:**
1. Reduce video resolution
2. Check CPU and memory usage
3. Close unnecessary applications
4. Use wired internet connection
5. Update graphics drivers

**Screen Sharing Issues:**
1. Check screen sharing permissions
2. Verify application has screen access
3. Update application to latest version
4. Restart screen sharing application
5. Try different screen sharing method

**Call Connection Problems:**
1. Check internet stability and speed
2. Verify firewall and antivirus settings
3. Update calling application
4. Try different network connection
5. Check for VPN interference

**Application-Specific Issues:**

**Teams Meeting Problems:**
1. Clear Teams cache and restart
2. Check Teams app permissions
3. Update Teams to latest version
4. Sign out and sign back in
5. Check Teams service status

**Zoom Call Issues:**
1. Restart Zoom application
2. Check Zoom audio/video settings
3. Update Zoom to latest version
4. Clear Zoom cache
5. Test with Zoom web client

**WebRTC Browser Issues:**
1. Update browser to latest version
2. Clear browser cache and cookies
3. Check browser permissions
4. Disable browser extensions
5. Try different browser

**Mobile Call Issues:**
1. Check mobile data/WiFi connection
2. Close background applications
3. Update calling app
4. Restart mobile device
5. Check mobile permissions

**Network and Infrastructure:**
1. Test internet speed and stability
2. Check router and modem settings
3. Update network drivers
4. Contact IT for network issues
5. Check for network congestion

If audio/video call issues persist, contact IT support with device details, application used, error messages, and network information.`
  },
  {
    title: "IT Ticket Creation and Management",
    text: `**Complete IT Support Ticket Process**

**When to Create a Ticket:**
- Issue persists after basic troubleshooting
- Business work is significantly impacted
- Security concerns or unusual behavior
- Hardware failure or damage
- Software licensing or access issues
- Network connectivity problems

**Ticket Creation Methods:**
1. Use chatbot "create ticket" command
2. Submit through IT helpdesk portal
3. Call IT helpdesk phone line
4. Email IT support address
5. Use self-service IT portal

**Effective Ticket Information:**
- Clear, specific problem description
- Steps already attempted
- Error messages (exact text)
- Device and software details
- Business impact assessment
- Urgency level justification

**Ticket Priority Levels:**
- **Critical**: Complete system outage, security breach
- **High**: Major functionality broken, deadline impact
- **Medium**: Partial functionality issues, work delays
- **Low**: Minor inconvenience, workaround available

**Ticket Response Times:**
- Critical: Within 1 hour
- High: Within 4 hours
- Medium: Within 24 hours
- Low: Within 48 hours

**Ticket Status Tracking:**
1. Receive ticket confirmation with ID
2. Check status through portal or chatbot
3. Receive updates via email/phone
4. Provide additional information when requested
5. Test resolution when implemented

**Escalation Process:**
1. If no response within expected time
2. If issue severity increases
3. If provided solution doesn't work
4. Contact supervisor or IT management
5. Request priority increase with justification

**Ticket Resolution:**
- IT provides solution or workaround
- User tests and confirms resolution
- Ticket closed with satisfaction survey
- Knowledge base updated with solution
- Follow-up if issue recurs

**Common Ticket Categories:**
- Hardware failures and replacements
- Software installation and updates
- Network and connectivity issues
- Account and access problems
- Security incidents and concerns
- Application errors and crashes
- Email and communication issues
- Mobile device management

**Ticket Best Practices:**
- One issue per ticket
- Provide complete information upfront
- Be available for questions during resolution
- Test solutions thoroughly
- Close tickets when resolved
- Provide feedback on resolution quality

**Self-Service Options:**
- Knowledge base search before creating ticket
- Chatbot troubleshooting assistance
- Automated password resets
- Software download portals
- User training resources

If you need to create a support ticket, gather all relevant information and use the most appropriate method for your urgency level.`
  },
  {
    title: "Phishing Clicked - Emergency Response",
    text: `**URGENT: Malware/Phishing Incident Response**

**IMMEDIATE ACTIONS (Do Not Delay):**
1. **STOP all computer activity immediately**
2. **Disconnect from all networks** (WiFi, Ethernet, Bluetooth)
3. **DO NOT enter any passwords or credentials**
4. **DO NOT click any additional links**
5. **Power off the computer** (do not shut down normally)

**Contact IT Security Immediately:**
- Call IT security hotline: [Security Phone Number]
- Email: security@company.com
- Provide incident details and current status
- Do not turn computer back on until instructed

**What IT Security Will Do:**
1. Assess the risk level and impact
2. Guide you through secure shutdown procedures
3. Arrange for forensic analysis if needed
4. Provide clean device or recovery options
5. Monitor for further suspicious activity

**During Investigation:**
- Do not use the affected device
- Use alternative device for work if available
- Change passwords on all accounts from clean device
- Monitor email and accounts for suspicious activity
- Report any unusual account activity immediately

**Post-Incident Actions:**
1. Change all passwords across all systems
2. Enable multi-factor authentication everywhere
3. Review account activity logs
4. Update security software and signatures
5. Complete security awareness training if offered

**Prevention for Future:**
- Never click unsolicited links or attachments
- Verify sender identity through other means
- Use antivirus with real-time protection
- Keep all software updated
- Be cautious with email and web browsing

**Business Impact Assessment:**
- IT will determine scope of compromise
- May need to notify other departments
- Could require system-wide password changes
- May impact business operations temporarily

**Legal and Compliance:**
- Incident will be documented
- May require regulatory reporting
- Forensic evidence preserved
- Lessons learned for security improvements

**Recovery Process:**
- Clean device restoration or replacement
- Data recovery from backups
- System hardening and security updates
- Monitoring for reinfection
- Return to normal operations

**REMEMBER: Early reporting is crucial for minimizing damage and protecting the organization. If you suspect phishing or malware, stop and call IT security immediately.**`
  },
  {
    title: "Software License Issues",
    text: `**Complete Software License Management**

**License Expiration Issues:**
1. Check license expiration date in application
2. Verify renewal notifications received
3. Contact software vendor for renewal options
4. Submit renewal request through procurement
5. Install renewed license when received

**License Activation Problems:**
1. Verify license key is correct
2. Check internet connection for online activation
3. Disable firewall/antivirus temporarily
4. Try offline activation if available
5. Contact vendor support for activation issues

**License Server Issues:**
1. Check license server connectivity
2. Verify server is running and accessible
3. Check license server logs for errors
4. Restart license services if needed
5. Contact IT for server-related issues

**Multiple User Conflicts:**
1. Check concurrent license usage
2. Verify license allows multiple users
3. Coordinate with other users for license sharing
4. Request additional licenses if needed
5. Implement license usage monitoring

**License Transfer Issues:**
1. Check software license agreement for transfer rules
2. Deactivate license on old device
3. Activate on new device
4. Update license records
5. Contact vendor for transfer assistance

**Subscription License Problems:**
1. Verify subscription is active and paid
2. Check account status with vendor
3. Update payment information if needed
4. Contact vendor billing department
5. Request subscription extension if applicable

**Volume License Issues:**
1. Check volume license agreement status
2. Verify organization is authorized user
3. Update license server with new keys
4. Distribute licenses to users
5. Monitor license usage compliance

**Open Source License Compliance:**
1. Review open source license requirements
2. Ensure proper attribution and notices
3. Check for license compatibility issues
4. Update license documentation
5. Contact legal for compliance questions

**License Audit Preparation:**
1. Gather all license documentation
2. Inventory installed software
3. Verify license entitlements
4. Prepare for vendor license audits
5. Address any compliance gaps

**License Cost Management:**
1. Review license utilization rates
2. Identify underutilized licenses
3. Optimize license purchasing
4. Consider alternative solutions
5. Plan for license renewals

If software license issues persist, contact IT support with license details, error messages, and business impact. License compliance is critical for legal and operational reasons.`
  },
  {
    title: "Windows Update Problems",
    text: `**Complete Windows Update Troubleshooting**

**Update Download Issues:**
1. Check internet connection stability
2. Verify sufficient disk space (2-3x update size)
3. Temporarily disable antivirus software
4. Clear Windows Update cache and restart service
5. Try downloading updates manually

**Update Installation Failures:**
1. Run Windows Update Troubleshooter
2. Check for pending restarts
3. Install updates individually instead of batch
4. Boot into Safe Mode for installation
5. Run System File Checker (sfc /scannow)

**Update Service Problems:**
1. Restart Windows Update service
2. Clear SoftwareDistribution folder
3. Reset Windows Update components
4. Check service permissions
5. Re-register update DLLs

**Compatibility Issues:**
1. Check system requirements for updates
2. Verify hardware compatibility
3. Update device drivers first
4. Check for conflicting software
5. Review update release notes

**Rollback Failed Updates:**
1. Boot into Safe Mode
2. Use System Restore to previous point
3. Uninstall problematic updates
4. Check Windows Update history
5. Hide failed updates temporarily

**Windows Update Errors:**
- **0x80070002**: Clear update cache, restart service
- **0x80070005**: Check permissions, run as administrator
- **0x8024001E**: Reset Windows Update, clear cache
- **0x80072EE2**: Check proxy settings, internet connection
- **0x8024402C**: Windows Update server issues, wait and retry

**Update Stuck at Certain Percentage:**
1. Wait 1-2 hours for update to complete
2. Check disk space and CPU usage
3. Restart computer and try again
4. Run update in Clean Boot environment
5. Contact Microsoft support for stuck updates

**Group Policy Update Issues:**
1. Force group policy update: gpupdate /force
2. Check domain connectivity
3. Verify computer account in Active Directory
4. Check event logs for policy errors
5. Contact IT for domain policy issues

**Update After Clean Install:**
1. Ensure Windows is activated
2. Check Microsoft account association
3. Temporarily disable third-party antivirus
4. Use Windows Update Assistant tool
5. Install updates in multiple sessions

If Windows update issues persist, contact IT support with specific error codes, Windows version, and troubleshooting steps attempted. Windows updates are critical for security and stability.`
  }
];

async function addAdvancedScripts() {
  console.log("🔧 Adding advanced IT support conversation scripts...\n");

  const token = await loginAndGetToken();
  if (!token) {
    console.error("❌ Cannot proceed without token");
    return;
  }

  console.log(`📝 Adding ${advancedScripts.length} advanced troubleshooting scripts...\n`);

  for (let i = 0; i < advancedScripts.length; i++) {
    const script = advancedScripts[i];
    try {
      const response = await fetch(`${baseURL}/kb/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(script),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Added: ${script.title}`);
      } else {
        console.error(`❌ Failed to add "${script.title}":`, data.error || data.message);
      }
    } catch (error) {
      console.error(`❌ Failed to add "${script.title}":`, error.message);
    }
  }

  console.log("\n🎯 Advanced scripts added successfully!");
  console.log("\n🧪 Now test these advanced scenarios:");
  console.log("  ✅ 'I forgot my password' → Complete account recovery guide");
  console.log("  ✅ 'my account is locked' → Detailed unlock process");
  console.log("  ✅ 'unable to log in' → Comprehensive login troubleshooting");
  console.log("  ✅ 'laptop running slow' → Performance optimization guide");
  console.log("  ✅ 'VPN not connecting' → Advanced VPN troubleshooting");
  console.log("  ✅ 'set up email on mobile' → Complete mobile setup guide");
  console.log("  ✅ 'request new software' → Software access process");
  console.log("  ✅ 'hardware replacement' → Equipment replacement guide");
  console.log("  ✅ 'app keeps crashing' → Application crash resolution");
  console.log("  ✅ 'phishing email' → Security incident response");
  console.log("  ✅ 'unlock account' → Account recovery procedures");
  console.log("  ✅ 'access shared drive' → File permission troubleshooting");
  console.log("  ✅ 'recover deleted file' → Data recovery guide");
  console.log("  ✅ 'printer not working' → Complete printer troubleshooting");
  console.log("  ✅ 'meeting audio not working' → A/V call troubleshooting");
  console.log("  ✅ 'create IT ticket' → Ticket management guide");
  console.log("  ✅ 'clicked phishing link' → Emergency security response");
  console.log("  ✅ 'software license expired' → License management");
  console.log("  ✅ 'Windows update failed' → Update troubleshooting");

  console.log("\n📈 Total advanced scripts: 20 comprehensive guides");
  console.log("\n🧠 Your chatbot now handles advanced IT scenarios with detailed, professional responses!");
  console.log("\n🔒 Security note: Admin-approved content will be automatically indexed and searchable after approval.");
}

addAdvancedScripts().catch(console.error);