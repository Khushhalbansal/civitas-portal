export const initialState = {
  eligibility: {
    isEligible: null,
    age: null,
    location: null,
    message: ''
  },
  language: 'en', // 'en' | 'hi'
  electionInfo: {
    dates: null,
    loading: false,
    error: null
  }
};

export const actionTypes = {
  SET_LANGUAGE: 'SET_LANGUAGE',
  CHECK_ELIGIBILITY: 'CHECK_ELIGIBILITY',
  FETCH_DATES_START: 'FETCH_DATES_START',
  FETCH_DATES_SUCCESS: 'FETCH_DATES_SUCCESS',
  FETCH_DATES_ERROR: 'FETCH_DATES_ERROR',
};

/**
 * Pure reducer function for Election State.
 * This ensures state transitions are 100% predictable and unit-testable.
 */
export const electionStateReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LANGUAGE:
      return { ...state, language: action.payload };
      
    case actionTypes.CHECK_ELIGIBILITY: {
      const { age, location } = action.payload;
      const isEligible = age >= 18;
      const lang = state.language;
      
      const message = isEligible 
        ? (lang === 'en' ? 'You are eligible to vote.' : 'आप वोट देने के पात्र हैं।')
        : (lang === 'en' ? 'You must be 18 or older to vote.' : 'वोट देने के लिए आपकी आयु 18 वर्ष या उससे अधिक होनी चाहिए।');

      return {
        ...state,
        eligibility: { isEligible, age, location, message }
      };
    }
      
    case actionTypes.FETCH_DATES_START:
      return { ...state, electionInfo: { ...state.electionInfo, loading: true, error: null } };
      
    case actionTypes.FETCH_DATES_SUCCESS:
      return { ...state, electionInfo: { loading: false, dates: action.payload, error: null } };
      
    case actionTypes.FETCH_DATES_ERROR:
      return { ...state, electionInfo: { loading: false, dates: null, error: action.payload } };
      
    default:
      return state;
  }
};
