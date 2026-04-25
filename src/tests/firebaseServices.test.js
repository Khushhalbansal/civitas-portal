import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase modules BEFORE importing the service
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: vi.fn(),
  signInAnonymously: vi.fn().mockResolvedValue({ user: { uid: 'anon-123', isAnonymous: true } }),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/firestore', () => {
  const mockSnapshot = { data: () => ({ count: 42 }) };
  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    addDoc: vi.fn().mockResolvedValue({ id: 'doc-1' }),
    getCountFromServer: vi.fn().mockResolvedValue(mockSnapshot),
    serverTimestamp: vi.fn(() => 'mock-ts'),
  };
});

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => ({})),
  logEvent: vi.fn(),
  isSupported: vi.fn().mockResolvedValue(true),
}));

describe('Firebase Integration Services', () => {
  describe('Firebase Auth', () => {
    it('should export auth, googleProvider, and signInAnon', async () => {
      const { auth, googleProvider, signInAnon } = await import('../services/firebase/firebaseConfig');
      expect(auth).toBeDefined();
      expect(googleProvider).toBeDefined();
      expect(signInAnon).toBeInstanceOf(Function);
    });

    it('signInAnon should call signInAnonymously', async () => {
      const { signInAnon } = await import('../services/firebase/firebaseConfig');
      const result = await signInAnon();
      expect(result).toBeDefined();
    });
  });

  describe('Firebase Analytics', () => {
    it('should export logAnalyticsEvent and logPageView', async () => {
      const { logAnalyticsEvent, logPageView } = await import('../services/firebase/firebaseConfig');
      expect(logAnalyticsEvent).toBeInstanceOf(Function);
      expect(logPageView).toBeInstanceOf(Function);
    });

    it('logAnalyticsEvent should not throw', async () => {
      const { logAnalyticsEvent } = await import('../services/firebase/firebaseConfig');
      expect(() => logAnalyticsEvent('test_event', { key: 'value' })).not.toThrow();
    });

    it('logPageView should not throw', async () => {
      const { logPageView } = await import('../services/firebase/firebaseConfig');
      expect(() => logPageView('/test', 'Test Page')).not.toThrow();
    });
  });

  describe('Firestore Interaction Service', () => {
    it('should export saveAnonymizedInteraction and getInteractionCount', async () => {
      const { saveAnonymizedInteraction, getInteractionCount } = await import('../services/firebase/interactionService');
      expect(saveAnonymizedInteraction).toBeInstanceOf(Function);
      expect(getInteractionCount).toBeInstanceOf(Function);
    });

    it('getInteractionCount should return a number', async () => {
      const { getInteractionCount } = await import('../services/firebase/interactionService');
      const count = await getInteractionCount();
      expect(typeof count).toBe('number');
    });

    it('saveAnonymizedInteraction should not throw', async () => {
      const { saveAnonymizedInteraction } = await import('../services/firebase/interactionService');
      await expect(saveAnonymizedInteraction('TEST', { foo: 'bar' })).resolves.not.toThrow();
    });
  });
});
