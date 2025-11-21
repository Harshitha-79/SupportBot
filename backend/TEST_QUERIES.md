# How to Test Your Chatbot

## Step 1: Add Content to Knowledge Base

Use Postman, curl, or your frontend to POST to `http://localhost:5000/api/kb/text`

### Example 1: Password Reset
```json
POST http://localhost:5000/api/kb/text
Content-Type: application/json

{
  "title": "Password Reset Procedures",
  "text": "If you need to reset your password, please visit the employee portal at portal.company.com. Click on \"Forgot Password\" link and enter your email address. You will receive a password reset link within 5 minutes. If you don't receive the email, check your spam folder. The password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters. Passwords expire every 90 days for security purposes."
}
```

### Example 2: VPN Issues
```json
{
  "title": "VPN Troubleshooting Guide",
  "text": "When connecting to VPN fails, first check your internet connection. Make sure you're using the correct VPN server address: vpn.company.com. Try disconnecting and reconnecting. If the issue persists, clear your browser cache or restart the VPN client application. For Windows users, ensure the VPN service is running in Services. For Mac users, check System Preferences for VPN status. If you receive an authentication error, verify your username and password are correct. Contact IT support if problems continue after these steps."
}
```

### Example 3: Email Setup
```json
{
  "title": "Outlook Email Configuration",
  "text": "To set up Outlook email on your computer, open Outlook and select File > Add Account. Enter your full email address and password. For incoming mail server, use mail.company.com with port 993 for IMAP or 995 for POP3. For outgoing mail server, use smtp.company.com with port 587. Enable SSL/TLS encryption for both servers. Make sure \"Remember password\" is checked. If you encounter sync issues, go to Account Settings > Change and test the account settings. Outlook typically syncs every 30 minutes automatically."
}
```

### Example 4: Printer Problems
```json
{
  "title": "Common Printer Problems and Solutions",
  "text": "If your printer is not responding, first check that it's turned on and connected to the network or computer. Verify the printer has paper and ink or toner. Try printing a test page from the printer's control panel. If printing fails, check if the printer appears in your computer's printer list. For network printers, ensure you're connected to the same Wi-Fi network. Clear any print queue errors in the printer settings. Restart the print spooler service if needed. For wireless printers, try reconnecting to the network. If the printer shows offline status, set it as default and check printer properties."
}
```

### Example 5: Laptop Performance
```json
{
  "title": "Improving Laptop Performance",
  "text": "If your laptop is running slowly, first restart it to clear temporary files. Check available disk space - ensure at least 10% of your hard drive is free. Close unnecessary applications and browser tabs. Run disk cleanup utility to remove temporary files. Check Task Manager for programs using high CPU or memory. Uninstall unused applications. Update your operating system and drivers. Disable startup programs that you don't need. Increase virtual memory if you have low RAM. Consider adding more RAM if problems persist. For persistent slowness, contact IT support for a hardware check or reimage."
}
```

## Step 2: Test Queries

After adding the content, test with these queries:

### Test Query 1: Password Reset
```json
POST http://localhost:5000/api/chat/ask
Content-Type: application/json

{
  "query": "How do I reset my password?"
}
```

**Expected:** Should return information about password reset procedures

### Test Query 2: VPN Issues
```json
{
  "query": "I can't connect to VPN, what should I do?"
}
```

**Expected:** Should return VPN troubleshooting steps

### Test Query 3: Email Problems
```json
{
  "query": "How do I set up my email in Outlook?"
}
```

**Expected:** Should return Outlook configuration instructions

### Test Query 4: Printer Issues
```json
{
  "query": "My printer is not working"
}
```

**Expected:** Should return printer troubleshooting steps

### Test Query 5: Performance Issues
```json
{
  "query": "My laptop is running very slow, how can I fix it?"
}
```

**Expected:** Should return laptop performance improvement tips

### Test Query 6: Network Issues
```json
{
  "query": "I cannot connect to the internet"
}
```

**Expected:** Should return network troubleshooting information

## Using cURL Commands

### Add Content:
```bash
curl -X POST http://localhost:5000/api/kb/text \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Password Reset Procedures",
    "text": "If you need to reset your password, please visit the employee portal at portal.company.com..."
  }'
```

### Test Query:
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I reset my password?"
  }'
```

## What to Expect

Successful responses should include:
- `reply`: The relevant answer from the knowledge base
- `confidence`: A percentage showing match confidence

If no match is found, you'll get:
- `reply`: "I couldn't find anything in the knowledge base. Would you like me to raise a ticket?"

