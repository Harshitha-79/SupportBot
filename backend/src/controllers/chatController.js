// src/controllers/chatbotController.js
import { searchSimilar } from "../utils/faissUtils.js";
import { generateLLMResponse } from "../utils/llmUtils.js";
import nlp from "compromise";
import { createTicketHelper } from "./ticketController.js";
import User from "../models/User.js";
import ChatSession from "../models/ChatSession.js";
import { analyzeQuery, INTENTS } from "../utils/nlpUtils.js";

// Gibberish detection function
const isGibberish = (text) => {
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  if (words.length === 0) return false;

  // Check for very short words (likely gibberish)
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  if (avgWordLength < 2.5 && words.length > 2) return true;

  // Check for excessive special characters
  const specialChars = text.replace(/[a-zA-Z0-9\s]/g, '').length;
  if (specialChars > text.length * 0.3) return true;

  // Check for repetitive characters
  const repetitivePattern = /(.)\1{3,}/;
  if (repetitivePattern.test(text)) return true;

  return false;
};

// Get conversation context for user
const getConversationContext = async (userId) => {
  try {
    const session = await ChatSession.findOne({ userId }).sort({ lastActivity: -1 });
    if (session && session.messages) {
      // Return last 3 messages
      return session.messages.slice(-3).map(msg => ({
        message: msg.message,
        timestamp: msg.timestamp
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting conversation context:', error);
    return [];
  }
};

// Update conversation memory
const updateConversationMemory = async (userId, message) => {
  try {
    console.log('DEBUG: Updating conversation memory for user:', userId);

    let session = await ChatSession.findOne({ userId });

    if (!session) {
      session = new ChatSession({
        userId,
        messages: []
      });
    }

    session.messages.push({
      message,
      timestamp: Date.now(),
      role: 'user'
    });

    // Keep only last 3 messages
    if (session.messages.length > 3) {
      session.messages = session.messages.slice(-3);
    }

    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // Reset to 2 hours

    await session.save();
    console.log('DEBUG: Conversation memory updated in database, messages count:', session.messages.length);
  } catch (error) {
    console.error('Error updating conversation memory:', error);
  }
};

// Personality responses for non-IT conversations
const personalityResponses = [
  "I'm specialized in IT support, but I appreciate you reaching out! Got any tech issues I can help with? 💻",
  "While I'm great at fixing computers, I'm not so good at other topics. How about we talk tech instead? 😊",
  "That's interesting, but I'm here to help with IT problems. What's your tech question? 🔧",
  "I love chatting, but my expertise is in IT support. What's your technical issue? 🤖",
  "That's outside my wheelhouse! I'm your IT assistant - what tech problem can I solve for you? 🚀"
];

const getPersonalityResponse = () => {
  return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
};

// Keywords for work/IT-related queries
const workKeywords = [
  'vpn', 'printer', 'laptop', 'wifi', 'network', 'internet', 'email', 'outlook', 'battery', 'noise', 'slow', 'crash', 'hang', 'error', 'failed', 'install', 'update', 'driver', 'blue screen', 'bsod', 'computer', 'software', 'hardware', 'login', 'password', 'access', 'file', 'folder', 'server', 'database', 'application', 'system', 'windows', 'mac', 'linux', 'phone', 'mobile', 'tablet', 'zoom', 'teams', 'skype', 'meeting', 'conference', 'remote', 'desktop', 'monitor', 'keyboard', 'mouse', 'usb', 'port', 'connection', 'firewall', 'antivirus', 'security', 'backup', 'restore', 'sync', 'cloud', 'storage', 'disk', 'memory', 'ram', 'cpu', 'gpu', 'browser', 'chrome', 'firefox', 'edge', 'safari', 'website', 'portal', 'intranet', 'sharepoint', 'office', 'word', 'excel', 'powerpoint', 'outlook', 'skype', 'teams', 'slack', 'jira', 'confluence', 'git', 'github', 'bitbucket', 'jenkins', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'vmware', 'virtual', 'hypervisor', 'san', 'nas', 'raid', 'encryption', 'certificate', 'ssl', 'tls', 'issue', 'problem'
];

// Priority detection keywords
const urgencyKeywords = ['urgent', 'critical', 'emergency', 'asap', 'immediately', 'right now', 'stuck', 'broken', 'not working', 'blocked', 'cannot access', 'locked out', 'down', 'failed'];
const bugKeywords = ['bug', 'error', 'crash', 'freeze', 'hang', 'not responding', 'broken'];
const performanceKeywords = ['slow', 'performance', 'lag', 'delay', 'loading'];
const accessKeywords = ['login', 'password', 'account', 'access', 'blocked', 'locked', 'cannot'];

// Function to check if query is work-related
const isWorkRelated = (query) => {
  const lowerQuery = query.toLowerCase();
  return workKeywords.some(keyword => lowerQuery.includes(keyword));
};

// Function to detect priority level - more aggressive urgency detection
const detectPriority = (query) => {
  const lowerQuery = query.toLowerCase();

  // High priority: urgency keywords OR access issues OR multiple IT keywords
  if (urgencyKeywords.some(keyword => lowerQuery.includes(keyword)) ||
      accessKeywords.some(keyword => lowerQuery.includes(keyword)) ||
      (workKeywords.filter(keyword => lowerQuery.includes(keyword)).length >= 2)) {
    return 'high';
  }

  // Medium priority: bugs or system issues
  if (bugKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'medium';
  }

  // Low priority: performance issues OR informational questions OR IT support queries
  if (performanceKeywords.some(keyword => lowerQuery.includes(keyword)) ||
      lowerQuery.includes('how') || lowerQuery.includes('what') || lowerQuery.includes('why') ||
      lowerQuery.includes('when') || lowerQuery.includes('where') || lowerQuery.includes('?') ||
      workKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return 'low';
  }

  return 'medium'; // default for unclear issues
};

// Function to determine if query should bypass clarification
const shouldBypassClarification = (query) => {
  const lowerQuery = query.toLowerCase();
  const wordCount = query.trim().split(/\s+/).length;

  // Bypass if contains urgency keywords
  if (urgencyKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return true;
  }

  // Bypass if has multiple IT keywords (indicates specific issue)
  const itKeywordCount = workKeywords.filter(keyword => lowerQuery.includes(keyword)).length;
  if (itKeywordCount >= 2) {
    return true;
  }

  // Bypass if exactly 2-3 words and contains IT keywords
  if (wordCount >= 2 && wordCount <= 3 && itKeywordCount >= 1) {
    return true;
  }

  return false;
};

export const askBot = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const trimmedQuery = query.trim();
    const userId = req.user._id;

    // Get conversation context for intelligent analysis
    const context = await getConversationContext(userId);
    const contextMessages = context.map(c => c.message);

    // Perform intelligent analysis
    const analysis = analyzeQuery(trimmedQuery, contextMessages);

    console.log('🤖 AI Analysis:', {
      intent: analysis.intent,
      entities: analysis.entities,
      sentiment: analysis.sentiment,
      priority: analysis.priority
    });

    // Update conversation memory
    await updateConversationMemory(userId, trimmedQuery);

    // Check for gibberish first
    if (isGibberish(trimmedQuery)) {
      return res.status(200).json({
        reply: "🤔 **That doesn't look like a valid message!**\n\nI'm here to help with IT support. Try asking about:\n• WiFi problems\n• Software issues\n• Hardware problems\n• Account access\n\nOr type `/help` for more options!",
        ticketCreated: false,
        priority: 'low' // Gibberish is low priority
      });
    }

    // Handle different intents with intelligent responses
    switch (analysis.intent) {
      case INTENTS.COMMAND:
        return await handleCommandIntent(trimmedQuery, req, analysis);
  
      case INTENTS.GREETING:
        return await handleGreetingIntent(req, analysis);
  
      case INTENTS.GRATITUDE:
        return await handleGratitudeIntent(req, analysis);
  
      case INTENTS.NON_IT:
        return res.status(200).json({
          reply: analysis.response,
          ticketCreated: false,
          priority: 'low' // Non-IT conversations are low priority
        });
  
      case INTENTS.PROBLEM_REPORT:
      case INTENTS.COMPLAINT:
        return await handleProblemIntent(trimmedQuery, req, analysis);
  
      case INTENTS.HELP_REQUEST:
      case INTENTS.STATUS_INQUIRY:
      case INTENTS.CLARIFICATION:
      case INTENTS.INFORMATION_REQUEST:
        return await handleKnowledgeIntent(trimmedQuery, req, analysis);
  
      default:
        // Check for follow-up responses first
        const followUpResponse = await checkFollowUpResponses(trimmedQuery, req);
        if (followUpResponse) {
          return followUpResponse;
        }
  
        // Fallback to knowledge base search
        return await handleKnowledgeIntent(trimmedQuery, req, analysis);
    }

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Chatbot failed to respond." });
  }
};

// Handle greeting intents with context awareness
async function handleGreetingIntent(req, analysis) {
  const context = await getConversationContext(req.user._id);

  let response = analysis.response;

  // If they have previous conversation, reference it
  if (context.length > 0) {
    const lastTopic = context[context.length - 1].message;
    response += `\n\n💭 **Picking up where we left off:** You were asking about "${lastTopic}". How can I help you with that?`;
  } else {
    // First time greeting
    response += `\n\nI'm here to help with all your IT needs! Feel free to ask me anything about:\n• Password resets\n• Software installation\n• Hardware issues\n• Network problems\n• And much more!`;
  }

  return req.res.status(200).json({
    reply: response,
    ticketCreated: false,
    priority: 'low' // Gratitude is always low priority
  });
}

// Handle gratitude with personalized response
async function handleGratitudeIntent(req, analysis) {
  const context = await getConversationContext(req.user._id);

  let response = analysis.response;

  // Add personalized touch based on conversation
  if (context.length > 0) {
    response += `\n\nIt was my pleasure helping you with your IT questions! Remember, I'm always here if you need assistance. Just type your question anytime! 😊`;
  } else {
    response += `\n\nGlad I could help! Don't hesitate to reach out anytime you have IT questions. Have a great day! 🌟`;
  }

  return req.res.status(200).json({
    reply: response,
    ticketCreated: false,
    priority: 'low' // Greetings are always low priority
  });
}

// Handle command intents (create ticket, help, status)
async function handleCommandIntent(query, req, analysis) {
  const lowerQuery = query.toLowerCase();

  // Help command
  if (lowerQuery.includes('/help') || (lowerQuery.includes('help') && lowerQuery.split(' ').length <= 3)) {
    return req.res.status(200).json({
      reply: `🤖 **IT Support Bot Commands:**\n\n📝 **Create Ticket:** "create ticket [description]" or "/create"\n🚨 **Urgent Issue:** "urgent [problem description]"\n📊 **Check Status:** "status of ticket" or "/status"\n❓ **Help:** "/help" or "help"\n\n💡 **Examples:**\n• "create ticket my laptop is slow"\n• "urgent accountant login blocked"\n• "my wifi stopped working"\n\n💬 **Pro tip:** Just describe your issue and I'll understand it intelligently!`,
      ticketCreated: false,
      priority: 'low' // Help commands are low priority
    });
  }

  // Status command
  if (lowerQuery.includes('/status') || (lowerQuery.includes('status') && lowerQuery.includes('ticket'))) {
    const context = await getConversationContext(req.user._id);
    return req.res.status(200).json({
      reply: `📊 **To check your ticket status:**\n\n1. Go to "My Tickets" from the navigation menu\n2. Click on any ticket to see its current status\n3. Chat with IT staff directly in the ticket details\n\n💡 **Current conversation context:** ${context.length > 0 ? 'I remember our recent chat about: ' + context.slice(-1)[0].message : 'This is the start of our conversation'}`,
      ticketCreated: false,
      priority: 'low' // Status commands are low priority
    });
  }

  // Create ticket command
  if (lowerQuery.includes('create ticket') || lowerQuery.startsWith('/create')) {
    const ticketTitle = query.replace(/create ticket/i, '').trim() || 'User requested ticket creation';
    const chatHistory = Array.isArray(req.body.messages) ? req.body.messages : [];

    try {
      const ticket = await createTicketHelper(req.user._id, ticketTitle, query, chatHistory, analysis.priority);
      const assignedLabel = ticket.assignedTo ? (ticket.assignedTo.name || ticket.assignedTo.email || 'IT team') : 'IT team';
      const priorityText = analysis.priority === 'high' ? 'high-priority' : 'standard';

      return req.res.status(200).json({
        reply: `✅ **Ticket Created!**\n\n🎫 **ID:** ${ticket._id}\n👤 **Assigned to:** ${assignedLabel}\n⚡ **Priority:** ${priorityText}\n\n💬 You can now chat with IT support in the ticket details. They'll respond within 2-4 hours.`,
        ticketCreated: true,
        ticket: {
          id: ticket._id,
          assignedTo: assignedLabel,
          priority: analysis.priority
        }
      });
    } catch (ticketErr) {
      console.error('Failed to create ticket:', ticketErr);
      return req.res.status(200).json({
        reply: "❌ Sorry, I couldn't create your ticket automatically. Please go to the Tickets page to create one manually.",
        ticketCreated: false
      });
    }
  }
}

// Handle problem reports and complaints
async function handleProblemIntent(query, req, analysis) {
  const hasSpecificEntities = analysis.entities.software.length > 0 ||
                            analysis.entities.hardware.length > 0 ||
                            analysis.entities.issues.length > 0;

  // Only create tickets automatically for:
  // 1. Explicit urgent requests, OR
  // 2. High-priority issues with specific entities (software/hardware/issues mentioned)
  const shouldCreateTicket = analysis.sentiment.urgent ||
                            (analysis.priority === 'high' && hasSpecificEntities) ||
                            analysis.intent === 'complaint';

  // For medium priority issues, try to provide detailed troubleshooting first
  if (analysis.priority === 'medium' && hasSpecificEntities) {
    console.log('🔧 Medium priority issue with entities - searching KB for solutions');

    try {
      // Search knowledge base for detailed troubleshooting
      const results = await searchSimilar(query, 0.1);

      if (results && results.length > 0) {
        // Filter and rank results based on entity relevance
        const relevantResults = rankResultsByEntities(results, analysis.entities);
        const topResult = relevantResults[0];
        const confidence = (topResult.score * 100);
        const relevanceCheck = isResultRelevant(topResult, analysis.entities);

        console.log('🔍 KB Search for medium priority issue:');
        console.log('  Query:', query);
        console.log('  Top result:', topResult.doc.title);
        console.log('  Confidence:', confidence.toFixed(1) + '%');
        console.log('  Relevant:', relevanceCheck);

        // If we find a good match, provide detailed troubleshooting
        if (confidence >= 30 && relevanceCheck) {
          console.log('✅ Found relevant KB article for medium priority issue');
          return provideDetailedKBResponse(topResult, analysis, req);
        }
      }
    } catch (kbError) {
      console.warn('⚠️ KB search failed for medium priority issue:', kbError.message);
    }
  }

  // For low priority issues that look like questions, also try KB search
  const isQuestion = query.toLowerCase().includes('what') || query.toLowerCase().includes('how') ||
                     query.toLowerCase().includes('why') || query.toLowerCase().includes('when') ||
                     query.toLowerCase().includes('where') || query.toLowerCase().includes('?');

  if (analysis.priority === 'low' && isQuestion) {
    console.log('❓ Low priority question detected - searching KB for answers');

    try {
      // Search knowledge base with lower threshold for questions
      const results = await searchSimilar(query, 0.05);

      if (results && results.length > 0) {
        const topResult = results[0];
        const confidence = (topResult.score * 100);

        console.log('🔍 KB Search for low priority question:');
        console.log('  Query:', query);
        console.log('  Top result:', topResult.doc.title);
        console.log('  Confidence:', confidence.toFixed(1) + '%');

        // If we find a reasonable match, provide the answer and return
        if (confidence >= 15) {
          console.log('✅ Found KB answer for low priority question - providing answer without ticket');
          return provideDetailedKBResponse(topResult, analysis, req);
        }
      }
    } catch (kbError) {
      console.warn('⚠️ KB search failed for low priority question:', kbError.message);
    }
  }

  if (shouldCreateTicket) {
    console.log('🎫 Creating ticket for specific issue:', {
      query,
      entities: hasSpecificEntities,
      priority: analysis.priority,
      urgent: analysis.sentiment.urgent,
      intent: analysis.intent
    });

    const ticketTitle = query.length > 100 ? query.substring(0, 97) + "..." : query;
    const chatHistory = Array.isArray(req.body.messages) ? req.body.messages : [];

    try {
      const ticket = await createTicketHelper(req.user._id, ticketTitle, query, chatHistory, analysis.priority);

      // Get a random IT support staff member for better user experience
      const User = (await import('../models/User.js')).default;
      const itStaff = await User.find({ role: 'it_support', isApproved: true });
      const randomStaff = itStaff.length > 0 ? itStaff[Math.floor(Math.random() * itStaff.length)] : null;

      const assignedLabel = ticket.assignedTo
        ? (ticket.assignedTo.name || ticket.assignedTo.email || 'IT Support Team')
        : (randomStaff ? randomStaff.name : 'IT Support Team');

      return req.res.status(200).json({
        reply: `${analysis.response}\n\n🎫 **ID:** ${ticket._id}\n👤 **Assigned to:** ${assignedLabel}\n⚡ **Priority:** ${analysis.priority.toUpperCase()}\n⏰ **Response:** Within ${analysis.priority === 'high' ? '2 hours' : '2-4 hours'}\n\n💬 IT support will contact you immediately. You can also chat in the ticket details.`,
        ticketCreated: true,
        ticket: {
          id: ticket._id,
          assignedTo: assignedLabel,
          priority: analysis.priority
        }
      });
    } catch (ticketErr) {
      console.error('Failed to create ticket:', ticketErr);
      return req.res.status(200).json({
        reply: `${analysis.response}\n\n❌ **However, I couldn't create a ticket automatically.** Please call IT support directly or create a ticket manually on the Tickets page.`,
        ticketCreated: false
      });
    }
  }

  // For general problems without specific entities or when KB search fails, provide helpful response
  return req.res.status(200).json({
    reply: `${analysis.response}\n\n💡 **Would you like me to create a support ticket for IT to help you directly?**\n\n💬 **Just reply:** "create ticket" and I'll handle everything!`,
    ticketCreated: false,
    ticketSuggested: true,
    suggested: {
      description: query,
      urgency: analysis.priority
    },
    priority: analysis.priority
  });
}

// Handle knowledge-based intents (help requests, status inquiries, etc.)
async function handleKnowledgeIntent(query, req, analysis) {
  console.log('🔍 Searching KB for query:', query, 'with entities:', analysis.entities);

  // Search knowledge base with improved relevance (very low threshold for password-related queries)
  const isPasswordQuery = query.toLowerCase().includes('password') || query.toLowerCase().includes('reset') ||
                          query.toLowerCase().includes('forgot') || query.toLowerCase().includes('login');

  let searchThreshold = 0.05;
  if (isPasswordQuery) {
    searchThreshold = 0.001; // Very low threshold for password queries
  }

  let results = await searchSimilar(query, searchThreshold);

  // If no results for password queries, try even more aggressively
  if (results.length === 0 && isPasswordQuery) {
    console.log('🔍 No results found, trying with minimal threshold...');
    results = await searchSimilar(query, 0.0001);
  }

  // If still no results for password queries, force return a password-related result
  if (results.length === 0 && isPasswordQuery) {
    console.log('🔍 Forcing password-related search...');
    const allResults = await searchSimilar('password', 0.0001);
    if (allResults.length > 0) {
      results = [allResults[0]]; // Take the best password-related result
      console.log('✅ Found password-related result:', results[0].doc.title);
    }
  }

  console.log(`🔍 Search results for "${query}":`, results?.length || 0, 'results found');
  if (results && results.length > 0) {
    console.log('Top result:', results[0].doc.title, 'Score:', results[0].score.toFixed(3));
    console.log('Content preview:', results[0].doc.text.substring(0, 100) + '...');
  } else {
    console.log('❌ No results found at threshold', searchThreshold);
    // Try with even lower threshold
    const fallbackResults = await searchSimilar(query, 0.001);
    console.log('Fallback search:', fallbackResults?.length || 0, 'results');
    if (fallbackResults && fallbackResults.length > 0) {
      console.log('Fallback top result:', fallbackResults[0].doc.title, 'Score:', fallbackResults[0].score.toFixed(3));
    }
  }

  if (!results || results.length === 0) {
    console.log(`❌ No KB results found for query: "${query}"`);

    // Provide intelligent fallback based on entities found
    return provideIntelligentFallback(query, analysis, req);
  }

  // Filter and rank results based on entity relevance
  const relevantResults = rankResultsByEntities(results, analysis.entities);
  const topResult = relevantResults[0];
  const confidence = (topResult.score * 100);
  const relevanceCheck = isResultRelevant(topResult, analysis.entities);

  console.log('🔍 KB Search Debug:');
  console.log('  Query:', query);
  console.log('  Entities found:', analysis.entities);
  console.log('  Results found:', results.length);
  console.log('  Top result:', topResult.doc.title);
  console.log('  Original confidence:', (topResult.score * 100).toFixed(1) + '%');
  console.log('  Relevance score:', (topResult.relevanceScore * 100).toFixed(1) + '%');
  console.log('  Is relevant:', relevanceCheck);
  console.log('  Confidence >= 60:', confidence >= 60);
  console.log('  Should provide detailed response:', confidence >= 60 && relevanceCheck);

  // For high confidence matches with relevant entities, provide detailed help
  // Special handling for password-related queries - always provide detailed guide
  if (isPasswordQuery && results.length > 0) {
    console.log('🔐 Password query detected - providing detailed password guide');
    // Find the best password-related result
    const passwordResult = results.find(r => r.doc.title.toLowerCase().includes('password') ||
                                           r.doc.text.toLowerCase().includes('password reset')) || results[0];
    return provideDetailedKBResponse(passwordResult, analysis, req);
  }

  // Lowered threshold for better matching
  if (confidence >= 20 && relevanceCheck) {
    console.log('✅ Providing detailed KB response');
    return provideDetailedKBResponse(topResult, analysis, req);
  }

  // For medium confidence or less relevant results
  if (confidence >= 15) {
    return provideGeneralKBResponse(topResult, analysis, req);
  }

  // Low confidence - fallback
  return provideIntelligentFallback(query, analysis, req);
}

// Rank search results by entity relevance
function rankResultsByEntities(results, entities) {
  return results.map(result => {
    let relevanceScore = result.score;

    // Boost score if result contains mentioned entities
    const resultText = result.doc.text.toLowerCase();
    const resultTitle = result.doc.title.toLowerCase();

    // Check software entities
    for (const software of entities.software) {
      if (resultText.includes(software.key) || resultTitle.includes(software.key)) {
        relevanceScore += 0.3;
      }
    }

    // Check hardware entities
    for (const hardware of entities.hardware) {
      if (resultText.includes(hardware.key) || resultTitle.includes(hardware.key)) {
        relevanceScore += 0.3;
      }
    }

    // Check issue entities
    for (const issue of entities.issues) {
      if (resultText.includes(issue.key) || resultTitle.includes(issue.key)) {
        relevanceScore += 0.2;
      }
    }

    return { ...result, relevanceScore };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Check if result is relevant to the entities found
function isResultRelevant(result, entities) {
  const resultText = result.doc.text.toLowerCase();
  const resultTitle = result.doc.title.toLowerCase();

  console.log('🔍 Relevance Check Debug:');
  console.log('  Result title:', result.doc.title);
  console.log('  Entities:', entities);

  // Must match at least one entity if entities were found
  const hasSoftware = entities.software.length > 0;
  const hasHardware = entities.hardware.length > 0;
  const hasIssues = entities.issues.length > 0;

  console.log('  Has software:', hasSoftware, 'hardware:', hasHardware, 'issues:', hasIssues);

  if (hasSoftware) {
    for (const software of entities.software) {
      console.log('  Checking software:', software.key, 'in result:', resultText.includes(software.key) || resultTitle.includes(software.key));
      if (resultText.includes(software.key) || resultTitle.includes(software.key)) {
        console.log('  ✅ Software match found');
        return true;
      }
    }
  }

  if (hasHardware) {
    for (const hardware of entities.hardware) {
      console.log('  Checking hardware:', hardware.key, 'in result:', resultText.includes(hardware.key) || resultTitle.includes(hardware.key));
      if (resultText.includes(hardware.key) || resultTitle.includes(hardware.key)) {
        console.log('  ✅ Hardware match found');
        return true;
      }
    }
  }

  if (hasIssues) {
    for (const issue of entities.issues) {
      console.log('  Checking issue:', issue.key, 'in result:', resultText.includes(issue.key) || resultTitle.includes(issue.key));
      if (resultText.includes(issue.key) || resultTitle.includes(issue.key)) {
        console.log('  ✅ Issue match found');
        return true;
      }
    }
  }

  // If no specific entities, any result is potentially relevant
  const noEntities = !hasSoftware && !hasHardware && !hasIssues;
  console.log('  No specific entities found, result is relevant:', noEntities);
  return noEntities;
}

// Provide concise response from knowledge base
async function provideDetailedKBResponse(result, analysis, req) {
  console.log('📝 Providing concise KB response');

  const text = result.doc.text;

  // Process text to preserve section structure and fix formatting issues
  let formattedText = text;

  // Fix common formatting issues in KB content
  formattedText = formattedText.replace(/^rm\s+(.+)$/gm, 'Check $1'); // Fix "rm username" to "Check username"
  formattedText = formattedText.replace(/^\d+\.\s*(Slow VPN Performance|VPN Disconnects Frequently|Cannot Access Internal Resources)/gm, '**$1:**'); // Convert section headers to bold

  // Clean up any remaining formatting issues
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n'); // Normalize multiple newlines

  // Direct, clean response
  let response = `**${result.doc.title}**\n\n${formattedText}\n\n❓ **Did this solve your issue?** Reply "yes" if resolved, or "create ticket" for more help.`;

  return req.res.status(200).json({
    reply: response,
    confidence: `${(result.relevanceScore * 100).toFixed(0)}%`,
    ticketCreated: false,
    followUpExpected: true,
    responseType: 'formatted-template',
    priority: analysis.priority
  });
}

// Provide general response from knowledge base
async function provideGeneralKBResponse(result, analysis, req) {
  try {
    // Try to use LLM for intelligent response generation
    console.log('🤖 Attempting LLM for general KB response');

    // Prepare context for LLM
    const kbContext = [{
      title: result.doc.title,
      text: result.doc.text
    }];

    const context = await getConversationContext(req.user._id);
    const conversationHistory = context.map(c => ({
      message: c.message,
      role: 'user',
      timestamp: c.timestamp
    }));

    const llmResult = await generateLLMResponse(req.body.query, kbContext, conversationHistory);

    // Format LLM response
    let response = `📖 **I found this information that might help:**\n\n**${result.doc.title}**\n\n${llmResult.response}`;

    // Add follow-up
    response += `\n\n💡 **Does this answer your question?** If you need more specific help, reply "create ticket" and I'll connect you with IT support!`;

    console.log('✅ LLM response generated successfully');
    return req.res.status(200).json({
      reply: response,
      confidence: `${(result.relevanceScore * 100).toFixed(0)}%`,
      ticketCreated: false,
      ticketSuggested: true,
      suggested: {
        description: req.body.query,
        urgency: analysis.priority
      },
      responseType: 'llm-generated',
      priority: analysis.priority
    });
  } catch (llmError) {
    console.warn('⚠️ LLM generation failed, falling back to template:', llmError.message);
  }

  // Fallback to template-based response
  console.log('📝 Using template-based response (LLM failed)');

  const context = await getConversationContext(req.user._id);
  const contextNote = context.length > 0 ? `\n\n💭 **Remembering our chat:** You also mentioned "${context.slice(-1)[0].message}"` : '';

  const response = `📖 **I found this information that might help:**\n\n**${result.doc.title}**\n${result.doc.text.substring(0, 300)}${result.doc.text.length > 300 ? '...' : ''}${contextNote}\n\n💡 **Does this answer your question?** If you need more specific help, reply "create ticket" and I'll connect you with IT support!`;

  return req.res.status(200).json({
    reply: response,
    confidence: `${(result.relevanceScore * 100).toFixed(0)}%`,
    ticketCreated: false,
    ticketSuggested: true,
    suggested: {
      description: req.body.query,
      urgency: analysis.priority
    },
    responseType: 'template-based',
    priority: analysis.priority
  });
}

// Check for follow-up responses to previous detailed help
async function checkFollowUpResponses(query, req) {
  const lowerQuery = query.toLowerCase().trim();

  // Positive responses - user understood
  const positiveResponses = ['yes', 'understood', 'got it', 'clear', 'thanks', 'thank you', 'that helped', 'worked', 'fixed', 'solved'];
  const isPositive = positiveResponses.some(response => lowerQuery.includes(response));

  // Negative responses - user still needs help
  const negativeResponses = ['no', 'still confused', 'didnt work', 'not working', 'doesnt work', 'still need help', 'not clear', 'confused', 'help', 'stuck'];
  const isNegative = negativeResponses.some(response => lowerQuery.includes(response));

  if (isPositive) {
    return req.res.status(200).json({
      reply: `🎉 **Great! I'm glad that helped!**\n\nIf you run into any other IT issues in the future, feel free to ask. I'm always here to help! 😊\n\n💡 **Have a productive day!**`,
      ticketCreated: false
    });
  }

  if (isNegative) {
    // Auto-create ticket for users who are still confused
    const context = await getConversationContext(req.user._id);
    const lastTopic = context.length > 0 ? context[context.length - 1].message : 'Previous IT issue';

    try {
      const ticket = await createTicketHelper(req.user._id, `Follow-up: ${lastTopic}`, `User followed detailed instructions but still needs help: "${query}". Previous context: ${lastTopic}`, [], 'medium');

      // Get a random IT support staff member
      const User = (await import('../models/User.js')).default;
      const itStaff = await User.find({ role: 'it_support', isApproved: true });
      const randomStaff = itStaff.length > 0 ? itStaff[Math.floor(Math.random() * itStaff.length)] : null;

      const assignedLabel = ticket.assignedTo
        ? (ticket.assignedTo.name || ticket.assignedTo.email || 'IT Support Team')
        : (randomStaff ? randomStaff.name : 'IT Support Team');

      return req.res.status(200).json({
        reply: `🤝 **I understand - let's get you the help you need!**\n\nSince the instructions didn't resolve your issue, I've created a support ticket so our IT team can assist you directly.\n\n🎫 **ID:** ${ticket._id}\n👤 **Assigned to:** ${assignedLabel}\n⚡ **Priority:** MEDIUM\n⏰ **Response:** Within 2-4 hours\n\n💬 IT support will contact you soon. You can also chat in the ticket details.`,
        ticketCreated: true,
        ticket: {
          id: ticket._id,
          assignedTo: assignedLabel,
          priority: 'medium'
        }
      });
    } catch (ticketErr) {
      console.error('Failed to auto-create follow-up ticket:', ticketErr);
      return req.res.status(200).json({
        reply: `🤝 **I understand you still need help.**\n\nI tried to create a support ticket automatically, but there was an issue. Please go to the Tickets page to create one manually, or call IT support directly.\n\n❌ **Error:** ${ticketErr.message}`,
        ticketCreated: false
      });
    }
  }

  return null; // Not a follow-up response
}

// Provide intelligent fallback when no good KB matches
async function provideIntelligentFallback(query, analysis, req) {
  const context = await getConversationContext(req.user._id);
  const contextMsg = context.length > 0 ?
    `\n\n💭 **Based on our conversation:** You mentioned "${context.slice(-1)[0].message}"` : '';

  let response = `🤔 **I don't have specific instructions for that in my knowledge base.**${contextMsg}\n\n`;

  // Provide entity-specific suggestions
  if (analysis.entities.software.length > 0) {
    const software = analysis.entities.software[0];
    response += `💻 **For ${software.name}:**\n`;
    response += `• Check if the software is properly installed\n`;
    response += `• Try restarting the application\n`;
    response += `• Verify your login credentials\n`;
    response += `• Check for available updates\n\n`;
  }

  if (analysis.entities.hardware.length > 0) {
    const hardware = analysis.entities.hardware[0];
    response += `🔧 **For ${hardware.name} issues:**\n`;
    response += `• Ensure it's properly connected\n`;
    response += `• Check power/cable connections\n`;
    response += `• Try a different port or cable\n`;
    response += `• Restart your computer\n\n`;
  }

  if (analysis.entities.issues.length > 0) {
    const issue = analysis.entities.issues[0];
    response += `🔍 **General troubleshooting for ${issue.name}:**\n`;
    response += `• Restart your computer\n`;
    response += `• Check your internet connection\n`;
    response += `• Clear cache and temporary files\n`;
    response += `• Update your software\n\n`;
  }

  response += `💡 **Need personalized help?** Reply "create ticket" and I'll get IT support to assist you directly!`;

  return req.res.status(200).json({
    reply: response,
    ticketCreated: false,
    ticketSuggested: true,
    suggested: {
      description: query,
      urgency: analysis.priority
    },
    priority: analysis.priority
  });
}
