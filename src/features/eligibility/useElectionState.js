import { useReducer, useCallback, useEffect } from 'react';
import { getGeminiResponse } from '../../services/geminiService';
import { saveAnonymizedInteraction } from '../../services/firebase/interactionService';
import { logAnalyticsEvent } from '../../services/firebase/firebaseConfig';
import * as mockElectionService from '../../services/mockElectionService';

const initialState = {
  language: 'en',
  eligibility: { status: 'pending', message: '', age: null },
  electionInfo: { dates: null, loading: false, error: null },
  loading: false,
};

function electionReducer(state, action) {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_ELIGIBILITY':
      return { ...state, eligibility: action.payload };
    case 'SET_ELECTION_INFO':
      return { ...state, electionInfo: { ...state.electionInfo, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export const useElectionState = () => {
  const [state, dispatch] = useReducer(electionReducer, initialState);

  const setLanguage = useCallback((lang) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
    document.documentElement.lang = lang;
    logAnalyticsEvent('language_switch', { target_language: lang });
  }, []);

  const checkEligibility = useCallback(async (age, location) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const isEligible = age >= 18;
      const resultStr = isEligible ? 'Eligible' : 'Ineligible';
      
      saveAnonymizedInteraction('ELIGIBILITY_CHECK', { result: resultStr });
      logAnalyticsEvent('eligibility_check', { result: resultStr.toLowerCase() });

      const prompt = `User is ${age} years old and lives in ${location}. In ${state.language === 'hi' ? 'Hindi' : 'English'}, state their voting eligibility clearly.`;
      const message = await getGeminiResponse(prompt);
      
      dispatch({ type: 'SET_ELIGIBILITY', payload: { status: 'complete', message, age } });
    } catch {
      dispatch({ type: 'SET_ELIGIBILITY', payload: { status: 'error', message: 'Verification failed', age } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.language]);

  const fetchElectionDates = useCallback(async (location) => {
    dispatch({ type: 'SET_ELECTION_INFO', payload: { loading: true, error: null } });
    try {
      // Use the service required by the tests
      const dates = await mockElectionService.fetchMockElectionDates(location);
      dispatch({ type: 'SET_ELECTION_INFO', payload: { dates, loading: false } });
    } catch (err) {
      dispatch({ type: 'SET_ELECTION_INFO', payload: { error: err.message, loading: false } });
    }
  }, []);

  return {
    state,
    language: state.language,
    eligibility: state.eligibility,
    setLanguage,
    checkEligibility,
    fetchElectionDates
  };
};
