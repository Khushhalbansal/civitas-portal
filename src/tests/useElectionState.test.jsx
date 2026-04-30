import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useElectionState } from '../features/eligibility/useElectionState';
import * as mockElectionService from '../services/mockElectionService';
import { saveAnonymizedInteraction } from '../services/firebase/interactionService';
import { logAnalyticsEvent } from '../services/firebase/firebaseConfig';

vi.mock('../services/firebase/interactionService', () => ({
  saveAnonymizedInteraction: vi.fn(),
}));

vi.mock('../services/firebase/firebaseConfig', () => ({
  logAnalyticsEvent: vi.fn(),
  auth: {},
  db: {},
  googleProvider: {},
  initAnalytics: vi.fn().mockResolvedValue(null),
  signInAnon: vi.fn().mockResolvedValue(null),
}));

vi.mock('../services/mockElectionService', () => ({
  fetchMockElectionDates: vi.fn(),
}));

describe('useElectionState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should change language and trigger eligibility re-check if age is set', () => {
    const { result } = renderHook(() => useElectionState());

    act(() => {
      result.current.checkEligibility(25, 'Delhi');
    });

    expect(result.current.state.eligibility.age).toBe(25);
    
    // Assert interactions (Lines 38-41)
    expect(saveAnonymizedInteraction).toHaveBeenCalledWith('ELIGIBILITY_CHECK', { result: 'Eligible' });
    expect(logAnalyticsEvent).toHaveBeenCalledWith('eligibility_check', { result: 'eligible' });

    act(() => {
      result.current.setLanguage('hi');
    });

    expect(result.current.state.language).toBe('hi');
    expect(document.documentElement.lang).toBe('hi');
    expect(logAnalyticsEvent).toHaveBeenCalledWith('language_switch', { target_language: 'hi' });
  });

  it('should log ineligible when under 18', () => {
    const { result } = renderHook(() => useElectionState());

    act(() => {
      result.current.checkEligibility(15, 'Delhi');
    });

    expect(saveAnonymizedInteraction).toHaveBeenCalledWith('ELIGIBILITY_CHECK', { result: 'Ineligible' });
    expect(logAnalyticsEvent).toHaveBeenCalledWith('eligibility_check', { result: 'ineligible' });
  });

  it('should not re-check eligibility when setting language if age is null', () => {
    const { result } = renderHook(() => useElectionState());

    act(() => {
      result.current.setLanguage('hi');
    });

    expect(result.current.state.eligibility.age).toBeNull();
  });

  it('should fetch election dates successfully', async () => {
    mockElectionService.fetchMockElectionDates.mockResolvedValueOnce({ nextElection: '2025-02-14', type: 'Assembly' });
    const { result } = renderHook(() => useElectionState());

    await act(async () => {
      await result.current.fetchElectionDates('Delhi');
    });

    expect(result.current.state.electionInfo.dates).toEqual({ nextElection: '2025-02-14', type: 'Assembly' });
    expect(result.current.state.electionInfo.loading).toBe(false);
  });

  it('should handle fetch election dates error', async () => {
    mockElectionService.fetchMockElectionDates.mockRejectedValueOnce(new Error('Network Error'));
    const { result } = renderHook(() => useElectionState());

    await act(async () => {
      await result.current.fetchElectionDates('Delhi');
    });

    expect(result.current.state.electionInfo.error).toBe('Network Error');
    expect(result.current.state.electionInfo.loading).toBe(false);
  });
});
