import { useReducer, useCallback } from 'react';
import { electionStateReducer, initialState, actionTypes } from './electionStateReducer';
import { fetchMockElectionDates } from '../../services/mockElectionService';
import { saveAnonymizedInteraction } from '../../services/firebase/interactionService';

/**
 * Custom Hook: ElectionStateController
 * Manages age/location checks, multilingual states, and election fetching.
 */
export const useElectionState = () => {
  const [state, dispatch] = useReducer(electionStateReducer, initialState);

  const setLanguage = useCallback((lang) => {
    dispatch({ type: actionTypes.SET_LANGUAGE, payload: lang });
    document.documentElement.lang = lang;
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
    
    // Log the interaction, explicitly omitting PII (age and location)
    const isEligible = age >= 18;
    saveAnonymizedInteraction('ELIGIBILITY_CHECK', { result: isEligible ? 'Eligible' : 'Ineligible' });
  }, []);

  const fetchElectionDates = useCallback(async (location) => {
    dispatch({ type: actionTypes.FETCH_DATES_START });
    try {
      const data = await fetchMockElectionDates(location);
      dispatch({ type: actionTypes.FETCH_DATES_SUCCESS, payload: data });
    } catch (err) {
      dispatch({ type: actionTypes.FETCH_DATES_ERROR, payload: err.message });
    }
  }, []);

  return {
    state,
    setLanguage,
    checkEligibility,
    fetchElectionDates
  };
};
