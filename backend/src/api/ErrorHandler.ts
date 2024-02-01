import { PutResponseSchema } from "/api/schemas/Upload.js";
import {
    HTTP_BAD_REQUEST,
    HTTP_INTERNAL_SERVER_ERROR
} from "/utils/Constants.js";
import { HTTPError } from "/utils/HTTPError.js";
import { logger } from "/utils/Log.js";
import { Response } from "express";
import { ZodError } from "zod";

export function handleError(response: Response, e: unknown) {
    logger.error({ context: "ErrorHandler" }, (e as Error).message);

    let statusCode = HTTP_INTERNAL_SERVER_ERROR;
    let reason = "Unknown error occurred";

    if (e instanceof ZodError) {
        statusCode = HTTP_BAD_REQUEST;
        reason = e.message;
    }
    if (e instanceof HTTPError) {
        statusCode = e.status;
        reason = e.message;
    } else if (e instanceof Error) {
        reason = e.message;
    }

    const putResponse = PutResponseSchema.parse({
        status: "fail",
        reason: reason
    });

    response.status(statusCode);
    response.write(JSON.stringify(putResponse));
    response.end();
}
