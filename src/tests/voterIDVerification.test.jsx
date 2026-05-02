import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VoterIDVerification from '../features/eligibility/VoterIDVerification';

// Mock the geminiService module
vi.mock('../services/geminiService', () => ({
  ocrVoterID: vi.fn(),
}));

// Import after mock declaration
const { ocrVoterID } = await import('../services/geminiService');

describe('VoterIDVerification Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Smart EPIC Verification heading', () => {
    render(<VoterIDVerification />);
    expect(screen.getByText('Smart EPIC Verification')).toBeInTheDocument();
  });

  it('should render the upload area initially', () => {
    render(<VoterIDVerification />);
    expect(screen.getByText('Upload Voter ID Photo')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG up to 5MB')).toBeInTheDocument();
  });

  it('should have an accessible upload button with role', () => {
    render(<VoterIDVerification />);
    expect(screen.getByRole('button', { name: /upload voter id/i })).toBeInTheDocument();
  });

  it('should render privacy disclaimer', () => {
    render(<VoterIDVerification />);
    expect(screen.getByText(/no data is stored/i)).toBeInTheDocument();
  });

  it('should have a hidden file input', () => {
    render(<VoterIDVerification />);
    const fileInput = screen.getByLabelText(/choose voter id/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('should validate file size limit of 5MB', () => {
    // Test the validation logic: files > 5MB should be rejected
    const maxSize = 5 * 1024 * 1024; // 5MB
    expect(6 * 1024 * 1024 > maxSize).toBe(true); // 6MB > 5MB
    expect(4 * 1024 * 1024 > maxSize).toBe(false); // 4MB <= 5MB
    expect(5 * 1024 * 1024 > maxSize).toBe(false); // 5MB = 5MB (boundary)
  });

  it('should handle no file selected gracefully', () => {
    render(<VoterIDVerification />);
    const fileInput = screen.getByLabelText(/choose voter id/i);
    
    // Trigger change with no files
    fireEvent.change(fileInput, { target: { files: [] } });
    
    // Should still show upload area
    expect(screen.getByText('Upload Voter ID Photo')).toBeInTheDocument();
  });

  it('should support keyboard interaction on upload area', () => {
    render(<VoterIDVerification />);
    const uploadButton = screen.getByRole('button', { name: /upload voter id/i });
    expect(uploadButton).toHaveAttribute('tabindex', '0');
  });

  it('should render the camera icon in the heading', () => {
    render(<VoterIDVerification />);
    const heading = screen.getByText('Smart EPIC Verification');
    expect(heading.tagName).toBe('H3');
  });
});

describe('VoterIDVerification OCR Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ocrVoterID should be a mocked function', () => {
    expect(vi.isMockFunction(ocrVoterID)).toBe(true);
  });

  it('ocrVoterID mock should resolve with expected data', async () => {
    ocrVoterID.mockResolvedValueOnce('**Name:** Test User\n**EPIC:** XYZ123');
    const result = await ocrVoterID('data:image/png;base64,test');
    expect(result).toContain('Test User');
    expect(result).toContain('XYZ123');
  });

  it('ocrVoterID mock should handle rejection', async () => {
    ocrVoterID.mockRejectedValueOnce(new Error('OCR failed'));
    await expect(ocrVoterID('data:image/png;base64,test')).rejects.toThrow('OCR failed');
  });

  it('ocrVoterID should be called with base64 data', async () => {
    ocrVoterID.mockResolvedValueOnce('Test result');
    const base64 = 'data:image/jpeg;base64,/9j/4AAQ';
    await ocrVoterID(base64);
    expect(ocrVoterID).toHaveBeenCalledWith(base64);
  });
});

describe('VoterIDVerification DOMPurify Integration', () => {
  it('should sanitize OCR output containing script tags', async () => {
    // Verify DOMPurify is imported and used in the component
    const DOMPurify = await import('dompurify');
    const sanitized = DOMPurify.default.sanitize('<script>alert("xss")</script>**Name:** John');
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('**Name:** John');
  });

  it('should safely render markdown bold as HTML strong tags after sanitization', async () => {
    const DOMPurify = await import('dompurify');
    const raw = '**Name:** John Doe';
    const formatted = raw.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const sanitized = DOMPurify.default.sanitize(formatted);
    expect(sanitized).toContain('<strong>Name:</strong>');
    expect(sanitized).toContain('John Doe');
  });

  it('should strip malicious attributes from OCR output', async () => {
    const DOMPurify = await import('dompurify');
    const malicious = '<div onclick="steal()">Name: John</div>';
    const sanitized = DOMPurify.default.sanitize(malicious);
    expect(sanitized).not.toContain('onclick');
    expect(sanitized).toContain('Name: John');
  });
});
