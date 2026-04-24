import React, { useState } from 'react';
import { useElectionState } from './useElectionState';
import DOMPurify from 'dompurify';

export const EligibilityChecker = () => {
  const { state, checkEligibility, setLanguage } = useElectionState();
  const [ageInput, setAgeInput] = useState('');
  const [locationInput, setLocationInput] = useState('Delhi'); // Default location

  const handleVerify = React.useCallback(() => {
    const cleanAgeStr = DOMPurify.sanitize(ageInput.toString().trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    const cleanLocation = DOMPurify.sanitize(locationInput.toString(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    
    // Bulletproof validation: Check if age contains only digits and is not empty
    if (!cleanAgeStr || !/^\d+$/.test(cleanAgeStr)) {
      alert(state.language === 'hi' ? 'कृपया एक मान्य आयु दर्ज करें।' : 'Please enter a valid numeric age.');
      return;
    }

    const age = parseInt(cleanAgeStr, 10);
    // Strict Validation Logic: Ensure age is a number between 1 and 120
    if (age < 1 || age > 120) {
      alert(state.language === 'hi' ? 'कृपया 1 और 120 के बीच एक मान्य आयु दर्ज करें।' : 'Please enter a valid age between 1 and 120.');
      return;
    }
    checkEligibility(age, cleanLocation);
  }, [ageInput, locationInput, checkEligibility, state.language]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-[#004A99]">
              {state.language === 'hi' ? 'पात्रता जांच' : 'Voter Eligibility'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {state.language === 'hi' ? 'जांचें कि क्या आप मतदान करने के योग्य हैं' : 'Verify your eligibility to vote in the upcoming election'}
            </p>
          </div>
          <button 
            onClick={() => setLanguage(state.language === 'en' ? 'hi' : 'en')}
            aria-label={state.language === 'en' ? 'Switch to Hindi' : 'अंग्रेजी में बदलें'}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#004A99] transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            {state.language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>
        
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="age-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
                {state.language === 'hi' ? 'आयु' : 'Age'}
              </label>
              <div className="relative">
                <input 
                  id="age-input"
                  type="number" 
                  value={ageInput} 
                  onChange={(e) => setAgeInput(e.target.value)} 
                  min="1" 
                  max="120"
                  placeholder={state.language === 'hi' ? 'अपनी आयु दर्ज करें' : 'Enter your age'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#004A99] focus:ring-2 focus:ring-[#004A99]/20 transition-all outline-none text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location-input" className="block text-sm font-semibold text-slate-700 mb-1.5">
                {state.language === 'hi' ? 'स्थान' : 'Location'}
              </label>
              <div className="relative">
                <select
                  id="location-input"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#004A99] focus:ring-2 focus:ring-[#004A99]/20 transition-all outline-none text-slate-800 bg-slate-50 focus:bg-white appearance-none"
                >
                  <option value="Delhi">Delhi</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleVerify}
            aria-label={state.language === 'hi' ? 'पात्रता सत्यापित करें' : 'Verify Eligibility'}
            className="w-full py-3.5 px-4 bg-[#004A99] hover:bg-[#003366] text-white rounded-xl font-semibold shadow-md shadow-[#004A99]/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            {state.language === 'hi' ? 'सत्यापित करें' : 'Verify Eligibility'}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {state.eligibility.message && (
        <div 
          className={`p-6 rounded-2xl border flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm ${
            state.eligibility.message.toLowerCase().includes('eligible') && !state.eligibility.message.toLowerCase().includes('not') && !state.eligibility.message.toLowerCase().includes('पात्र नहीं')
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`} 
          aria-live="polite"
        >
          <div className={`mt-0.5 rounded-full p-1.5 ${
            state.eligibility.message.toLowerCase().includes('eligible') && !state.eligibility.message.toLowerCase().includes('not') && !state.eligibility.message.toLowerCase().includes('पात्र नहीं')
              ? 'bg-emerald-200 text-emerald-700' 
              : 'bg-rose-200 text-rose-700'
          }`}>
            {state.eligibility.message.toLowerCase().includes('eligible') && !state.eligibility.message.toLowerCase().includes('not') && !state.eligibility.message.toLowerCase().includes('पात्र नहीं') ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">
              {state.language === 'hi' ? 'परिणाम' : 'Eligibility Result'}
            </h3>
            <p className="font-medium text-opacity-90 leading-relaxed">
              {state.eligibility.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EligibilityChecker);
