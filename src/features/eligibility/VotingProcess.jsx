import React from 'react';
import DOMPurify from 'dompurify';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export const VotingProcess = ({ language, dynamicFaqAnswer = '' }) => {
  // Prevent XSS from LLM generated FAQ answers
  const sanitizedFaqAnswer = DOMPurify.sanitize(dynamicFaqAnswer);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="w-12 h-12 rounded-xl bg-[#004A99]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="space-y-4" aria-label="Map showing nearest polling station">
            <h3 className="font-semibold text-slate-800 text-lg">
              {language === 'hi' ? 'आपका मतदान केंद्र' : 'Your Polling Station'}
            </h3>
            <div className="w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative h-64">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 800,
                  center: [75.7873, 26.9124] // Jaipur City Center
                }}
                style={{ width: "100%", height: "100%" }}
              >
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#EAEAEC"
                        stroke="#D6D6DA"
                      />
                    ))
                  }
                </Geographies>
                <Marker coordinates={[75.7873, 26.9124]}>
                  <circle r={8} fill="#004A99" stroke="#fff" strokeWidth={2} />
                  <text
                    textAnchor="middle"
                    y={-15}
                    style={{ fontFamily: "system-ui", fill: "#004A99", fontSize: "14px", fontWeight: "bold" }}
                  >
                    Jaipur City Center
                  </text>
                </Marker>
              </ComposableMap>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {language === 'hi' ? 'अक्सर पूछे जाने वाले प्रश्न' : 'Frequently Asked Questions'}
            </h3>
            <ul className="space-y-4">
              <li className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong className="block text-slate-800 mb-1.5">{language === 'hi' ? 'मुझे क्या लाना चाहिए?' : 'What should I bring?'}</strong>
                <p className="text-slate-600 text-sm leading-relaxed">{language === 'hi' ? 'कृपया अपना वैध वोटर आईडी या स्वीकृत फोटो पहचान पत्र लाएं।' : 'Please bring your valid Voter ID or an approved photo identification.'}</p>
              </li>
              {/* Dynamic AI Answer with XSS Protection */}
              {dynamicFaqAnswer && (
                 <li className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                   <div className="flex items-center gap-2 mb-1.5">
                     <span className="flex h-2 w-2 rounded-full bg-[#004A99]"></span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VotingProcess);
