import { describe, it, expect } from 'vitest';
import { electionStateReducer, initialState, actionTypes } from '../features/eligibility/electionStateReducer';

describe('electionStateReducer', () => {
  // ─── Eligibility Edge Cases ───────────────────────────────────────────

  it('should return initial state for unknown action', () => {
    const result = electionStateReducer(initialState, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('should mark age exactly 18 as ELIGIBLE', () => {
    const result = electionStateReducer(initialState, {
      type: actionTypes.CHECK_ELIGIBILITY,
      payload: { age: 18, location: 'Delhi' },
    });
    expect(result.eligibility.isEligible).toBe(true);
    expect(result.eligibility.message).toBe('You are eligible to vote.');
  });

  it('should mark age 17 as NOT eligible', () => {
    const result = electionStateReducer(initialState, {
      type: actionTypes.CHECK_ELIGIBILITY,
      payload: { age: 17, location: 'Delhi' },
    });
    expect(result.eligibility.isEligible).toBe(false);
    expect(result.eligibility.message).toBe('You must be 18 or older to vote.');
  });

  it('should mark age 120 as ELIGIBLE (upper boundary)', () => {
    const result = electionStateReducer(initialState, {
      type: actionTypes.CHECK_ELIGIBILITY,
      payload: { age: 120, location: 'Mumbai' },
    });
    expect(result.eligibility.isEligible).toBe(true);
  });

  it('should mark age 1 as NOT eligible (lower boundary)', () => {
    const result = electionStateReducer(initialState, {
      type: actionTypes.CHECK_ELIGIBILITY,
      payload: { age: 1, location: 'Delhi' },
    });
    expect(result.eligibility.isEligible).toBe(false);
  });

  // ─── Hindi Language Support ───────────────────────────────────────────

  it('should return Hindi message when language is "hi" and eligible', () => {
    const hindiState = { ...initialState, language: 'hi' };
    const result = electionStateReducer(hindiState, {
      type: actionTypes.CHECK_ELIGIBILITY,
      payload: { age: 25, location: 'Delhi' },
    });
    expect(result.eligibility.message).toBe('आप वोट देने के पात्र हैं।');
  });

  it('should return Hindi message when language is "hi" and NOT eligible', () => {
    const hindiState = { ...initialState, language: 'hi' };
    const result = electionStateReducer(hindiState, {
      type: actionTypes.CHECK_ELIGIBILITY,
      payload: { age: 10, location: 'Delhi' },
    });
    expect(result.eligibility.message).toBe('वोट देने के लिए आपकी आयु 18 वर्ष या उससे अधिक होनी चाहिए।');
  });

  // ─── Language Toggle ──────────────────────────────────────────────────

  it('should toggle language from "en" to "hi"', () => {
    const result = electionStateReducer(initialState, {
      type: actionTypes.SET_LANGUAGE,
      payload: 'hi',
    });
    expect(result.language).toBe('hi');
  });

  it('should preserve eligibility data when changing language', () => {
    const stateWithResult = electionStateReducer(initialState, {
      type: actionTypes.CHECK_ELIGIBILITY,
      payload: { age: 20, location: 'Delhi' },
    });
    const result = electionStateReducer(stateWithResult, {
      type: actionTypes.SET_LANGUAGE,
      payload: 'hi',
    });
    expect(result.eligibility.isEligible).toBe(true);
    expect(result.language).toBe('hi');
  });

  // ─── Election Date Fetching ───────────────────────────────────────────

  it('should set loading state on FETCH_DATES_START', () => {
    const result = electionStateReducer(initialState, {
      type: actionTypes.FETCH_DATES_START,
    });
    expect(result.electionInfo.loading).toBe(true);
    expect(result.electionInfo.error).toBe(null);
  });

  it('should store dates on FETCH_DATES_SUCCESS', () => {
    const mockDates = { nextElection: '2026-11-03' };
    const result = electionStateReducer(initialState, {
      type: actionTypes.FETCH_DATES_SUCCESS,
      payload: mockDates,
    });
    expect(result.electionInfo.loading).toBe(false);
    expect(result.electionInfo.dates).toEqual(mockDates);
  });

  it('should store error on FETCH_DATES_ERROR', () => {
    const result = electionStateReducer(initialState, {
      type: actionTypes.FETCH_DATES_ERROR,
      payload: 'Network failure',
    });
    expect(result.electionInfo.loading).toBe(false);
    expect(result.electionInfo.error).toBe('Network failure');
  });
});
