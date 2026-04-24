# Civitas Portal

**Vertical:** Civic-Tech AI Architect

## Overview
Civitas Portal is a highly secure, accessible, and non-partisan AI assistant designed to help citizens verify their voter eligibility, locate polling stations, and receive neutral election information — all powered by Google's AI and cloud infrastructure.

## Tech Stack
- **Frontend Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 (Civitas Sans Theme) + Google Fonts (Inter)
- **AI Engine:** Google Gemini 2.0 Flash
- **Backend/Analytics:** Firebase Hosting, Auth, Firestore & Analytics (GA4)
- **Mapping:** `react-simple-maps` with TopoJSON
- **Testing:** Vitest + @testing-library/react + jsdom (47 tests)

---

## Hackathon Evaluation Criteria

### 1. Code Quality
- **Modular Architecture:** Feature-based folder structure (`src/features/chat`, `src/features/eligibility`) with reusable services (`src/services/`), context providers (`src/context/`), and shared components (`src/components/`).
- **Pure State Management:** UI logic is fully decoupled from state via pure reducers (`electionStateReducer.js`) and custom hooks (`useElectionState.js`).
- **Error Boundary:** A production-grade `ErrorBoundary` component wraps the entire app to prevent white screens on unhandled errors.
- **Route-Level Code Splitting:** All route components are lazy-loaded with `React.lazy()` and `Suspense`, producing 8 optimized chunks.
- **Zero Dead Code:** All Vite boilerplate files (react.svg, vite.svg, App.css scaffold) have been removed. No placeholder code remains.
- **JSDoc Documentation:** All services and hooks include comprehensive JSDoc with `@param`, `@returns`, and `@description` annotations.

### 2. Security
**Zero-PII Architecture & Defense-in-Depth**
- **Zero-PII Analytics:** No Personally Identifiable Information (PII) — such as exact age, location, or identity — is ever stored or transmitted to analytics. Firestore logs only anonymized boolean interaction states (e.g., `ELIGIBILITY_CHECK: Eligible`). Google Analytics 4 events contain no PII parameters.
- **Bulletproof XSS Protection:** All user inputs are sanitized via `DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })` before processing. All AI-generated HTML output is sanitized before rendering via `dangerouslySetInnerHTML`.
- **Content Security Policy:** A strict CSP meta tag restricts all script, style, font, and connection sources to whitelisted origins only.
- **Regex-First Validation:** Age inputs are validated against `/^\d+$/` before `parseInt`, preventing type coercion and injection attacks.
- **API Key Security:** All keys are loaded via `import.meta.env` and `.env` is excluded from version control via `.gitignore`.

### 3. Efficiency
- **Route-Level Code Splitting:** `React.lazy()` + `Suspense` splits the app into 8 separate chunks, each loaded on demand.
- **React Memoization:** All route components use `React.memo()`, and event handlers use `React.useCallback()` to prevent unnecessary re-renders.
- **Vendor Chunk Splitting:** Libraries are split into `vendor-react` (222 KB), `vendor-maps` (120 KB), and `vendor-firebase` (323 KB) for optimal caching.
- **Build Performance:** Production build completes in under 1 second with zero warnings.

### 4. Testing
**47 automated tests across 5 test suites, all passing:**
```
✓ src/tests/electionStateReducer.test.js   (12 tests) — reducer logic + edge cases
✓ src/tests/sanitization.test.js           (18 tests) — XSS vectors + regex validation
✓ src/tests/googleServices.test.js          (7 tests) — Translate API + Civic API
✓ src/tests/eligibilityChecker.test.jsx     (7 tests) — component rendering + a11y
✓ src/tests/errorBoundary.test.jsx          (3 tests) — crash recovery + fallback UI
```
**Test Coverage:**
- **Unit Tests:** Pure reducer logic, XSS sanitization, input validation
- **Integration Tests:** Google Translate and Civic API service behavior, error fallbacks
- **Component Tests:** EligibilityChecker rendering, form labels, ARIA compliance
- **Error Tests:** ErrorBoundary crash recovery

Run tests: `npm test`

### 5. Accessibility (WCAG 2.1 AA)
- **Skip-to-Content Link:** A hidden link appears on Tab focus, allowing keyboard users to bypass navigation (WCAG 2.4.1).
- **Dynamic `lang` Attribute:** Hindi toggle updates `document.documentElement.lang`, ensuring screen readers switch phonetic engines.
- **ARIA Landmarks:** `role="banner"`, `role="main"`, `role="contentinfo"`, and `aria-label="Main navigation"` on all structural elements.
- **ARIA Labels:** All icon-only buttons have explicit `aria-label` attributes.
- **`aria-hidden`:** Decorative SVG icons are marked `aria-hidden="true"`.
- **Form Labels:** Strict `<label htmlFor="..">` associations on all inputs.
- **Live Regions:** `aria-live="polite"` on eligibility results and chat messages.
- **High-Contrast Design:** WCAG AA compliant color contrast.

### 6. Google Services Integration
| Service | Implementation | File |
|---|---|---|
| **Google Gemini 2.0 Flash** | AI Chat engine with non-partisan system instruction | `src/services/geminiService.js` |
| **Google Gemini (Translate)** | Dynamic text translation via Gemini API | `src/services/google/googleTranslateAPI.js` |
| **Google Gemini (Civic Info)** | Polling station data via Gemini API | `src/services/google/googleCivicAPI.js` |
| **Firebase Auth** | Full authentication context (signup/login/logout) | `src/context/AuthContext.jsx` |
| **Firebase Firestore** | Anonymized interaction telemetry (Zero-PII) | `src/services/firebase/interactionService.js` |
| **Firebase Analytics (GA4)** | Event tracking: eligibility_check, ai_chat_message, language_switch, civic_info_loaded | `src/services/firebase/firebaseConfig.js` |
| **Firebase Hosting** | Production deployment | https://voting-e2099.web.app |
| **Google Fonts** | Inter typeface with preconnect optimization | `index.html` |

---

## Key Assumptions & Constraints
- **AI Non-Partisanship:** The Gemini AI is anchored via a strict System Instruction to behave exclusively as a *Senior Civic-Tech Expert*. It provides neutral, factual, and strictly non-partisan civic data.
- **Mock Mapping Data:** The polling station map uses global TopoJSON centered around Jaipur City Center for demonstration. Civic information is retrieved dynamically via Gemini.
- **Free-Tier API:** The Gemini API operates on a free-tier quota. Rate limits (429) may temporarily appear under heavy testing; responses resume automatically.

---

## Getting Started
```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Run all 47 tests
npm test

# Build for production
npm run build

# Deploy to Firebase
npx firebase deploy --only hosting
```
