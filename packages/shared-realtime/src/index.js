// @gameby/shared-realtime
import { EventEmitter } from 'events';
export function createBus(){ return new EventEmitter(); }
