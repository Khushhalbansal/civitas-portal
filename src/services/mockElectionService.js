export const fetchMockElectionDates = async (location) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!location) {
        reject(new Error("Location is required"));
      }
      const mockDb = {
        "delhi": { nextElection: "2025-02-14", type: "Assembly" },
        "maharashtra": { nextElection: "2024-11-20", type: "Assembly" },
        "default": { nextElection: "2029-05-15", type: "General" }
      };
      
      const key = location.toLowerCase();
      resolve(mockDb[key] || mockDb["default"]);
    }, 500); // simulate 500ms network delay
  });
};
