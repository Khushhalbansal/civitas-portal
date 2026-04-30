import { describe, it, expect } from 'vitest';
import { fetchMockElectionDates } from '../services/mockElectionService';

describe('mockElectionService', () => {
  it('should return mock dates for delhi', async () => {
    const data = await fetchMockElectionDates('Delhi');
    expect(data).toEqual({ nextElection: '2025-02-14', type: 'Assembly' });
  });

  it('should return mock dates for maharashtra', async () => {
    const data = await fetchMockElectionDates('Maharashtra');
    expect(data).toEqual({ nextElection: '2024-11-20', type: 'Assembly' });
  });

  it('should return default dates for unknown location', async () => {
    const data = await fetchMockElectionDates('Unknown');
    expect(data).toEqual({ nextElection: '2029-05-15', type: 'General' });
  });

  it('should reject if location is missing', async () => {
    await expect(fetchMockElectionDates()).rejects.toThrow('Location is required');
  });
});
