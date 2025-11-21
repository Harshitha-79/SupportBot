# How to Use the Sample Knowledge Base Files

## Option 1: Run the Automated Script (Easiest)

I've created a script that will automatically add all the sample content for you:

```bash
# Make sure your server is running first!
npm run dev

# In a new terminal, run:
npm run add-kb
```

This will add 6 sample knowledge base entries automatically.

## Option 2: Manual Method Using Postman/cURL

### Step 1: Start Your Server
```bash
npm run dev
```

### Step 2: Add Content Using Postman

1. Open Postman
2. Create a new POST request
3. URL: `http://localhost:5000/api/kb/text`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON): Copy one of these examples:

**Example 1 - Password Reset:**
```json
{
  "title": "Password Reset Procedures",
  "text": "If you need to reset your password, please visit the employee portal at portal.company.com. Click on \"Forgot Password\" link and enter your email address. You will receive a password reset link within 5 minutes. If you don't receive the email, check your spam folder. The password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters. Passwords expire every 90 days for security purposes."
}
```

**Example 2 - VPN Issues:**
```json
{
  "title": "VPN Troubleshooting Guide",
  "text": "When connecting to VPN fails, first check your internet connection. Make sure you're using the correct VPN server address: vpn.company.com. Try disconnecting and reconnecting. If the issue persists, clear your browser cache or restart the VPN client application. For Windows users, ensure the VPN service is running in Services. For Mac users, check System Preferences for VPN status. If you receive an authentication error, verify your username and password are correct. Contact IT support if problems continue after these steps."
}
```

### Step 3: Test the Chatbot

Create another POST request:
- URL: `http://localhost:5000/api/chat/ask`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "query": "How do I reset my password?"
}
```

## Option 3: Using cURL (Command Line)

### Add Content:
```bash
curl -X POST http://localhost:5000/api/kb/text \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Password Reset Procedures",
    "text": "If you need to reset your password, please visit the employee portal at portal.company.com. Click on \"Forgot Password\" link and enter your email address. You will receive a password reset link within 5 minutes."
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

## Test Queries to Try:

After adding content, try these queries:

1. `"How do I reset my password?"`
2. `"I can't connect to VPN"`
3. `"How do I set up Outlook email?"`
4. `"My printer is not working"`
5. `"My laptop is running very slow"`
6. `"I cannot connect to the internet"`

## What the Files Are:

- **`SAMPLE_KB_CONTENT.md`** - Reference file with all the sample content (copy/paste from here)
- **`TEST_QUERIES.md`** - Reference file with example API calls and queries
- **`scripts/addSampleKB.js`** - Automated script to add all content at once
- **`HOW_TO_USE.md`** - This file! (instructions)

## Recommended: Use Option 1

The easiest way is to just run:
```bash
npm run add-kb
```

This will add all the sample content automatically!

