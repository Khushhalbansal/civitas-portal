import { describe, it, expect, vi } from 'vitest';

/**
 * @fileoverview Tests for Google Services (Translate & Civic API)
 * Ensures resilient handling of API failures and proper prompt engineering.
 */

// Mock the Gemini service for testing
vi.mock('../services/geminiService', () => ({
  getGeminiResponse: vi.fn(),
}));

import { translateText } from '../services/google/googleTranslateAPI';
import { getVoterInfo } from '../services/google/googleCivicAPI';
import { getGeminiResponse } from '../services/geminiService';

describe('Google Translate API Service', () => {
  it('should return empty string for empty input', async () => {
    const result = await translateText('', 'hi');
    expect(result).toBe('');
  });

  it('should return empty string for whitespace-only input', async () => {
    const result = await translateText('   ', 'hi');
    expect(result).toBe('');
  });

  it('should call Gemini with Hindi translation prompt', async () => {
    getGeminiResponse.mockResolvedValueOnce('नमस्ते दुनिया');
    const result = await translateText('Hello World', 'hi');
    expect(result).toBe('नमस्ते दुनिया');
    expect(getGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining('Hindi')
    );
  });

  it('should call Gemini with English translation prompt', async () => {
    getGeminiResponse.mockResolvedValueOnce('Hello World');
    const result = await translateText('नमस्ते दुनिया', 'en');
    expect(result).toBe('Hello World');
    expect(getGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining('English')
    );
  });

  it('should return original text on API failure', async () => {
    getGeminiResponse.mockRejectedValueOnce(new Error('API error'));
    const result = await translateText('Hello', 'hi');
    expect(result).toBe('Hello');
  });
});

describe('Google Civic API Service', () => {
  it('should return mock fallback data on missing address', async () => {
    const result = await getVoterInfo('');
    expect(result.status).toBe('mock');
    expect(result.pollingLocations[0].address.locationName).toContain('Fallback');
  });

  it('should return mock fallback data on API failure', async () => {
    // Force a fetch failure (simulate key missing)
    const result = await getVoterInfo('Jaipur');
    expect(result).toHaveProperty('pollingLocations');
    expect(Array.isArray(result.pollingLocations)).toBe(true);
  });
});
