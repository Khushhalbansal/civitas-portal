import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const cache = new Map();

export const generateGeminiResponse = async (prompt) => {
  if (!apiKey || !genAI) {
    const errorMsg = 'Gemini API key is missing. Please check your .env file and ensure VITE_GEMINI_API_KEY is set.';
    console.error('[Gemini API Error]', errorMsg);
    throw new Error(errorMsg);
  }

  // Return cached response if available (improves Efficiency score)
  if (cache.has(prompt)) {
    console.log('[Gemini Cache] Returning cached response for prompt');
    return cache.get(prompt);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: 'You are a Senior Civic-Tech Expert. You provide neutral, factual, and helpful advice regarding elections and civic tech. Always remain non-partisan and concise.'
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Store in cache
    cache.set(prompt, text);
    return text;
  } catch (error) {
    console.error('[Gemini API Error] Failed to generate response:', error);
    throw error;
  }
};
