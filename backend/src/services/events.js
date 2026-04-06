import { EventEmitter } from "events";

// Shared in-process event bus.
// proxy.js emits "transaction" when a payment is verified.
// earnings.js SSE connections subscribe to get real-time pushes.
const bus = new EventEmitter();
bus.setMaxListeners(100); // allow many concurrent SSE clients

export default bus;
