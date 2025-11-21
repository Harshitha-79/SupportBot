# How to Test the Chatbot with Auto Ticket Creation

## Prerequisites

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Add some knowledge base content** (so you can test both scenarios):
   ```bash
   npm run add-kb
   ```

3. **Get an authentication token** (you need to be logged in)

## Step 1: Login to Get Authentication Token

### Using Postman:
1. Create a POST request to `http://localhost:5000/api/auth/login`
2. Headers: `Content-Type: application/json`
3. Body:
   ```json
   {
     "email": "employee1@example.com",
     "password": "password123"
   }
   ```
4. Copy the `token` from the response

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employee1@example.com",
    "password": "password123"
  }'
```

**Save the token** - you'll need it for the next steps!

---

## Step 2: Test Chatbot with Query That HAS an Answer

This should return a knowledge base answer (no ticket created).

### Using Postman:
1. Create a POST request to `http://localhost:5000/api/chat/ask`
2. Headers:
   ```
   Content-Type: application/json
   Authorization: Bearer YOUR_TOKEN_HERE
   ```
3. Body:
   ```json
   {
     "query": "How do I reset my password?"
   }
   ```

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "How do I reset my password?"
  }'
```

**Expected Response:**
```json
{
  "reply": "If you need to reset your password, please visit the employee portal...",
  "confidence": "75%",
  "ticketCreated": false
}
```

---

## Step 3: Test Chatbot with Query That HAS NO Answer

This should automatically create a ticket.

### Using Postman:
1. Create a POST request to `http://localhost:5000/api/chat/ask`
2. Headers:
   ```
   Content-Type: application/json
   Authorization: Bearer YOUR_TOKEN_HERE
   ```
3. Body:
   ```json
   {
     "query": "My computer is making a weird buzzing noise and won't turn on"
   }
   ```

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "My computer is making a weird buzzing noise and won't turn on"
  }'
```

**Expected Response:**
```json
{
  "reply": "I couldn't find a solution in the knowledge base. I've automatically created a support ticket for you. Our IT team will get back to you soon.",
  "ticketCreated": true,
  "ticket": {
    "id": "507f1f77bcf86cd799439011",
    "title": "My computer is making a weird buzzing noise and won't turn on",
    "status": "open",
    "assignedTo": "IT Support Team"
  }
}
```

---

## Step 4: Verify the Ticket Was Created

Check that the ticket appears in your tickets list.

### Using Postman:
1. GET request to `http://localhost:5000/api/tickets/my`
2. Headers:
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

### Using cURL:
```bash
curl -X GET http://localhost:5000/api/tickets/my \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

You should see the newly created ticket in the list!

---

## Quick Test Script

Here's a complete test flow you can run:

```bash
# 1. Login and save token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee1@example.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

echo "Token: $TOKEN"

# 2. Test query with answer (should NOT create ticket)
echo "\n=== Testing query WITH answer ==="
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "How do I reset my password?"}'

# 3. Test query WITHOUT answer (should CREATE ticket)
echo "\n\n=== Testing query WITHOUT answer ==="
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query": "My monitor is flickering and showing weird colors"}'

# 4. Check tickets
echo "\n\n=== Checking created tickets ==="
curl -X GET http://localhost:5000/api/tickets/my \
  -H "Authorization: Bearer $TOKEN"
```

---

## Test Scenarios to Try

### ✅ Should Return Knowledge Base Answer:
- "How do I reset my password?"
- "I can't connect to VPN"
- "My printer is not working"
- "How do I set up Outlook email?"
- "My laptop is running slow"

### ✅ Should Auto-Create Ticket:
- "My mouse keeps disconnecting randomly"
- "I need help installing custom software"
- "My screen turns black after 5 minutes"
- "Can't access shared drive folder"
- "My keyboard keys are stuck"

---

## Troubleshooting

### Error: "Authentication required"
- Make sure you're sending the `Authorization: Bearer TOKEN` header
- Verify your token is still valid (tokens expire after 1 day)

### Error: "No token provided"
- Check that the Authorization header format is exactly: `Bearer YOUR_TOKEN`
- Make sure there's a space between "Bearer" and the token

### Ticket not created
- Check server logs for errors
- Verify there are IT support users in the database (run `npm run seed`)
- Check MongoDB connection

---

## Testing Without Knowledge Base Content

If you want to test ticket creation without any KB content:

1. Don't run `npm run add-kb`
2. Any query will automatically create a ticket
3. This is useful for testing the ticket creation flow

---

## Frontend Testing

If you're testing from your frontend:

1. Make sure the axios instance includes the auth token (it should already do this)
2. The token should be stored in localStorage after login
3. Call `/api/chat/ask` with the query
4. Handle both response types:
   - `ticketCreated: false` - Show the reply
   - `ticketCreated: true` - Show the reply and ticket details

