import { getGeminiResponse } from '../geminiService';

/**
 * Google Translate Integration via Gemini API
 * Uses Gemini as a translation engine for dynamic civic-tech content.
 * This approach avoids a separate Google Cloud Translate API key while still
 * leveraging Google's AI infrastructure for accurate multilingual output.
 *
 * @param {string} text - The text to translate.
 * @param {string} targetLanguage - Target language code ('hi' for Hindi, 'en' for English).
 * @returns {Promise<string>} - The translated text.
 */
export const translateText = async (text, targetLanguage) => {
  if (!text || !text.trim()) return '';

  const langName = targetLanguage === 'hi' ? 'Hindi' : 'English';

  try {
    const prompt = `Translate the following text to ${langName}. Return ONLY the translated text, nothing else:\n\n"${text}"`;
    const translated = await getGeminiResponse(prompt);
    return translated.trim().replace(/^["']|["']$/g, ''); // Strip wrapper quotes if any
  } catch (error) {
    console.error('[Google Translate] Translation failed, returning original text:', error);
    return text; // Graceful fallback: return original text on failure
  }
};
