import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-load route-level components for optimal code splitting
const EligibilityChecker = React.lazy(() => import('./features/eligibility'));
const VotingProcess = React.lazy(() => import('./features/eligibility/VotingProcess'));
const ChatInterface = React.lazy(() => import('./features/chat'));

/**
 * Loading fallback displayed while lazy-loaded route components are fetched.
 */
const RouteFallback = () => (
  <div className="flex items-center justify-center py-20" role="status" aria-label="Loading page content">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-slate-200 border-t-[#004A99] rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Loading...</p>
    </div>
  </div>
);

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        isActive 
          ? 'bg-[#004A99] text-white shadow-md shadow-[#004A99]/20' 
          : 'text-slate-600 hover:text-[#004A99] hover:bg-slate-100'
      }`}
    >
      {children}
    </Link>
  );
};

const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#004A99]/20">
    {/* Skip-to-content link for keyboard/screen-reader users (WCAG 2.4.1) */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#004A99] focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
    >
      Skip to main content
    </a>

    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-white/90" role="banner">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* Government-grade shield icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-[#004A99] to-[#003366] rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[#004A99] font-bold text-xl tracking-tight leading-none">
                Civitas Portal
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">Government-Grade AI Assistant</p>
            </div>
          </div>
          <nav className="flex space-x-2" aria-label="Main navigation">
            <NavLink to="/">Eligibility</NavLink>
            <NavLink to="/process">Voting Process</NavLink>
            <NavLink to="/chat">AI Chat</NavLink>
          </nav>
        </div>
      </div>
    </header>
    
    <main id="main-content" className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full" role="main">
      {children}
    </main>
    
    <footer className="bg-white border-t border-slate-200 mt-auto" role="contentinfo">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded-md flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-500">TL</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">
              The Transparent Ledger
            </p>
          </div>
          <p className="text-sm text-slate-500">
            &copy; 2026 Civic-Tech Initiative. Secure & Encrypted.
          </p>
        </div>
      </div>
    </footer>
  </div>
);

const AppContent = () => {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<EligibilityChecker />} />
          <Route path="/process" element={<VotingProcess language="en" dynamicFaqAnswer="" />} />
          <Route path="/chat" element={
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#004A99]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#004A99]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">AI Assistant</h2>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                <ChatInterface aiMessage="<p>Hello! I am your <strong>non-partisan</strong> election assistant. How can I help you today?</p>" />
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
