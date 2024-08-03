/**
 * @license MIT
 * @copyright Copyright (c) 2024, GoldFrite
 */

import { EventEmitter as EM } from 'events'

export default class EventEmitter<T extends EventMap<T> = DefaultEventMap> extends EM<T> {
  /**
   * Forward all events emitted by this EventEmitter to another EventEmitter.
   * @param target The target EventEmitter to forward events to (usually `this`).
   */
  forwardEvents<U extends EventMap<U>>(target: EventEmitter<T & U>) {
    const originalEmit = this.emit
    this.emit = (event, ...args) => {
      target.emit(event, ...args as any)
      return originalEmit.apply(this, [event, ...args])
    }
  }
}

type EventMap<T> = Record<keyof T, any[]> | DefaultEventMap
type DefaultEventMap = [never]
