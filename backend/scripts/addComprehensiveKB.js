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

// Comprehensive IT Support Knowledge Base
const comprehensiveKB = [
  {
    title: "Password Reset - Onboarding Portal",
    text: "How do I reset my onboarding portal password? Go to the onboarding portal login page. Click 'Forgot Password'. Enter the email/employee ID you used during onboarding. Check your inbox for a reset link. Click the link and set a new password. Try logging in again. If you don't receive the email, check spam. Still no? Contact HR or IT support."
  },
  {
    title: "Lost Belongings - Contact Information",
    text: "Who do I contact for lost belongings? Reach out to the Facilities/Administration Team. Share what you lost (item name, color, last location seen). They will check the Lost & Found section. If found, visit the admin desk to collect it."
  },
  {
    title: "Visitor Access Request Process",
    text: "How do I get visitor access? Inform your manager first. Go to the visitor request portal or email the Admin/Facilities team. Provide details: Visitor name, Purpose of visit, Date & time, Your employee ID. Wait for approval. The visitor must carry a government ID to enter."
  },
  {
    title: "Email Signature Setup",
    text: "How do I request email signature setup? Contact the IT support team. Share your details: Full name, Job title, Department, Phone number (if required). They will update your account or provide a template you can paste in settings."
  },
  {
    title: "Distribution Lists Creation",
    text: "How do I create distribution lists? Contact IT or System Administrator. Provide the group name and emails of members. IT will create the list and give you permission to use it. You can then mail the whole group using the new list."
  },
  {
    title: "Access Archived Emails",
    text: "How do I access archived emails? Open Outlook/Gmail. Go to Folders > Archive section. Search for the email using keywords, dates, or sender name. If you don't see the archive: Contact IT to enable it, Or request access if restricted."
  },
  {
    title: "Password Reset - General",
    text: "How do I reset my password? Go to your login screen. Click 'Forgot Password'. Enter your work email/username. Check your email/SMS for the reset code or link. Set a new strong password. Log in again. If your account is locked, contact IT to unlock it."
  },
  {
    title: "Laptop Performance Issues",
    text: "My laptop is running slow — what do I do? Try these steps: Restart your laptop. Close unused apps and browser tabs. Check storage — keep at least 10–20% free. Update your system (Windows/OS). Run antivirus scan. If still slow, log an IT ticket."
  },
  {
    title: "Software Access Request",
    text: "How do I request new software access? Go to the IT service portal. Select Request Software. Choose the software name. Explain why you need it. Submit the request. Your manager and IT will approve it."
  },
  {
    title: "Hardware Replacement Request",
    text: "How do I request hardware replacement? Raise an IT ticket. Mention the issue (keyboard broken, screen cracked, etc.). IT will check warranty or replacement eligibility. Visit the IT desk or schedule pickup."
  },
  {
    title: "VPN Connection Setup",
    text: "How do I connect to the office VPN? Install the company VPN app (IT will provide link). Open the app. Enter your work username & password. Click Connect. Wait until the icon shows 'Connected'. If connection fails, restart your system or contact IT."
  },
  {
    title: "Login Issues Troubleshooting",
    text: "I'm unable to log in — help. Do this: Check internet connection. Make sure your username/password is correct. Reset your password if needed. If account is locked, IT must unlock it. Try a different browser/device if needed."
  },
  {
    title: "Mobile Email Setup",
    text: "How do I set up email on my mobile? Go to your phone's Mail app. Choose Add Account. Select Microsoft/Google/Exchange depending on company type. Enter work email + password. Accept security permissions. Email sync will start."
  },
  {
    title: "System Update Process",
    text: "How do I update my system? Go to Settings > Update & Security. Click Check for updates. Install all available updates. Restart your system."
  },
  {
    title: "Office App Troubleshooting",
    text: "My office app is not working — what should I do? Restart the app. Clear cache (if mobile). Restart your device. Update the app. If still not working, raise IT ticket."
  },
  {
    title: "Account Security Best Practices",
    text: "How do I secure my account? Use strong passwords. Enable 2-factor authentication. Don't share passwords. Log out from public/shared computers. Report suspicious emails immediately."
  },
  {
    title: "Phishing Email Reporting",
    text: "How do I report a phishing email? Don't click anything. Forward the email to IT Security Team. Mark it as spam/phishing. Delete it from your inbox."
  },
  {
    title: "Account Unlock Process",
    text: "How do I unlock my account? Contact IT Helpdesk. Provide your employee ID. They will verify you and unlock the account. Reset your password if required."
  },
  {
    title: "Shared Drives Access Request",
    text: "How do I request access to shared drives? Raise an IT access request. Provide folder name + reason. Your manager approves. IT grants access."
  },
  {
    title: "IT Ticket Creation Process",
    text: "How do I raise an IT ticket? Open the IT Helpdesk Portal. Click Create Ticket. Choose category (software, hardware, login, etc.). Write the issue clearly. Submit. Track ticket status on the portal."
  },
  {
    title: "Company Working Hours",
    text: "What are the company working hours? Working hours vary, but usually: 9 hours per day including break, Core hours: 9 AM – 6 PM. Check company policy or ask HR for exact timings."
  },
  {
    title: "Annual Leave Allocation",
    text: "How many leaves do I get per year? Most companies provide: Casual Leave (CL), Sick Leave (SL), Earned Leave (EL), Optional holidays. Check your company's leave policy or HR portal for the exact number."
  },
  {
    title: "Leave Application Process",
    text: "How do I apply for leave? Go to the Leave/HR portal. Click Apply Leave. Choose leave type. Select start & end date. Add reason. Submit. Wait for manager approval."
  },
  {
    title: "Leave Approval Workflow",
    text: "What is the leave approval process? Employee applies for leave. Manager reviews it. Manager approves or rejects. Employee gets notification."
  },
  {
    title: "Check Leave Balance",
    text: "How do I check my leave balance? Login to HR portal. Go to Leave section. Check details under Leave Balance."
  },
  {
    title: "Company Dress Code Policy",
    text: "What is the dress code? Normal corporate wear or smart casuals. No shorts, sleeveless, flip-flops (depending on company). Check HR policy for full rules."
  },
  {
    title: "Company Holiday Calendar",
    text: "What is the company holiday list? Go to HR portal. Open Holiday Calendar. Download or view yearly list."
  },
  {
    title: "Update Personal Information",
    text: "How do I update my personal information? Open HR portal. Go to My Profile. Edit phone, address, emergency contact, etc. Save changes. Some changes may need HR approval."
  },
  {
    title: "ID Card Replacement",
    text: "How do I apply for ID card replacement? Inform HR or Admin. Fill ID Card Replacement form. Pay replacement fee (if required). Collect new card when ready."
  },
  {
    title: "Access Company Policies",
    text: "Where can I find company policies? Go to HR Portal. Open Policies or Documents section. Download any policy like leave, IT, security, code of conduct."
  },
  {
    title: "HR Issue Escalation",
    text: "How do I escalate issues with HR? Email HR representative. If unresolved, contact HR Manager. Use grievance redressal system if available."
  },
  {
    title: "Onboarding Required Documents",
    text: "What documents do I need for onboarding? Usually required: ID proof (Aadhaar, Passport), Education certificates, Previous company relieving letter, Pay slips, Bank details, Photos. HR will provide exact list."
  },
  {
    title: "Probation Period Information",
    text: "What is the probation period? Typically 3 to 6 months. During probation, performance is reviewed before confirmation."
  },
  {
    title: "Notice Period Details",
    text: "How do I check my notice period? Check: Your offer letter, HR portal → Employment details, Ask HR if unsure."
  },
  {
    title: "Internal Job Transfer Process",
    text: "How do I apply for internal job transfer? Check openings in internal career portal. Apply with manager approval. HR reviews eligibility. Attend interview. Get approval and move."
  },
  {
    title: "Performance Appraisal Cycle",
    text: "What is the appraisal cycle? Usually once per year. Includes goal setting, mid-year review, and annual review. Salary increments depend on performance."
  },
  {
    title: "Performance Review Frequency",
    text: "How often are performance reviews? Mid-year review, Annual review, Sometimes quarterly check-ins."
  },
  {
    title: "Workplace Grievance Reporting",
    text: "How do I raise a workplace grievance? Contact HR or use grievance portal. Submit your issue. HR investigates. You receive a follow-up resolution."
  },
  {
    title: "HR Contact Information",
    text: "How do I contact HR? Email, HR portal → Contact section, HR helpdesk number, Visit HR office directly."
  }
];

async function addComprehensiveKB() {
  console.log("📚 Adding comprehensive IT support knowledge base...\n");

  const token = await loginAndGetToken();
  if (!token) {
    console.error("❌ Cannot proceed without token");
    return;
  }

  console.log(`📝 Adding ${comprehensiveKB.length} comprehensive Q&A pairs...\n`);

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

  console.log("\n✨ Comprehensive knowledge base addition complete!");
  console.log("\n🧪 Test with queries like:");
  console.log("  - \"How do I reset my password?\"");
  console.log("  - \"Who do I contact for lost items?\"");
  console.log("  - \"How do I apply for leave?\"");
  console.log("  - \"My laptop is slow\"");
  console.log("  - \"How do I create a distribution list?\"");
  console.log("\n🤖 The LLM will now provide intelligent, natural responses to these questions!");
}

addComprehensiveKB().catch(console.error);