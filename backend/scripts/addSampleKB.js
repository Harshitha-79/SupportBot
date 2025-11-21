import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

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

function parseKBContent() {
  const kbPath = path.join(__dirname, '..', 'SAMPLE_KB_CONTENT.md');
  const content = fs.readFileSync(kbPath, 'utf8');

  console.log("File content length:", content.length);
  console.log("First 200 chars:", content.substring(0, 200));

  const sampleContent = [];
  const sections = content.split(/### Content \d+:/);

  console.log("Found sections:", sections.length);

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    console.log(`Section ${i} length:`, section.length);
    console.log(`Section ${i} preview:`, section.substring(0, 100));

    // Simple parsing: split by lines
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);

    let title = null;
    let text = null;
    let inText = false;

    for (const line of lines) {
      if (line.startsWith('**Title:**')) {
        title = line.replace('**Title:**', '').trim();
      } else if (line.startsWith('**Text:**')) {
        inText = true;
        text = '';
      } else if (inText && !line.startsWith('**Title:**') && !line.startsWith('**Text:**')) {
        if (text) text += '\n';
        text += line;
      }
    }

    console.log(`Parsed title:`, title);
    console.log(`Parsed text:`, text ? text.substring(0, 50) + '...' : 'none');

    if (title && text) {
      sampleContent.push({ title, text });
    }
  }

  return sampleContent;
}

const sampleContent = parseKBContent();
console.log("Parsed content:", sampleContent.length, "items");

async function addSampleKB() {
  console.log("📚 Adding sample knowledge base content...\n");

  const token = await loginAndGetToken();
  if (!token) {
    console.error("❌ Cannot proceed without token");
    return;
  }

  for (let i = 0; i < sampleContent.length; i++) {
    const content = sampleContent[i];
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
        console.log(`✅ Added: ${content.title} (${data.chunks} chunks)`);
      } else {
        console.error(`❌ Failed to add "${content.title}":`, data.error || data.message);
      }
    } catch (error) {
      console.error(`❌ Failed to add "${content.title}":`, error.message);
    }
  }

  console.log("\n✨ Done! You can now test the chatbot.");
  console.log("\nTest with queries like:");
  console.log("  - \"How do I reset my password?\"");
  console.log("  - \"I can't connect to VPN\"");
  console.log("  - \"My printer is not working\"");
  console.log("  - \"My laptop is running slow\"");
}

addSampleKB().catch(console.error);
