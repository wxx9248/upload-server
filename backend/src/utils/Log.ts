import { RUNTIME_MODE } from "/config.js";
import pino, { LogDescriptor } from "pino";
import pinoPretty from "pino-pretty";

export interface LogMixinObject extends LogDescriptor {
    context?: string;
}

function messageFormatter(l: LogDescriptor, messageKey: string) {
    const log = l as LogMixinObject;
    const messageComponents: string[] = [];

    if (log.context) {
        messageComponents.push(`[${log.context}]`);
    }

    messageComponents.push(log[messageKey]);
    return messageComponents.join(" ");
}

export const logger = pino(
    pinoPretty({
        colorize: true,
        colorizeObjects: true,
        messageFormat: messageFormatter,
        translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l o",
        hideObject: true
    })
);

switch (RUNTIME_MODE) {
    case "development":
        logger.level = "debug";
        break;
    case "production":
        logger.level = "info";
        break;
}
