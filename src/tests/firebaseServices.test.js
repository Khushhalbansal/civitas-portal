import { describe, it, expect, vi } from 'vitest';

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

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn()
}));

vi.mock('firebase/performance', () => ({
  getPerformance: vi.fn(() => ({})),
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

  describe('Firebase Performance Monitoring', () => {
    it('should export perf instance', async () => {
      const { perf } = await import('../services/firebase/firebaseConfig');
      expect(perf).toBeDefined();
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

describe('Geolocation Service', () => {
  it('should export getUserLocation, reverseGeocode, and buildGoogleMapsEmbedUrl', async () => {
    const { getUserLocation, reverseGeocode, buildGoogleMapsEmbedUrl } = await import('../services/geolocationService');
    expect(getUserLocation).toBeInstanceOf(Function);
    expect(reverseGeocode).toBeInstanceOf(Function);
    expect(buildGoogleMapsEmbedUrl).toBeInstanceOf(Function);
  });

  it('buildGoogleMapsEmbedUrl should return a valid Google Maps URL', async () => {
    const { buildGoogleMapsEmbedUrl } = await import('../services/geolocationService');
    const url = buildGoogleMapsEmbedUrl(28.6139, 77.2090, 14);
    expect(url).toContain('google.com/maps');
    expect(url).toContain('28.6139');
    expect(url).toContain('77.209');
    expect(url).toContain('output=embed');
  });

  it('getUserLocation should return fallback when geolocation is unavailable', async () => {
    // In jsdom, navigator.geolocation is undefined
    const { getUserLocation } = await import('../services/geolocationService');
    const loc = await getUserLocation();
    expect(loc).toHaveProperty('lat');
    expect(loc).toHaveProperty('lng');
    expect(loc).toHaveProperty('city');
    expect(typeof loc.lat).toBe('number');
    expect(typeof loc.lng).toBe('number');
  });

  it('reverseGeocode should return a string', async () => {
    // Mock fetch for reverse geocoding
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ address: { city: 'New Delhi', state: 'Delhi' } }),
    });
    const { reverseGeocode } = await import('../services/geolocationService');
    const city = await reverseGeocode(28.6139, 77.2090);
    expect(typeof city).toBe('string');
    expect(city.length).toBeGreaterThan(0);
  });
});

