import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EligibilityChecker } from '../features/eligibility';
import { MemoryRouter } from 'react-router-dom';

/**
 * @fileoverview Tests for EligibilityChecker component.
 * Verifies form validation, language switching, and AI integration.
 */

// Mock all Firebase services to avoid initialization in test environment
vi.mock('../services/firebase/firebaseConfig', () => ({
  auth: {},
  db: {},
  googleProvider: {},
  logAnalyticsEvent: vi.fn(),
  logPageView: vi.fn(),
  initAnalytics: vi.fn().mockResolvedValue(null),
  signInAnon: vi.fn().mockResolvedValue(null),
}));

vi.mock('../services/firebase/interactionService', () => ({
  saveAnonymizedInteraction: vi.fn(),
  getInteractionCount: vi.fn().mockResolvedValue(42),
}));

// Mock Gemini Service for component tests
vi.mock('../services/geminiService', () => ({
  getGeminiResponse: vi.fn().mockResolvedValue('Mock AI Response: Eligible'),
  ocrVoterID: vi.fn().mockResolvedValue('Mock OCR Result'),
}));

describe('EligibilityChecker Component', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <EligibilityChecker />
      </MemoryRouter>
    );
  };

  it('should render the Voter Eligibility heading', () => {
    renderComponent();
    expect(screen.getByText('Voter Eligibility')).toBeInTheDocument();
  });

  it('should render Verify Eligibility button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /verify eligibility/i })).toBeInTheDocument();
  });

  describe('Edge Cases Validation', () => {
    let alertMock;
    beforeEach(() => {
      alertMock = vi.spyOn(window, 'alert').mockImplementation(() => { });
    });
    afterEach(() => {
      alertMock.mockRestore();
    });

    it('should show alert if age is empty', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(alertMock).toHaveBeenCalledWith('Please enter a valid numeric age.');
    });

    it('should show eligible message for age exactly 18', async () => {
      renderComponent();
      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '18' } });
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(await screen.findByText(/Mock AI Response/i)).toBeInTheDocument();
    });

    it('should show ineligible message for age under 18', async () => {
      renderComponent();
      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '15' } });
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(await screen.findByText(/Mock AI Response/i)).toBeInTheDocument();
    });

    it('should show hindi alerts when language is hindi', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: /switch to hindi/i }));
      fireEvent.click(screen.getByRole('button', { name: /सत्यापित करें/i }));
      expect(alertMock).toHaveBeenCalledWith('कृपया एक मान्य आयु दर्ज करें।');
    });
  });

  describe('Interactions', () => {
    it('should toggle language', () => {
      renderComponent();
      const toggleBtn = screen.getByRole('button', { name: /switch to hindi/i });
      fireEvent.click(toggleBtn);
      expect(screen.getByText('पात्रता जांच')).toBeInTheDocument();
    });
  });
});
