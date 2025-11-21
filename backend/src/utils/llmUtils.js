// src/utils/llmUtils.js
// Local LLM integration using transformers.js for intelligent response generation

import { pipeline } from "@xenova/transformers";

// Global variables for model management
let generator = null;
let isModelLoading = false;
let modelLoaded = false;

// Initialize the text generation model (Phi-2)
const initializeModel = async () => {
  if (modelLoaded || isModelLoading) {
    return generator;
  }

  try {
    isModelLoading = true;
    console.log("🤖 Initializing Phi-2 LLM model (this may take a moment on first run)...");

    // Use Phi-2 for high-quality text generation
    generator = await pipeline("text-generation", "Xenova/phi-2");

    modelLoaded = true;
    isModelLoading = false;
    console.log("✅ Phi-2 LLM model ready for text generation");

    return generator;
  } catch (error) {
    console.error("❌ Failed to load Phi-2 model:", error.message);
    isModelLoading = false;

    // Fallback to a smaller model if Phi-2 fails
    try {
      console.log("🔄 Trying fallback model (GPT-2)...");
      generator = await pipeline("text-generation", "Xenova/gpt2");
      modelLoaded = true;
      console.log("✅ GPT-2 fallback model loaded");
      return generator;
    } catch (fallbackError) {
      console.error("❌ Fallback model also failed:", fallbackError.message);
      throw new Error("Unable to load any text generation model");
    }
  }
};

// Generate intelligent response using LLM
export const generateLLMResponse = async (query, kbContext = [], conversationHistory = []) => {
  try {
    const model = await initializeModel();

    // Prepare context from knowledge base
    const kbText = kbContext.length > 0
      ? kbContext.map(doc => `${doc.title}: ${doc.text}`).join('\n\n').substring(0, 2000) // Limit context length
      : "No specific knowledge base information available.";

    // Prepare conversation history
    const historyText = conversationHistory.length > 0
      ? conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.message}`).join('\n').substring(0, 1000)
      : "";

    // Create system prompt for IT support assistant
    const systemPrompt = `You are a helpful and professional IT support assistant. Your role is to help users with technical issues, provide clear step-by-step solutions, and suggest creating support tickets when appropriate.

Guidelines:
- Be friendly but professional
- Provide specific, actionable steps when possible
- If you don't have enough information, ask for clarification
- For complex issues, suggest creating a support ticket
- Keep responses clear and easy to follow
- Use technical terms appropriately but explain them if needed

Knowledge Base Information:
${kbText}

${historyText ? `Previous Conversation:\n${historyText}\n` : ''}

User Question: ${query}

Please provide a helpful response based on the knowledge base information and conversation context:`;

    // Generate response
    console.log("🤖 Generating LLM response...");
    const startTime = Date.now();

    const output = await model(systemPrompt, {
      max_new_tokens: 300, // Limit response length
      temperature: 0.7,   // Balance creativity and coherence
      do_sample: true,
      top_p: 0.9,
      repetition_penalty: 1.1,
      pad_token_id: model.tokenizer.eos_token_id,
    });

    const endTime = Date.now();
    console.log(`✅ LLM response generated in ${endTime - startTime}ms`);

    // Extract the generated text (remove the prompt)
    let generatedText = output[0].generated_text;

    // Remove the system prompt from the response
    const responseStart = generatedText.indexOf("Please provide a helpful response");
    if (responseStart !== -1) {
      const responseMarker = generatedText.indexOf(":", responseStart);
      if (responseMarker !== -1) {
        generatedText = generatedText.substring(responseMarker + 1).trim();
      }
    }

    // Clean up the response
    generatedText = cleanResponse(generatedText);

    return {
      response: generatedText,
      model: modelLoaded ? "phi-2" : "gpt2",
      generationTime: endTime - startTime,
      confidence: "llm-generated"
    };

  } catch (error) {
    console.error("❌ LLM generation failed:", error.message);
    throw error;
  }
};

// Clean and format the LLM response
const cleanResponse = (text) => {
  // Remove any remaining prompt artifacts
  text = text.replace(/^Please provide a helpful response.*?:/s, '').trim();

  // Remove excessive newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  // Ensure proper formatting
  if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
    text += '.';
  }

  return text;
};

// Check if LLM is available
export const isLLMAvailable = () => {
  return modelLoaded && !isModelLoading;
};

// Get model status
export const getModelStatus = () => {
  return {
    loaded: modelLoaded,
    loading: isModelLoading,
    model: modelLoaded ? "phi-2" : null
  };
};