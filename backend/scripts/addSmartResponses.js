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

// 20 Low-Priority Questions (Direct Answers - No Ticket Creation)
const lowPriorityQA = [
  {
    title: "What is my employee ID?",
    text: "Your employee ID is usually your email prefix or a unique number assigned during onboarding. Check your offer letter, employee badge, or HR portal under 'My Profile'. If you can't find it, ask your manager or HR."
  },
  {
    title: "How do I change my desktop wallpaper?",
    text: "Right-click on your desktop > Personalize > Background > Choose a picture from your files or Windows themes. For company laptops, avoid using personal images that may violate policy."
  },
  {
    title: "What browsers are supported?",
    text: "Supported browsers: Google Chrome, Microsoft Edge, and Firefox. Internet Explorer is not supported. Keep your browser updated for security and compatibility."
  },
  {
    title: "How do I empty recycle bin?",
    text: "Right-click the Recycle Bin icon on your desktop > Empty Recycle Bin. This permanently deletes files, so check contents first if needed."
  },
  {
    title: "What is the company intranet URL?",
    text: "The company intranet is typically accessible at intranet.company.com or portal.company.com. Check your email for the exact URL or ask your manager."
  },
  {
    title: "How do I take a screenshot?",
    text: "Windows: Press Windows key + Shift + S to open snipping tool, or Windows key + Print Screen. Mac: Command + Shift + 4. Screenshots save to Pictures > Screenshots folder."
  },
  {
    title: "What is the IT helpdesk phone number?",
    text: "IT Helpdesk: Extension 1234 or main line (555) 123-4567. Available Monday-Friday, 9 AM - 6 PM. For emergencies outside business hours, call the main security line."
  },
  {
    title: "How do I check my computer specs?",
    text: "Windows: Settings > System > About. Shows processor, RAM, and storage. Mac: Apple menu > About This Mac. This helps when requesting software compatibility."
  },
  {
    title: "What is the company WiFi password?",
    text: "Company WiFi networks: 'CorpNet' or 'CompanyGuest'. Passwords are posted near access points or check the employee handbook. For secure network, contact IT for credentials."
  },
  {
    title: "How do I create a new folder?",
    text: "Right-click in File Explorer > New > Folder. Name it appropriately. For network drives, ensure you have write permissions in that location."
  },
  {
    title: "What are the parking rules?",
    text: "Employee parking is in designated lots A, B, and C. Display parking permit on dashboard. Visitor parking is in Lot D. No parking in fire lanes or handicapped spaces."
  },
  {
    title: "How do I forward emails?",
    text: "Open email > Click Forward button > Add recipient email > Send. For Outlook, use Rules to automatically forward certain emails (consult IT first)."
  },
  {
    title: "What is the dress code?",
    text: "Business casual: slacks, button-ups, blouses, dresses. No jeans, shorts, or athletic wear. Closed-toe shoes required. Check department-specific guidelines."
  },
  {
    title: "How do I check my Outlook calendar?",
    text: "Open Outlook > Click Calendar icon on bottom left. View daily/weekly/monthly. Use 'New Meeting' to schedule. Sync with phone calendar if needed."
  },
  {
    title: "What is the company address?",
    text: "123 Business Street, Suite 100, Business City, ST 12345. Use this for deliveries, visitors, or GPS navigation. Main entrance faces Business Street."
  },
  {
    title: "How do I use the coffee machine?",
    text: "Single-serve pods in the break room. Insert pod, close lid, select brew size. Clean up after use. Report any machine issues to facilities."
  },
  {
    title: "What are the break room rules?",
    text: "Clean up after yourself, refrigerate personal food with name/date, microwave for 2 minutes max, respect quiet hours. Shared spaces are for everyone."
  },
  {
    title: "How do I access the printer?",
    text: "Network printers: Find in Devices > Printers. Install drivers if needed. For wireless printing, ensure you're on company network. Check printer queue if jobs don't print."
  },
  {
    title: "What is the emergency exit route?",
    text: "Emergency exits marked with green signs. Primary routes: Main stairwells and side doors. Assembly point: Parking lot A. Review evacuation map posted by elevators."
  },
  {
    title: "How do I set up email forwarding?",
    text: "Outlook: File > Options > Mail > Accounts > Account Settings > Change forwarding settings. Enter forwarding address. Save and restart Outlook. Use cautiously for compliance."
  }
];

// 10 Conversation Flow Examples (for context and follow-ups)
const conversationExamples = [
  {
    title: "Password Reset Conversation",
    text: "User: I forgot my password. Bot: Go to login screen > Forgot Password > Enter email > Check inbox. User: I didn't get the email. Bot: Check spam folder, wait 5 minutes, or contact IT directly. User: Thanks. Bot: You're welcome! Let me know if you need anything else."
  },
  {
    title: "WiFi Connection Flow",
    text: "User: WiFi not working. Bot: Check if connected to CorpNet, try forgetting/reconnecting network. User: Still not working. Bot: Restart computer, check other devices work. User: Fixed it. Bot: Great! Glad I could help."
  },
  {
    title: "Software Installation Query",
    text: "User: Need to install software. Bot: What software? User: Adobe Acrobat. Bot: Submit request via IT portal, manager approval needed. User: How long? Bot: Usually 2 business days. User: Ok thanks. Bot: You're welcome!"
  },
  {
    title: "Email Setup Help",
    text: "User: How to set up email on phone? Bot: Go to Settings > Accounts > Add Account > Exchange. User: What's the server? Bot: mail.company.com, port 993. User: Done! Bot: Perfect! Test by sending a test email."
  },
  {
    title: "File Access Issue",
    text: "User: Can't open shared file. Bot: Check if you have permissions, try from different computer. User: Still can't. Bot: Contact file owner or IT for access. User: Will do. Bot: Let me know the outcome."
  },
  {
    title: "Printer Problem",
    text: "User: Printer not working. Bot: Check power, paper, connections. Try printing test page. User: Still jammed. Bot: Clear jam carefully, check for torn paper. User: Fixed! Bot: Excellent! Happy printing."
  },
  {
    title: "VPN Setup",
    text: "User: How to connect VPN? Bot: Download company VPN app, enter credentials. User: Which app? Bot: Check IT portal downloads section. User: Connected! Bot: Great! You're all set for remote work."
  },
  {
    title: "Calendar Help",
    text: "User: How to schedule meeting? Bot: Open Outlook > New Meeting > Add attendees, time, location. User: How to add Teams link? Bot: Click 'Add Online Meeting' in ribbon. User: Perfect. Bot: Enjoy your meeting!"
  },
  {
    title: "Security Question",
    text: "User: Got suspicious email. Bot: Don't click! Forward to security@company.com, mark as spam. User: Should I delete it? Bot: Yes, after reporting. Good security awareness! User: Thanks. Bot: You're welcome. Stay safe online."
  },
  {
    title: "Leave Request",
    text: "User: How to apply for leave? Bot: Go to HR portal > Apply Leave > Select dates and type. User: Need approval? Bot: Yes, from manager. Usually same day. User: Thanks. Bot: Have a great time off!"
  }
];

async function addSmartResponses() {
  console.log("🧠 Adding smart responses for low-priority questions...\n");

  const token = await loginAndGetToken();
  if (!token) {
    console.error("❌ Cannot proceed without token");
    return;
  }

  console.log(`📝 Adding ${lowPriorityQA.length} low-priority Q&A pairs...\n`);

  // Add low-priority questions
  for (let i = 0; i < lowPriorityQA.length; i++) {
    const content = lowPriorityQA[i];
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
        console.log(`✅ Added low-priority: ${content.title}`);
      } else {
        console.error(`❌ Failed to add "${content.title}":`, data.error || data.message);
      }
    } catch (error) {
      console.error(`❌ Failed to add "${content.title}":`, error.message);
    }
  }

  console.log(`\n📝 Adding ${conversationExamples.length} conversation examples...\n`);

  // Add conversation examples
  for (let i = 0; i < conversationExamples.length; i++) {
    const content = conversationExamples[i];
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
        console.log(`✅ Added conversation: ${content.title}`);
      } else {
        console.error(`❌ Failed to add "${content.title}":`, data.error || data.message);
      }
    } catch (error) {
      console.error(`❌ Failed to add "${content.title}":`, error.message);
    }
  }

  console.log("\n🎉 Smart responses database complete!");
  console.log("\n🧪 Low-priority questions the bot can now answer directly:");
  console.log("  - What is my employee ID?");
  console.log("  - How do I change desktop wallpaper?");
  console.log("  - What browsers are supported?");
  console.log("  - How do I take a screenshot?");
  console.log("  - What is the IT helpdesk number?");
  console.log("  - What is the company WiFi password?");
  console.log("  - What are the parking rules?");
  console.log("  - What is the dress code?");
  console.log("  - What is the company address?");
  console.log("  - What are the break room rules?");
  console.log("  - And 10 more quick answers!");

  console.log("\n🤖 The bot will now:");
  console.log("  ✅ Answer 20+ low-priority questions directly");
  console.log("  ✅ Only create tickets for urgent/high-priority issues");
  console.log("  ✅ Handle natural conversations better");
  console.log("  ✅ Use LLM for more intelligent responses");
}

addSmartResponses().catch(console.error);