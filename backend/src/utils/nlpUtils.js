// Advanced NLP utilities for intelligent chatbot
// Intent classification, entity recognition, and sentiment analysis

// Intent types
export const INTENTS = {
  PROBLEM_REPORT: 'problem_report',     // "My laptop crashed"
  HELP_REQUEST: 'help_request',         // "How do I reset password?"
  STATUS_INQUIRY: 'status_inquiry',     // "Is the server down?"
  INFORMATION_REQUEST: 'information_request', // "What is the WiFi password?"
  COMPLAINT: 'complaint',              // "This is unacceptable!"
  GRATITUDE: 'gratitude',              // "Thanks for the help"
  CLARIFICATION: 'clarification',       // "What do you mean?"
  COMMAND: 'command',                  // "Create ticket", "Show status"
  GREETING: 'greeting',                // "Hello", "Hi"
  NON_IT: 'non_it'                     // Off-topic conversation
};

// Entity types
export const ENTITIES = {
  SOFTWARE: {
    'outlook': 'Microsoft Outlook',
    'word': 'Microsoft Word',
    'excel': 'Microsoft Excel',
    'powerpoint': 'Microsoft PowerPoint',
    'chrome': 'Google Chrome',
    'firefox': 'Mozilla Firefox',
    'edge': 'Microsoft Edge',
    'vpn': 'VPN Client',
    'zoom': 'Zoom',
    'teams': 'Microsoft Teams',
    'skype': 'Skype',
    'slack': 'Slack',
    'onedrive': 'OneDrive',
    'sharepoint': 'SharePoint',
    'dropbox': 'Dropbox',
    'googledrive': 'Google Drive',
    'drive': 'Google Drive'
  },
  HARDWARE: {
    'laptop': 'Laptop',
    'desktop': 'Desktop Computer',
    'printer': 'Printer',
    'monitor': 'Monitor',
    'keyboard': 'Keyboard',
    'mouse': 'Mouse',
    'headphones': 'Headphones',
    'webcam': 'Webcam',
    'router': 'Router',
    'switch': 'Network Switch'
  },
  ISSUES: {
    'crash': 'Application Crash',
    'freeze': 'System Freeze',
    'slow': 'Performance Issue',
    'error': 'Error Message',
    'login': 'Login Problem',
    'wifi': 'WiFi Connection',
    'bluescreen': 'Blue Screen of Death',
    'restart': 'System Restart Loop',
    'update': 'Software Update Issue',
    'install': 'Installation Problem',
    'sync': 'Synchronization Issue',
    'syncing': 'Synchronization Issue'
  },
  DEPARTMENTS: {
    'accounting': 'Accounting',
    'hr': 'Human Resources',
    'sales': 'Sales',
    'marketing': 'Marketing',
    'it': 'IT Department',
    'finance': 'Finance',
    'operations': 'Operations'
  }
};

// Sentiment patterns
const SENTIMENT_PATTERNS = {
  frustrated: ['damn', 'stupid', 'useless', 'terrible', 'worst', 'horrible', 'ridiculous', 'unacceptable', 'pathetic'],
  urgent: ['asap', 'immediately', 'right now', 'stuck', 'blocked', 'urgent', 'emergency', 'critical'],
  confused: ['confused', 'lost', 'no idea', 'dont understand', 'help please', 'what do i do'],
  positive: ['great', 'excellent', 'awesome', 'perfect', 'thank you', 'thanks', 'good job']
};

// Intent classification patterns
const INTENT_PATTERNS = {
  [INTENTS.PROBLEM_REPORT]: [
    'not working', 'doesnt work', 'stopped working', 'crashed', 'frozen', 'broken',
    'failed', 'error', 'issue', 'problem', 'cant access', 'wont open', 'slow'
  ],
  [INTENTS.HELP_REQUEST]: [
    'how do i', 'how to', 'help me', 'guide', 'tutorial', 'instructions', 'steps'
  ],
  [INTENTS.STATUS_INQUIRY]: [
    'is it down', 'status of', 'working?', 'available?', 'online?', 'check if'
  ],
  [INTENTS.INFORMATION_REQUEST]: [
    'what is', 'what are', 'where is', 'where can', 'what\'s', 'how many', 'who is',
    'when is', 'which', 'where do', 'what time', 'what day'
  ],
  [INTENTS.COMPLAINT]: [
    'unacceptable', 'ridiculous', 'terrible', 'worst', 'pathetic', 'disappointed'
  ],
  [INTENTS.GRATITUDE]: [
    'thank you', 'thanks', 'thank u', 'thx', 'ty', 'appreciate', 'helpful', 'great job', 'awesome', 'perfect', 'excellent'
  ],
  [INTENTS.CLARIFICATION]: [
    'what do you mean', 'explain', 'clarify', 'dont understand', 'confused'
  ],
  [INTENTS.COMMAND]: [
    'create ticket', 'show status', 'check tickets', '/create', '/status', '/help'
  ],
  [INTENTS.GREETING]: [
    'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'morning', 'afternoon', 'evening', 'howdy', 'hiya', 'yo', 'sup', 'what\'s up'
  ]
};

// Classify user intent
export function classifyIntent(query) {
  const lowerQuery = query.toLowerCase();

  // Check for explicit commands first
  if (lowerQuery.includes('create ticket') || lowerQuery.startsWith('/create')) {
    return INTENTS.COMMAND;
  }
  if (lowerQuery.includes('/status') || lowerQuery.includes('status') && lowerQuery.includes('ticket')) {
    return INTENTS.COMMAND;
  }
  if (lowerQuery.includes('/help') || (lowerQuery.includes('help') && lowerQuery.split(' ').length <= 3)) {
    return INTENTS.COMMAND;
  }

  // Check greetings
  const greetingRegex = /^(hi|hello|hey|good morning|good afternoon|good evening)/i;
  if (greetingRegex.test(query.toLowerCase())) {
    return INTENTS.GREETING;
  }

  // Check for informational questions first (before problem reports)
  if (INTENT_PATTERNS[INTENTS.INFORMATION_REQUEST].some(pattern => lowerQuery.includes(pattern))) {
    return INTENTS.INFORMATION_REQUEST;
  }

  // Check other intents
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    if (intent !== INTENTS.INFORMATION_REQUEST && patterns.some(pattern => lowerQuery.includes(pattern))) {
      return intent;
    }
  }

  // Check if it's IT-related (fallback)
  const workKeywords = ['vpn', 'printer', 'laptop', 'wifi', 'network', 'email', 'computer', 'software', 'login', 'password', 'onedrive', 'sharepoint', 'sync', 'syncing', 'drive', 'cloud', 'storage', 'backup', 'restore', 'access', 'permission', 'folder', 'file', 'server', 'database', 'application', 'system', 'windows', 'mac', 'linux', 'phone', 'mobile', 'tablet', 'zoom', 'teams', 'skype', 'slack', 'meeting', 'conference', 'remote', 'desktop', 'monitor', 'keyboard', 'mouse', 'usb', 'port', 'connection', 'firewall', 'antivirus', 'security', 'disk', 'memory', 'ram', 'cpu', 'gpu', 'browser', 'website', 'portal', 'intranet', 'office', 'word', 'excel', 'powerpoint', 'outlook', 'skype', 'teams', 'slack', 'jira', 'confluence', 'git', 'github', 'bitbucket', 'jenkins', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'vmware', 'virtual', 'hypervisor', 'san', 'nas', 'raid', 'encryption', 'certificate', 'ssl', 'tls', 'issue', 'problem'];
  const isITRelated = workKeywords.some(keyword => lowerQuery.includes(keyword));

  if (isITRelated) {
    return INTENTS.PROBLEM_REPORT; // Default to problem report for IT queries
  }

  return INTENTS.NON_IT;
}

// Extract entities from query with improved accuracy
export function extractEntities(query) {
  const lowerQuery = query.toLowerCase();
  const entities = {
    software: [],
    hardware: [],
    issues: [],
    departments: []
  };

  // Extract software entities with word boundaries to avoid false matches
  for (const [key, name] of Object.entries(ENTITIES.SOFTWARE)) {
    // Use word boundaries and check for exact matches or common variations
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      entities.software.push({ key, name });
    }
  }

  // Extract hardware entities
  for (const [key, name] of Object.entries(ENTITIES.HARDWARE)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      entities.hardware.push({ key, name });
    }
  }

  // Extract issue entities
  for (const [key, name] of Object.entries(ENTITIES.ISSUES)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      entities.issues.push({ key, name });
    }
  }

  // Extract department entities
  for (const [key, name] of Object.entries(ENTITIES.DEPARTMENTS)) {
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(lowerQuery)) {
      entities.departments.push({ key, name });
    }
  }

  // Remove duplicates and sort by relevance
  entities.software = [...new Set(entities.software.map(s => JSON.stringify(s)))].map(s => JSON.parse(s));
  entities.hardware = [...new Set(entities.hardware.map(h => JSON.stringify(h)))].map(h => JSON.parse(h));
  entities.issues = [...new Set(entities.issues.map(i => JSON.stringify(i)))].map(i => JSON.parse(i));
  entities.departments = [...new Set(entities.departments.map(d => JSON.stringify(d)))].map(d => JSON.parse(d));

  return entities;
}

// Analyze sentiment
export function analyzeSentiment(query) {
  const lowerQuery = query.toLowerCase();
  const sentiment = {
    frustrated: false,
    urgent: false,
    confused: false,
    positive: false,
    intensity: 0 // 0-1 scale
  };

  let frustrationCount = 0;
  let urgentCount = 0;
  let confusedCount = 0;
  let positiveCount = 0;

  // Check frustration patterns
  for (const word of SENTIMENT_PATTERNS.frustrated) {
    if (lowerQuery.includes(word)) {
      sentiment.frustrated = true;
      frustrationCount++;
    }
  }

  // Check urgent patterns
  for (const word of SENTIMENT_PATTERNS.urgent) {
    if (lowerQuery.includes(word)) {
      sentiment.urgent = true;
      urgentCount++;
    }
  }

  // Check confusion patterns
  for (const word of SENTIMENT_PATTERNS.confused) {
    if (lowerQuery.includes(word)) {
      sentiment.confused = true;
      confusedCount++;
    }
  }

  // Check positive patterns
  for (const word of SENTIMENT_PATTERNS.positive) {
    if (lowerQuery.includes(word)) {
      sentiment.positive = true;
      positiveCount++;
    }
  }

  // Calculate intensity based on multiple indicators
  const totalIndicators = frustrationCount + urgentCount + confusedCount + positiveCount;
  sentiment.intensity = Math.min(totalIndicators / 3, 1); // Max intensity of 1

  return sentiment;
}

// Determine priority based on intent, entities, and sentiment
export function determinePriority(intent, entities, sentiment, query = '') {
  // Information requests are always low priority (no tickets)
  if (intent === INTENTS.INFORMATION_REQUEST) return 'low';

  // Password-related queries are always low priority (provide guides instead of tickets)
  const isPasswordQuery = query.toLowerCase().includes('password') || query.toLowerCase().includes('reset') ||
                         query.toLowerCase().includes('forgot') || query.toLowerCase().includes('login');
  if (isPasswordQuery) return 'low';

  // High priority conditions (very specific)
  if (sentiment.urgent) return 'high';
  if (intent === INTENTS.COMPLAINT) return 'high';
  if (entities.issues.some(issue => ['login', 'bluescreen', 'crash'].includes(issue.key))) return 'high';
  if (entities.departments.some(dept => ['accounting', 'hr'].includes(dept.key))) return 'high'; // Critical departments

  // Medium priority conditions
  if (intent === INTENTS.PROBLEM_REPORT && entities.software.length > 0) return 'medium';
  if (entities.issues.some(issue => ['error', 'slow', 'freeze'].includes(issue.key))) return 'medium';
  if (sentiment.frustrated && entities.issues.length > 0) return 'medium';

  // Low priority for everything else
  if (intent === INTENTS.HELP_REQUEST || intent === INTENTS.STATUS_INQUIRY) return 'low';
  if (intent === INTENTS.PROBLEM_REPORT && entities.software.length === 0 && entities.hardware.length === 0) return 'low';

  return 'low'; // Default to low priority to avoid over-creating tickets
}

// Generate intelligent response based on analysis
export function generateIntelligentResponse(intent, entities, sentiment, context = []) {
  const responses = {
    [INTENTS.PROBLEM_REPORT]: generateProblemResponse(entities, sentiment),
    [INTENTS.HELP_REQUEST]: generateHelpResponse(entities),
    [INTENTS.STATUS_INQUIRY]: generateStatusResponse(entities),
    [INTENTS.INFORMATION_REQUEST]: generateInformationResponse(entities),
    [INTENTS.COMPLAINT]: generateComplaintResponse(sentiment),
    [INTENTS.GRATITUDE]: generateGratitudeResponse(),
    [INTENTS.CLARIFICATION]: generateClarificationResponse(),
    [INTENTS.GREETING]: generateGreetingResponse(),
    [INTENTS.NON_IT]: generateNonITResponse()
  };

  return responses[intent] || "I'm here to help with IT support issues. What technical problem can I assist you with?";
}

// Response generators
function generateProblemResponse(entities, sentiment) {
  let response = '';

  // Handle frustration
  if (sentiment.frustrated) {
    response += "I understand this is frustrating. Let me help you resolve this quickly.\n\n";
  }

  // Handle urgency
  if (sentiment.urgent) {
    response += "🚨 **URGENT ISSUE DETECTED** - I'll create a high-priority ticket immediately.\n\n";
  }

  // Describe the problem based on entities
  if (entities.software.length > 0 || entities.hardware.length > 0 || entities.issues.length > 0) {
    response += "I see you're having trouble with: ";

    const allEntities = [...entities.software, ...entities.hardware, ...entities.issues];
    const entityNames = allEntities.map(e => e.name);
    response += entityNames.join(', ');

    if (sentiment.urgent) {
      response += "\n\nI'll escalate this to our IT team immediately for urgent resolution.";
    } else {
      response += "\n\nLet me check our knowledge base for solutions, or I can create a support ticket.";
    }
  } else {
    response += "Could you provide more details about the specific problem you're experiencing?";
  }

  return response;
}

function generateHelpResponse(entities) {
  if (entities.software.length > 0) {
    const software = entities.software[0];
    return `I'd be happy to help you with ${software.name}! Let me check our knowledge base for instructions, or I can guide you through the process.`;
  }

  return "I'd be happy to help! What specific task or process do you need assistance with?";
}

function generateStatusResponse(entities) {
  if (entities.software.length > 0) {
    const software = entities.software[0];
    return `Let me check the current status of ${software.name} for you.`;
  }

  return "Let me check the system status for you. What service or system are you inquiring about?";
}

function generateInformationResponse(entities) {
  if (entities.software.length > 0) {
    const software = entities.software[0];
    return `I'd be happy to provide information about ${software.name}. Let me check our knowledge base for details.`;
  }

  if (entities.hardware.length > 0) {
    const hardware = entities.hardware[0];
    return `I can provide information about ${hardware.name}. Let me look up the details for you.`;
  }

  return "I'd be happy to provide that information. Let me check our knowledge base for the details.";
}

function generateComplaintResponse(sentiment) {
  return "I apologize for the inconvenience this has caused. This sounds like a serious issue that needs immediate attention. I'll create a high-priority ticket and escalate this to our senior IT staff.";
}

function generateGratitudeResponse() {
  return "You're very welcome! I'm thrilled I could help resolve your IT issue. If you encounter any other technical problems in the future, don't hesitate to reach out - I'm here 24/7 to assist! 😊";
}

function generateClarificationResponse() {
  return "I apologize if my previous response wasn't clear. Could you please provide more details about what you're trying to accomplish or what specific part you'd like me to explain?";
}

function generateGreetingResponse() {
  return "👋 **Hello! Welcome to IT Support!** I'm your intelligent assistant ready to help resolve any technical issues. I can provide:\n\n💻 **Instant Solutions** for common problems\n🔧 **Step-by-step Guides** for troubleshooting\n🎫 **Expert Help** when you need it\n⚡ **Quick Fixes** for urgent issues\n\nWhat technical problem can I help you solve today? Let's get you back up and running! 🚀";
}

function generateNonITResponse() {
  return "I'm specialized in IT support and technical issues. While I'm not equipped to help with non-technical topics, I'd be happy to assist with any computer, software, or network problems you might have!";
}

// Enhanced context analysis
export function analyzeContext(messages = []) {
  const context = {
    currentTopic: null,
    previousSolutions: [],
    userExpertise: 'unknown',
    urgencyLevel: 'normal',
    department: null,
    lastHelpful: null
  };

  if (messages.length === 0) return context;

  // Analyze recent messages for patterns
  const recentMessages = messages.slice(-5); // Last 5 messages

  // Determine current topic
  const topics = [];
  recentMessages.forEach(msg => {
    const entities = extractEntities(msg.message || msg);
    topics.push(...entities.software, ...entities.hardware, ...entities.issues);
  });

  if (topics.length > 0) {
    context.currentTopic = topics[topics.length - 1]; // Most recent topic
  }

  // Determine urgency level
  const urgentMessages = recentMessages.filter(msg => {
    const sentiment = analyzeSentiment(msg.message || msg);
    return sentiment.urgent;
  });

  if (urgentMessages.length > 0) {
    context.urgencyLevel = 'high';
  }

  return context;
}

// Main analysis function that combines everything
export function analyzeQuery(query, context = []) {
  const intent = classifyIntent(query);
  const entities = extractEntities(query);
  const sentiment = analyzeSentiment(query);
  const priority = determinePriority(intent, entities, sentiment, query);
  const conversationContext = analyzeContext(context);

  return {
    intent,
    entities,
    sentiment,
    priority,
    context: conversationContext,
    response: generateIntelligentResponse(intent, entities, sentiment, context)
  };
}