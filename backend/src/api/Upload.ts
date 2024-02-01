import { handleError } from "/api/ErrorHandler.js";
import { PutRequestSchema, PutResponseSchema } from "/api/schemas/Upload.js";
import { API_ROOT, MAX_CHUNK_SIZE } from "/config.js";
import { EndpointHandlerContext } from "/types/EndpointHandler.js";
import { HTTP_BAD_REQUEST } from "/utils/Constants.js";
import { HTTPError } from "/utils/HTTPError.js";
import { logger } from "/utils/Log.js";
import express, { Request, Response } from "express";

export function handleUpload({
    app,
    allocateManager,
    uploadManager,
    watchdog
}: EndpointHandlerContext) {
    const endpoint = `${API_ROOT}/upload/:id/:chunkCount`;

    app.use(
        endpoint,
        express.raw({ type: "application/octet-stream", limit: MAX_CHUNK_SIZE })
    );
    logger.debug(
        { context: "UploadAPIHandler" },
        `Raw middleware enabled for endpoint ${endpoint}`
    );

    app.put(endpoint, async (request, response) => {
        try {
            await handleUploadPut(request, response);
        } catch (e) {
            handleError(response, e);
        }
    });
    logger.debug(
        { context: "UploadAPIHandler" },
        `PUT handler registered endpoint ${endpoint}`
    );

    async function handleUploadPut(request: Request, response: Response) {
        logger.info({ context: "AllocatePostHandler" }, `PUT ${endpoint}`);

        const { id, chunkCount } = PutRequestSchema.parse(request.params);
        logger.info(
            { context: "UploadPutHandler" },
            `Request validated: ${JSON.stringify({ id, chunkCount })}`
        );

        const file = allocateManager.getFileById(id);
        logger.debug(
            { context: "UploadPutHandler" },
            `Got allocated file info: ${JSON.stringify(file)}`
        );

        if (chunkCount === "end") {
            logger.debug(
                { context: "UploadPutHandler" },
                "Request for finalizing file received"
            );

            watchdog.unregisterTimingGroup(id);
            logger.debug(
                { context: "UploadPutHandler" },
                `Watchdog unregistered for ${id}`
            );

            await uploadManager.close(id);
            logger.debug(
                { context: "UploadPutHandler" },
                `File handle closed for ${id}`
            );

            allocateManager.freeId(id);
            logger.debug(
                { context: "UploadPutHandler" },
                `File allocation info freed for ${id}`
            );

            const putResponse = PutResponseSchema.parse({
                status: "success",
                nextChunkCount: "end"
            });
            response.write(JSON.stringify(putResponse));
            response.end();
            return;
        }

        const chunkCountInteger = parseInt(chunkCount);
        if (isNaN(chunkCountInteger)) {
            throw new HTTPError(HTTP_BAD_REQUEST, "Invalid chunk count");
        }

        // eslint-disable-next-line no-magic-numbers
        if (chunkCountInteger === 0) {
            logger.debug(
                { context: "UploadPutHandler" },
                `First chunk received for ${id}`
            );

            await uploadManager.open(id, file);
            logger.debug(
                { context: "UploadPutHandler" },
                `Opened handle for ${id}`
            );

            watchdog.registerHandler(id, async () => {
                await uploadManager.close(id);
                logger.debug(
                    { context: "UploadPutHandler" },
                    `Watchdog timeout. Closed handle for ${id}`
                );
            });
            logger.debug(
                { context: "UploadPutHandler" },
                `Watchdog registered for ${id}`
            );
        }

        const nextChunkCount = await uploadManager.write(
            id,
            chunkCountInteger,
            request.body as Buffer
        );
        logger.debug(
            { context: "UploadPutHandler" },
            `Chunk ${chunkCountInteger} written for ${id}. Expecting next chunk of number ${nextChunkCount}`
        );

        const putResponse = PutResponseSchema.parse({
            status: "success",
            nextChunkCount: nextChunkCount
        });
        response.write(JSON.stringify(putResponse));
        response.end();

        watchdog.feed(id);
    }
}
