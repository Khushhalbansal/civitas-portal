import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLocalFallbackAnswer } from "./aiFallbackData";

/**
 * @fileoverview Gemini AI Service
 * Handles multimodal interactions with Google Gemini 2.0 Flash.
 * Includes OCR capabilities and a resilient fallback mechanism.
 * @version 2.0.0
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates a non-partisan response to user queries about elections.
 * Includes a resilient fallback to local knowledge if the API fails.
 * 
 * @param {string} prompt - The user's question or message.
 * @param {Array<{role: string, parts: Array<{text: string}>}>} history - Chat history for context.
 * @returns {Promise<string>} The AI's response or a local fallback answer.
 */
export const getGeminiResponse = async (prompt, history = []) => {
  try {
    // Return local fallback if API key is missing (Development/CI safety)
    if (!API_KEY) {
      console.warn('[Gemini] API Key missing, using local fallback.');
      return getLocalFallbackAnswer(prompt);
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.1, // High deterministic response for factual accuracy
        topP: 0.8,
        topK: 40,
      }
    });

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[Gemini Service Error]', error);
    // AI Resilience: Return local factual answer if API is down
    return getLocalFallbackAnswer(prompt);
  }
};

/**
 * Performs multimodal OCR on a voter ID (EPIC) card image.
 * Extracts key details while maintaining a Zero-PII policy.
 * 
 * @param {string} base64Image - The image data in base64 format.
 * @returns {Promise<string>} Extracted information or a clear error message.
 * @throws {Error} If OCR fails and no fallback is possible.
 */
export const ocrVoterID = async (base64Image) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Clean base64 string
    const base64Data = base64Image.split(',')[1] || base64Image;

    const prompt = `
      Act as a secure voter ID verification assistant. 
      Analyze this Voter ID (EPIC) image and extract the following information:
      1. Name
      2. Father's/Husband's Name
      3. Date of Birth/Age
      4. EPIC Number
      
      Formatting: Use bold markdown for labels. If any field is unreadable, mark it as 'Unreadable'.
      Security: Do not store this data. This is for real-time verification only.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[Gemini OCR Error]', error);
    throw new Error('Failed to extract information from the image. Please ensure the photo is clear.', { cause: error });
  }
};
