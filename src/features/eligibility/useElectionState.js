import { useReducer, useCallback } from 'react';
import { electionStateReducer, initialState, actionTypes } from './electionStateReducer';
import { fetchMockElectionDates } from '../../services/mockElectionService';
import { saveAnonymizedInteraction } from '../../services/firebase/interactionService';
import { logAnalyticsEvent } from '../../services/firebase/firebaseConfig';

/**
 * Custom Hook: useElectionState
 * Manages voter eligibility checks, multilingual states, and election date fetching.
 * Integrates Firebase Analytics (GA4) for anonymized event tracking.
 * @returns {{ state: Object, setLanguage: Function, checkEligibility: Function, fetchElectionDates: Function }}
 */
export const useElectionState = () => {
  const [state, dispatch] = useReducer(electionStateReducer, initialState);

  const setLanguage = useCallback((lang) => {
    dispatch({ type: actionTypes.SET_LANGUAGE, payload: lang });
    document.documentElement.lang = lang;

    // Track language switch in Google Analytics 4
    logAnalyticsEvent('language_switch', { target_language: lang });

    // Re-trigger eligibility check if we already checked, to translate the message
    if (state.eligibility.age !== null) {
      dispatch({ 
        type: actionTypes.CHECK_ELIGIBILITY, 
        payload: { age: state.eligibility.age, location: state.eligibility.location } 
      });
    }
  }, [state.eligibility.age, state.eligibility.location]);

  const checkEligibility = useCallback((age, location) => {
    dispatch({ type: actionTypes.CHECK_ELIGIBILITY, payload: { age, location } });
    
    const isEligible = age >= 18;

    // Log to Firestore (Zero-PII)
    saveAnonymizedInteraction('ELIGIBILITY_CHECK', { result: isEligible ? 'Eligible' : 'Ineligible' });

    // Log to Google Analytics 4 (Zero-PII — no age or location sent)
    logAnalyticsEvent('eligibility_check', { result: isEligible ? 'eligible' : 'ineligible' });
  }, []);

  const fetchElectionDates = useCallback(async (location) => {
    dispatch({ type: actionTypes.FETCH_DATES_START });
    try {
      const data = await fetchMockElectionDates(location);
      dispatch({ type: actionTypes.FETCH_DATES_SUCCESS, payload: data });
      logAnalyticsEvent('election_dates_fetched', { status: 'success' });
    } catch (err) {
      dispatch({ type: actionTypes.FETCH_DATES_ERROR, payload: err.message });
      logAnalyticsEvent('election_dates_fetched', { status: 'error' });
    }
  }, []);

  return {
    state,
    setLanguage,
    checkEligibility,
    fetchElectionDates
  };
};
