import React, { useState, useCallback, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { getGeminiResponse } from '../../services/geminiService';
import { logAnalyticsEvent } from '../../services/firebase/firebaseConfig';

/**
 * ChatInterface Component
 * Provides an AI-powered conversational interface for civic assistance.
 * Includes voice recognition support (Bilingual: English/Hindi) for accessibility.
 * Implements strict sanitization and ARIA landmarks for security and compliance.
 */
export const ChatInterface = ({ aiMessage = '' }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: aiMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /**
   * Handles sending messages to Gemini AI.
   * Sanitizes input and manages loading/error states.
   */
  const handleSend = useCallback(async (textOverride) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userText = DOMPurify.sanitize(textToSend.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (!userText) {
      setInput('');
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build a basic prompt for the election assistant
      const prompt = `Act as a non-partisan election assistant for Civitas Portal. Answer this query accurately and concisely: ${userText}`;
      
      // Use the resilient Gemini service (with local fallback)
      const response = await getGeminiResponse(prompt, messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })));
      
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      logAnalyticsEvent('ai_chat_message', { status: 'success' });
    } catch (err) {
      console.error('[ChatInterface] Error sending message:', err);
      setError(err.message || 'An error occurred while generating a response.');
      setMessages(prev => [...prev, { role: 'assistant', text: '<p class="text-rose-600">Sorry, I encountered an error. Please try again later.</p>' }]);
      logAnalyticsEvent('ai_chat_message', { status: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  /**
   * Toggles the voice recognition system.
   * Supports English and Hindi via Web Speech API.
   */
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Default to Indian English, works well for Hindi too
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      // Auto-send if it's a clear command
      if (transcript.length > 5) {
        handleSend(transcript);
      }
    };

    recognition.start();
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="w-full flex flex-col h-full min-h-[400px]" role="region" aria-label="Election Assistant Chat">
      <div 
        ref={scrollRef}
        className="flex-grow space-y-4 overflow-y-auto max-h-[500px] p-2 scroll-smooth"
        aria-live="polite" 
        aria-atomic="false"
      >
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
            {msg.role === 'assistant' ? (
              <div className="w-8 h-8 rounded-full bg-[#004A99] flex-shrink-0 flex items-center justify-center shadow-md" aria-hidden="true">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center shadow-md" aria-hidden="true">
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className={`border rounded-2xl px-5 py-3.5 shadow-sm max-w-[85%] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#004A99] text-white border-[#004A99] rounded-tr-sm' 
                : 'bg-white border-slate-200 text-slate-700 rounded-tl-sm prose prose-sm prose-blue'
            }`}>
              {msg.role === 'user' ? (
                <span>{msg.text}</span>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.text) }} />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 animate-pulse" role="status" aria-label="AI is typing">
            <div className="w-8 h-8 rounded-full bg-[#004A99] flex-shrink-0 flex items-center justify-center shadow-md" aria-hidden="true">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm max-w-[85%]">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#004A99]/40 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#004A99]/40 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full bg-[#004A99]/40 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs" role="alert">
          <strong>Security Notice:</strong> {error}
        </div>
      )}

      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="relative flex items-center gap-2">
          <button 
            onClick={toggleListening}
            aria-label={isListening ? "Stop listening" : "Start voice recognition"}
            className={`p-3 rounded-xl transition-all shadow-sm ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <div className="relative flex-grow">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Ask a question about the election"
              placeholder={isListening ? "Listening..." : "Ask a question about the election..."} 
              className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99] shadow-sm text-sm disabled:opacity-50"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#004A99] text-white rounded-lg hover:bg-[#003366] transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 px-1">
          <p className="text-[10px] text-slate-400">
            * AI verification should be cross-referenced with official data.
          </p>
          <div className="flex gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Online"></span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bilingual Support active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatInterface);
