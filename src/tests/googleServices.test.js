import { describe, it, expect, vi } from 'vitest';

// Mock the Gemini service for testing
vi.mock('../services/geminiService', () => ({
  generateGeminiResponse: vi.fn(),
}));

import { translateText } from '../services/google/googleTranslateAPI';
import { fetchVoterInfo } from '../services/google/googleCivicAPI';
import { generateGeminiResponse } from '../services/geminiService';

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
    generateGeminiResponse.mockResolvedValueOnce('नमस्ते दुनिया');
    const result = await translateText('Hello World', 'hi');
    expect(result).toBe('नमस्ते दुनिया');
    expect(generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining('Hindi')
    );
  });

  it('should call Gemini with English translation prompt', async () => {
    generateGeminiResponse.mockResolvedValueOnce('Hello World');
    const result = await translateText('नमस्ते दुनिया', 'en');
    expect(result).toBe('Hello World');
    expect(generateGeminiResponse).toHaveBeenCalledWith(
      expect.stringContaining('English')
    );
  });

  it('should return original text on API failure', async () => {
    generateGeminiResponse.mockRejectedValueOnce(new Error('API error'));
    const result = await translateText('Hello', 'hi');
    expect(result).toBe('Hello');
  });
});

describe('Google Civic API Service', () => {
  it('should throw error for empty location', async () => {
    await expect(fetchVoterInfo('')).rejects.toThrow('Location is required');
  });

  it('should return structured data for valid location', async () => {
    generateGeminiResponse.mockResolvedValueOnce(JSON.stringify({
      pollingStationName: 'Jaipur Municipal Station',
      address: '123 Main Road, Jaipur',
      timings: '7:00 AM - 6:00 PM',
      documentsRequired: ['Voter ID', 'Aadhaar'],
      helplineNumber: '1950',
      registrationDeadline: '2026-10-01'
    }));

    const result = await fetchVoterInfo('Jaipur');
    expect(result).toHaveProperty('pollingStationName');
    expect(result).toHaveProperty('timings');
    expect(result).toHaveProperty('documentsRequired');
    expect(Array.isArray(result.documentsRequired)).toBe(true);
  });

  it('should return fallback data on API failure', async () => {
    generateGeminiResponse.mockRejectedValueOnce(new Error('Network error'));
    const result = await fetchVoterInfo('Delhi');
    expect(result.helplineNumber).toBe('1950 (National Voter Helpline)');
    expect(result.pollingStationName).toContain('Delhi');
  });
});
