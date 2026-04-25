import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EligibilityChecker } from '../features/eligibility';
import { MemoryRouter } from 'react-router-dom';

// Mock firebase to avoid initialization in test environment
vi.mock('../services/firebase/firebaseConfig', () => ({
  auth: {},
  db: {},
  logAnalyticsEvent: vi.fn(),
}));

vi.mock('../services/firebase/interactionService', () => ({
  saveAnonymizedInteraction: vi.fn(),
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
      alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
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
  });
});
