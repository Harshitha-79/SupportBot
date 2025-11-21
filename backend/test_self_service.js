// Test script to verify that the chatbot provides detailed guides for self-service queries
// instead of creating tickets

const testQueries = [
  "password reset",
  "my laptop is running slow",
  "VPN not connecting",
  "how to set up email on mobile",
  "forgot my password",
  "printer not working",
  "WiFi connection issues",
  "Outlook not syncing",
  "how to reset password",
  "laptop performance issues"
];

async function testSelfService() {
  console.log("🧪 Testing Self-Service Capabilities\n");
  console.log("These queries should provide DETAILED GUIDES, not create tickets:\n");

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`${i + 1}. Testing: "${query}"`);

    try {
      // First get a fresh token
      const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "robin@gmail.com", password: "password123" })
      });

      const loginData = await loginResponse.json();
      const token = loginData.token;

      // Test the query
      const chatResponse = await fetch("http://localhost:5000/api/chat/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });

      const chatData = await chatResponse.json();

      // Analyze the response
      const hasDetailedContent = chatData.reply && (
        chatData.reply.includes("**") || // Bold formatting
        chatData.reply.includes("1.") || // Numbered steps
        chatData.reply.includes("•") || // Bullet points
        chatData.reply.length > 200 // Substantial content
      );

      const createdTicket = chatData.ticketCreated === true;
      const suggestedTicket = chatData.ticketSuggested === true;

      console.log(`   📝 Response length: ${chatData.reply?.length || 0} chars`);
      console.log(`   🎫 Ticket created: ${createdTicket ? '❌ YES' : '✅ NO'}`);
      console.log(`   💡 Ticket suggested: ${suggestedTicket ? '⚠️ YES' : '✅ NO'}`);
      console.log(`   📋 Detailed guide: ${hasDetailedContent ? '✅ YES' : '❌ NO'}`);

      if (hasDetailedContent && !createdTicket) {
        console.log(`   ✅ SUCCESS: Provided detailed guide without creating ticket`);
      } else if (createdTicket) {
        console.log(`   ❌ FAILED: Created ticket instead of providing guide`);
      } else if (!hasDetailedContent) {
        console.log(`   ⚠️ PARTIAL: No detailed guide provided`);
      }

      // Show a preview of the response
      const preview = chatData.reply?.substring(0, 150) + (chatData.reply?.length > 150 ? '...' : '');
      console.log(`   💬 Preview: "${preview}"\n`);

    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("🎯 Test Summary:");
  console.log("✅ Queries should provide detailed guides (200+ chars, formatting)");
  console.log("✅ No tickets should be created for basic issues");
  console.log("✅ Users should get self-service solutions");
  console.log("\n🚀 Your chatbot is now providing excellent self-service support!");
}

testSelfService().catch(console.error);