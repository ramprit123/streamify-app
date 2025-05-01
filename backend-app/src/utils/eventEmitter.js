import EventEmitter from 'events';

// Create a singleton event emitter instance
const systemEvents = new EventEmitter();

// Event types
export const EVENT_TYPES = {
  USER_ACTION: 'user_action',
  SYSTEM_ACTION: 'system_action',
  ERROR: 'error',
};

// Event emitter methods
export const emitSystemEvent = (eventType, payload) => {
  systemEvents.emit(eventType, payload);
};

// Event listeners
// systemEvents.on(EVENT_TYPES.USER_ACTION, (payload) => {
//   console.log("User action event:");
// });

// systemEvents.on(EVENT_TYPES.SYSTEM_ACTION, (payload) => {
//   console.log("System action event:");
// });

// systemEvents.on(EVENT_TYPES.ERROR, (payload) => {
//   console.error("Error event:");
// });

export default systemEvents;