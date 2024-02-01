import { handleError } from "/api/ErrorHandler.js";
import {
    PostRequestSchema,
    PostResponseSchema
} from "/api/schemas/Allocate.js";
import { API_ROOT } from "/config.js";
import { EndpointHandlerContext } from "/types/EndpointHandler.js";
import { logger } from "/utils/Log.js";
import express, { Request, Response } from "express";

export function handleAllocate({
    app,
    allocateManager,
    watchdog
}: EndpointHandlerContext) {
    const endpoint = `${API_ROOT}/allocate`;

    app.use(endpoint, express.json());
    logger.debug(
        { context: "AllocateAPIHandler" },
        `JSON middleware enabled for endpoint ${endpoint}`
    );

    app.post(endpoint, (request, response) => {
        try {
            handleAllocatePost(request, response);
        } catch (e) {
            handleError(response, e);
        }
    });
    logger.debug(
        { context: "AllocateAPIHandler" },
        `POST handler registered endpoint ${endpoint}`
    );

    function handleAllocatePost(request: Request, response: Response) {
        logger.info({ context: "AllocatePostHandler" }, `POST ${endpoint}`);

        const postRequest = PostRequestSchema.parse(request.body);
        logger.info(
            { context: "AllocatePostHandler" },
            `Request validated: ${JSON.stringify(postRequest)}`
        );

        const id = allocateManager.allocateId({
            name: postRequest.name,
            size: postRequest.size
        });
        logger.info({ context: "AllocatePostHandler" }, `ID allocated: ${id}`);

        watchdog.registerTimingGroup(id);
        logger.debug(
            { context: "AllocatePostHandler" },
            `Watchdog registered for ${id}`
        );

        watchdog.registerHandler(id, async () => {
            allocateManager.freeId(id);
            logger.info(
                { context: "AllocatePostHandler" },
                `Watchdog timeout: file allocation info freed for ${id}`
            );
        });

        watchdog.start(id);
        logger.debug(
            { context: "AllocatePostHandler" },
            `Watchdog started for ${id}`
        );

        const postResponse = PostResponseSchema.parse({
            status: "success",
            id: id
        });
        response.write(JSON.stringify(postResponse));
        response.end();
    }
}
