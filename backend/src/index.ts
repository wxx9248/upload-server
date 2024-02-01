import { handleAllocate } from "/api/Allocate.js";
import { handleUpload } from "/api/Upload.js";
import { RUNTIME_MODE, HTTP_PORT } from "/config.js";
import { AllocateManager } from "/core/AllocateManager.js";
import { UploadManager } from "/core/UploadManager.js";
import { EndpointHandlerContext } from "/types/EndpointHandler.js";
import { logger } from "/utils/Log.js";
import { Watchdog } from "/utils/Watchdog.js";
import cors from "cors";
import express from "express";

const app = express();
const allocateManager = new AllocateManager();
const uploadManager = new UploadManager();
const watchdog = new Watchdog();

const handlerContext: EndpointHandlerContext = {
    app: app,
    allocateManager: allocateManager,
    uploadManager: uploadManager,
    watchdog: watchdog
};

switch (RUNTIME_MODE) {
    case "development":
        logger.info({ context: "Index" }, "Running in development mode");

        app.use(cors());
        logger.debug(
            { context: "Index" },
            "CORS middleware enabled: all CORS headers will be automatically provided as client requests"
        );
        break;
    case "production":
        logger.info({ context: "Index" }, "Running in production mode");
        break;
    default:
        logger.error(
            { context: "Index" },
            `Unknown runtime mode: ${RUNTIME_MODE}`
        );
        // eslint-disable-next-line no-magic-numbers
        process.exit(1);
}

handleAllocate(handlerContext);
handleUpload(handlerContext);

app.listen(HTTP_PORT, () => {
    logger.info(
        { context: "Index" },
        `Server is running on http://localhost:${HTTP_PORT}`
    );
});
