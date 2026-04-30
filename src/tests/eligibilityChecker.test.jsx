import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EligibilityChecker } from '../features/eligibility';
import { MemoryRouter } from 'react-router-dom';

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

  it('should render age input field', () => {
    renderComponent();
    const ageInput = screen.getByLabelText(/age/i);
    expect(ageInput).toBeInTheDocument();
  });

  it('should render location dropdown with default Delhi', () => {
    renderComponent();
    const select = screen.getByDisplayValue('Delhi');
    expect(select).toBeInTheDocument();
  });

  it('should render Verify Eligibility button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /verify eligibility/i })).toBeInTheDocument();
  });

  it('should render language toggle button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /switch to hindi/i })).toBeInTheDocument();
  });

  it('should allow typing in age input', () => {
    renderComponent();
    const ageInput = screen.getByLabelText(/age/i);
    fireEvent.change(ageInput, { target: { value: '25' } });
    expect(ageInput.value).toBe('25');
  });

  it('should have proper form label associations', () => {
    renderComponent();
    const ageLabel = screen.getByText('Age');
    expect(ageLabel).toHaveAttribute('for', 'age-input');
    const locationLabel = screen.getByText('Location');
    expect(locationLabel).toHaveAttribute('for', 'location-input');
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

    it('should show alert if age is abc', () => {
      renderComponent();
      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: 'abc' } });
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(alertMock).toHaveBeenCalledWith('Please enter a valid numeric age.');
    });

    it('should show alert if age is 0', () => {
      renderComponent();
      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(alertMock).toHaveBeenCalledWith('Please enter a valid age between 1 and 120.');
    });

    it('should show alert if age is 121', () => {
      renderComponent();
      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '121' } });
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(alertMock).toHaveBeenCalledWith('Please enter a valid age between 1 and 120.');
    });

    it('should show eligible message for age exactly 18', () => {
      renderComponent();
      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '18' } });
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(screen.getByText('You are eligible to vote.')).toBeInTheDocument();
    });

    it('should show eligible message for age exactly 120', () => {
      renderComponent();
      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '120' } });
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(screen.getByText('You are eligible to vote.')).toBeInTheDocument();
    });

    it('should show ineligible message for age under 18', () => {
      renderComponent();
      const ageInput = screen.getByLabelText(/age/i);
      fireEvent.change(ageInput, { target: { value: '15' } });
      fireEvent.click(screen.getByRole('button', { name: /verify eligibility/i }));
      expect(screen.getByText(/You must be 18 or older to vote/i)).toBeInTheDocument();
    });

    it('should show hindi alerts when language is hindi', () => {
      renderComponent();
      // Switch to Hindi
      fireEvent.click(screen.getByRole('button', { name: /switch to hindi/i }));
      
      // Empty age
      fireEvent.click(screen.getByRole('button', { name: /सत्यापित करें/i }));
      expect(alertMock).toHaveBeenCalledWith('कृपया एक मान्य आयु दर्ज करें।');

      // Invalid age bounds
      const ageInput = screen.getByLabelText(/आयु/i);
      fireEvent.change(ageInput, { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: /सत्यापित करें/i }));
      expect(alertMock).toHaveBeenCalledWith('कृपया 1 और 120 के बीच एक मान्य आयु दर्ज करें।');
    });
  });

  describe('Interactions', () => {
    it('should change location on select', () => {
      renderComponent();
      const locationSelect = screen.getByLabelText(/location/i);
      fireEvent.change(locationSelect, { target: { value: 'Mumbai' } });
      expect(locationSelect.value).toBe('Mumbai');
    });

    it('should toggle language', () => {
      renderComponent();
      const toggleBtn = screen.getByRole('button', { name: /switch to hindi/i });
      fireEvent.click(toggleBtn);
      // After click, it should switch to Hindi
      expect(screen.getByText('पात्रता जांच')).toBeInTheDocument();
      const toggleBtnEn = screen.getByRole('button', { name: /अंग्रेजी में बदलें/i });
      fireEvent.click(toggleBtnEn);
      expect(screen.getByText('Voter Eligibility')).toBeInTheDocument();
    });
  });
});
