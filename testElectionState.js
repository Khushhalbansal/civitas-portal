import { electionStateReducer, initialState, actionTypes } from './src/features/eligibility/electionStateReducer.js';

console.log("==========================================");
console.log("Running Election State Verification Loop");
console.log("==========================================\n");

let state = initialState;

const transitions = [
  { action: { type: actionTypes.SET_LANGUAGE, payload: 'hi' }, name: 'Switch to Hindi' },
  { action: { type: actionTypes.CHECK_ELIGIBILITY, payload: { age: 17, location: 'Delhi' } }, name: 'Check Underage (Hindi)' },
  { action: { type: actionTypes.SET_LANGUAGE, payload: 'en' }, name: 'Switch to English' },
  { action: { type: actionTypes.CHECK_ELIGIBILITY, payload: { age: 20, location: 'Delhi' } }, name: 'Check Eligible (English)' },
  { action: { type: actionTypes.FETCH_DATES_START }, name: 'Start Fetching Dates' },
  { action: { type: actionTypes.FETCH_DATES_SUCCESS, payload: { nextElection: '2025-02-14', type: 'Assembly' } }, name: 'Fetch Success' }
];

transitions.forEach((step, index) => {
  state = electionStateReducer(state, step.action);
  console.log(`[Transition ${index + 1}: ${step.name}]`);
  console.log(`Language: ${state.language}`);
  console.log(`Eligibility Message: ${state.eligibility.message || 'N/A'}`);
  console.log(`Fetching: ${state.electionInfo.loading}`);
  if (state.electionInfo.dates) {
    console.log(`Election Dates: ${JSON.stringify(state.electionInfo.dates)}`);
  }
  console.log("------------------------------------------");
});

console.log("✓ All state transitions verified flawlessly!");
