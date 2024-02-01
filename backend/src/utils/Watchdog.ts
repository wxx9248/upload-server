import { TIMEOUT_MS } from "/config.js";
import * as crypto from "crypto";

export type TimingGroupId = string;
export type HandlerId = string;
export type Handler = (timingGroup: TimingGroupInterface) => Promise<void>;

export interface HandlerInterface {
    id: HandlerId;
    handler: Handler;
}

export interface TimingGroupInterface {
    id: TimingGroupId;
    handlerMap: Map<HandlerId, HandlerInterface>;
    timeout?: NodeJS.Timeout;
}

export class Watchdog {
    #timingGroupMap: Map<TimingGroupId, TimingGroupInterface>;

    constructor() {
        this.#timingGroupMap = new Map();
    }

    registerTimingGroup(timingGroupId: TimingGroupId) {
        if (this.#timingGroupMap.has(timingGroupId)) {
            throw new Error("Timing group ID has already been registered");
        }

        this.#timingGroupMap.set(timingGroupId, {
            id: timingGroupId,
            handlerMap: new Map()
        });
    }

    unregisterTimingGroup(timingGroupId: TimingGroupId) {
        this.cancel(timingGroupId);
        this.#timingGroupMap.delete(timingGroupId);
    }

    registerHandler(timingGroupId: TimingGroupId, handler: Handler) {
        this.#timingGroupGuard(timingGroupId);
        const { handlerMap } = this.#timingGroupMap.get(timingGroupId)!;

        const handlerId = crypto.randomUUID();
        handlerMap.set(handlerId, {
            id: handlerId,
            handler: handler
        });
        return handlerId;
    }

    unregisterHandler(timingGroupId: TimingGroupId, handlerId: HandlerId) {
        this.#timingGroupGuard(timingGroupId);
        const { handlerMap } = this.#timingGroupMap.get(timingGroupId)!;
        Watchdog.#handlerGuard(handlerMap, handlerId);
        handlerMap.delete(handlerId);
    }

    start(timingGroupId: TimingGroupId) {
        this.#timingGroupGuard(timingGroupId);

        const timingGroup = this.#timingGroupMap.get(timingGroupId)!;
        timingGroup.timeout = setTimeout(() => {
            for (const handler of timingGroup.handlerMap.values()) {
                void handler.handler(timingGroup);
            }
            this.unregisterTimingGroup(timingGroupId);
        }, TIMEOUT_MS);
    }

    feed(timingGroupId: TimingGroupId) {
        this.cancel(timingGroupId);
        this.start(timingGroupId);
    }

    cancel(timingGroupId: TimingGroupId) {
        this.#timingGroupGuard(timingGroupId);

        const timingGroup = this.#timingGroupMap.get(timingGroupId)!;
        clearTimeout(timingGroup.timeout);
    }

    #timingGroupGuard(timingGroupId: TimingGroupId) {
        if (!this.#timingGroupMap.has(timingGroupId)) {
            throw new Error("Timing group ID not registered yet");
        }
    }

    static #handlerGuard(
        handlerMap: Map<HandlerId, HandlerInterface>,
        handlerId: HandlerId
    ) {
        if (!handlerMap.has(handlerId)) {
            throw new Error("Handler ID not registered yet");
        }
    }
}
