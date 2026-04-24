import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { generateGeminiResponse } from '../../services/geminiService';

export const ChatInterface = ({ aiMessage = '' }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: aiMessage }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = React.useCallback(async () => {
    if (!input.trim()) return;

    const userText = DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (!userText) {
      setInput('');
      return;
    }
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build a basic prompt. In a real app, you'd send the history as well.
      const prompt = `You are a non-partisan election assistant for a civic-tech portal. Answer the following question accurately and concisely: ${userText}`;
      const response = await generateGeminiResponse(prompt);
      
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      console.error('[ChatInterface] Error sending message:', err);
      setError(err.message || 'An error occurred while generating a response.');
      setMessages(prev => [...prev, { role: 'assistant', text: '<p class="text-rose-600">Sorry, I encountered an error. Please try again later.</p>' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="w-full flex flex-col h-full min-h-[400px]">
      <div 
        className="flex-grow space-y-4 overflow-y-auto max-h-[500px] p-2"
        aria-live="polite" 
        aria-atomic="true"
      >
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'assistant' ? (
              <div className="w-8 h-8 rounded-full bg-[#004A99] flex-shrink-0 flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center shadow-md">
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
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#004A99] flex-shrink-0 flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm max-w-[85%]">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-label="Ask a question about the election"
            placeholder="Ask a question about the election..." 
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004A99]/20 focus:border-[#004A99] shadow-sm text-sm disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#004A99] text-white rounded-lg hover:bg-[#003366] transition-colors disabled:opacity-50 disabled:hover:bg-[#004A99]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          AI responses may not be perfectly accurate. Verify official information.
        </p>
      </div>
    </div>
  );
};

export default React.memo(ChatInterface);
