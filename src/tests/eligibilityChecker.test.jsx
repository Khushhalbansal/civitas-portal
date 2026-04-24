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
});
