import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { fetchVoterInfo } from '../../services/google/googleCivicAPI';
import { logAnalyticsEvent } from '../../services/firebase/firebaseConfig';
import { getInteractionCount } from '../../services/firebase/interactionService';
import { getUserLocation, reverseGeocode, buildGoogleMapsEmbedUrl } from '../../services/geolocationService';
import { DocumentUpload } from './DocumentUpload';

/** Default fallback for Jaipur */
const DEFAULT_COORDS = { lat: 26.9124, lng: 75.7873 };
const DEFAULT_MAP_URL = buildGoogleMapsEmbedUrl(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);

/**
 * VotingProcess Component
 * Detects user's location via browser Geolocation API, displays their area
 * on Google Maps, and fetches location-specific civic information via Gemini.
 *
 * @param {{ language: string, dynamicFaqAnswer?: string }} props
 */
export const VotingProcess = ({ language, dynamicFaqAnswer = '' }) => {
  const [civicInfo, setCivicInfo] = useState(null);
  const [loadingCivic, setLoadingCivic] = useState(true);
  const [citizenCount, setCitizenCount] = useState(0);
  const [mapUrl, setMapUrl] = useState(DEFAULT_MAP_URL);
  const [detectedCity, setDetectedCity] = useState('');
  const [locationStatus, setLocationStatus] = useState('detecting'); // 'detecting' | 'granted' | 'denied'

  const sanitizedFaqAnswer = DOMPurify.sanitize(dynamicFaqAnswer);

  const detectLocation = async () => {
    setLocationStatus('detecting');
    const loc = await getUserLocation();

    // Build the dynamic Google Maps URL centered on user's position
    setMapUrl(buildGoogleMapsEmbedUrl(loc.lat, loc.lng));

    // Reverse geocode to get city name
    let city = loc.city;
    if (!city) {
      city = await reverseGeocode(loc.lat, loc.lng);
    }

    setDetectedCity(city);
    setLocationStatus(city === 'Jaipur' && loc.lat === DEFAULT_COORDS.lat ? 'denied' : 'granted');

    logAnalyticsEvent('location_detected', { city: city, status: 'success' });

    // Step 2: Fetch civic info for the detected city
    setLoadingCivic(true);
    try {
      const info = await fetchVoterInfo(city);
      setCivicInfo(info);
      logAnalyticsEvent('civic_info_loaded', { location: city, status: 'success' });
    } catch (error) {
      console.error('[VotingProcess] Failed to load civic info:', error);
      logAnalyticsEvent('civic_info_loaded', { location: city, status: 'error' });
    } finally {
      setLoadingCivic(false);
    }
  };

  // Step 1: Default to Jaipur on mount
  useEffect(() => {
    let cancelled = false;
    const loadDefault = async () => {
      setLoadingCivic(true);
      try {
        const info = await fetchVoterInfo('Jaipur');
        if (!cancelled) setCivicInfo(info);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoadingCivic(false);
      }
    };
    loadDefault();
    return () => { cancelled = true; };
  }, []);

  // Read interaction count from Firestore
  useEffect(() => {
    getInteractionCount().then((count) => setCitizenCount(count));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="w-12 h-12 rounded-xl bg-[#004A99]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 id="voting-process-heading" className="text-2xl font-bold text-[#004A99]">
              {language === 'hi' ? 'मतदान प्रक्रिया और मतदान केंद्र' : 'Voting Process & Polling Station'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {language === 'hi' ? 'निकटतम मतदान केंद्र और निर्देश खोजें' : 'Find your nearest polling station and instructions'}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Community Stats — Firestore READ display */}
          {citizenCount > 0 && (
            <div className="bg-[#004A99]/5 border border-[#004A99]/10 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#004A99]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#004A99]">
                  {citizenCount.toLocaleString()} {language === 'hi' ? 'नागरिकों ने जांच की' : 'citizens checked eligibility'}
                </p>
                <p className="text-xs text-slate-500">{language === 'hi' ? 'फायरस्टोर लाइव डेटा' : 'Live data from Firestore'}</p>
              </div>
            </div>
          )}

          {/* Location Status & Trigger Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              {detectedCity ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className={`flex h-2 w-2 rounded-full ${locationStatus === 'granted' ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
                  <span className="text-slate-600 font-medium">
                    {locationStatus === 'granted'
                      ? (language === 'hi' ? `स्थान पता चला: ${detectedCity}` : `Location detected: ${detectedCity}`)
                      : (language === 'hi' ? `डिफ़ॉल्ट स्थान: ${detectedCity}` : `Default location: ${detectedCity}`)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-slate-300" aria-hidden="true" />
                  {language === 'hi' ? 'डिफ़ॉल्ट स्थान: जयपुर' : 'Default location: Jaipur'}
                </div>
              )}
            </div>
            
            <button
              onClick={detectLocation}
              disabled={locationStatus === 'detecting'}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#004A99] text-[#004A99] rounded-lg text-sm font-semibold hover:bg-[#004A99] hover:text-white transition-colors disabled:opacity-50"
            >
              {locationStatus === 'detecting' ? (
                <>
                  <div className="w-3 h-3 border-2 border-[#004A99] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  {language === 'hi' ? 'पता लगाया जा रहा है...' : 'Detecting...'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {language === 'hi' ? 'मेरा स्थान खोजें' : 'Detect My Location'}
                </>
              )}
            </button>
          </div>

          {/* Google Maps Embed — dynamically centered on user's location */}
          <section className="space-y-4" aria-label="Map showing nearest polling station">
            <h3 className="font-semibold text-slate-800 text-lg">
              {language === 'hi' ? 'आपका मतदान केंद्र' : 'Your Polling Station'}
            </h3>
            <div className="w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative h-72">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Google Maps - ${detectedCity || 'Polling Station'}`}
                aria-label={`Google Maps showing polling station near ${detectedCity || 'your location'}`}
              />
            </div>
          </section>

          {/* Civic Information Panel — Powered by Gemini AI */}
          {civicInfo && !loadingCivic && (
            <section className="space-y-3 pt-6 border-t border-slate-100" aria-label="Polling station details">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'hi' ? 'मतदान केंद्र विवरण' : 'Polling Station Details'}
                {detectedCity && <span className="text-sm font-normal text-slate-500">— {detectedCity}</span>}
              </h3>
              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100">
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">{language === 'hi' ? 'स्थान' : 'Station'}</span>
                  <span className="text-sm font-semibold text-slate-800">{civicInfo.pollingStationName}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">{language === 'hi' ? 'समय' : 'Timings'}</span>
                  <span className="text-sm font-semibold text-slate-800">{civicInfo.timings}</span>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">{language === 'hi' ? 'हेल्पलाइन' : 'Helpline'}</span>
                  <span className="text-sm font-semibold text-[#004A99]">{civicInfo.helplineNumber}</span>
                </div>
                <div className="p-4">
                  <span className="text-sm font-medium text-slate-500 block mb-2">{language === 'hi' ? 'आवश्यक दस्तावेज़' : 'Required Documents'}</span>
                  <div className="flex flex-wrap gap-2">
                    {civicInfo.documentsRequired?.map((doc, i) => (
                      <span key={i} className="text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium">{doc}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {loadingCivic && (
            <div className="flex items-center justify-center py-6 text-slate-400 text-sm gap-2" role="status">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-[#004A99] rounded-full animate-spin" aria-hidden="true" />
              {language === 'hi' ? 'मतदान केंद्र की जानकारी लोड हो रही है...' : 'Loading polling station details...'}
            </div>
          )}

          {/* FAQ Section */}
          <section className="space-y-4 pt-6 border-t border-slate-100" aria-label="Frequently asked questions">
            <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
            </h3>
            <ul className="space-y-4" role="list">
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong className="block text-slate-800 mb-1.5">{language === 'hi' ? 'मुझे क्या लाना चाहिए?' : 'What should I bring?'}</strong>
                <p className="text-slate-600 text-sm leading-relaxed">{language === 'hi' ? 'कृपया अपना वैध वोटर आईडी या स्वीकृत फोटो पहचान पत्र लाएं।' : 'Please bring your valid Voter ID or an approved photo identification.'}</p>
              </li>
              {dynamicFaqAnswer && (
                <li className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-[#004A99]" aria-hidden="true"></span>
                    <strong className="text-[#004A99] text-sm uppercase tracking-wider font-bold">
                      {language === 'hi' ? 'एआई उत्तर:' : 'AI Answer:'}
                    </strong>
                  </div>
                  <div
                    className="text-slate-700 text-sm leading-relaxed prose prose-sm prose-blue max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizedFaqAnswer }}
                  />
                </li>
              )}
            </ul>
          </section>

          {/* Document Upload for Firebase Storage integration */}
          <DocumentUpload language={language} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(VotingProcess);
