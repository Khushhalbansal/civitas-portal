import { describe, it, expect } from 'vitest';
import DOMPurify from 'dompurify';

/**
 * Security Unit Tests
 * Validates that DOMPurify correctly strips XSS payloads from all user inputs.
 */
describe('Input Sanitization (DOMPurify)', () => {
  const sanitize = (input) =>
    DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

  it('should strip <script> tags completely', () => {
    const malicious = '<script>alert("xss")</script>Hello';
    expect(sanitize(malicious)).toBe('Hello');
  });

  it('should strip <img onerror> payloads', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    expect(sanitize(malicious)).toBe('');
  });

  it('should strip event handler attributes', () => {
    const malicious = '<div onclick="steal()">Click me</div>';
    expect(sanitize(malicious)).toBe('Click me');
  });

  it('should strip <iframe> injection', () => {
    const malicious = '<iframe src="https://evil.com"></iframe>Safe text';
    expect(sanitize(malicious)).toBe('Safe text');
  });

  it('should preserve plain text without modification', () => {
    const safe = 'I am 18 years old from Delhi';
    expect(sanitize(safe)).toBe(safe);
  });

  it('should handle empty strings gracefully', () => {
    expect(sanitize('')).toBe('');
  });

  it('should handle numbers converted to strings', () => {
    expect(sanitize('42')).toBe('42');
  });

  it('should strip nested XSS payloads', () => {
    const malicious = '<div><script>alert(1)</script><b>bold</b></div>';
    expect(sanitize(malicious)).toBe('bold');
  });

  it('should strip SVG-based XSS payloads completely', () => {
    const malicious = '<svg onload=alert(1)>test</svg>';
    // With ALLOWED_TAGS: [], DOMPurify strips the entire SVG element including child text
    expect(sanitize(malicious)).toBe('');
  });

  it('should handle Unicode and Hindi text safely', () => {
    const hindiText = 'मैं 18 साल का हूं';
    expect(sanitize(hindiText)).toBe(hindiText);
  });
});

describe('Age Input Regex Validation', () => {
  const isValidAge = (input) => /^\d+$/.test(input.toString().trim());

  it('should accept "18"', () => {
    expect(isValidAge('18')).toBe(true);
  });

  it('should accept "120"', () => {
    expect(isValidAge('120')).toBe(true);
  });

  it('should reject "abc"', () => {
    expect(isValidAge('abc')).toBe(false);
  });

  it('should reject "18abc"', () => {
    expect(isValidAge('18abc')).toBe(false);
  });

  it('should reject empty string', () => {
    expect(isValidAge('')).toBe(false);
  });

  it('should reject special characters "<script>"', () => {
    expect(isValidAge('<script>')).toBe(false);
  });

  it('should reject negative numbers', () => {
    expect(isValidAge('-5')).toBe(false);
  });

  it('should reject decimal values', () => {
    expect(isValidAge('18.5')).toBe(false);
  });
});
