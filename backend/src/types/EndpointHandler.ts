import { AllocateManager } from "/core/AllocateManager.js";
import { UploadManager } from "/core/UploadManager.js";
import { Watchdog } from "/utils/Watchdog.js";
import { Express } from "express";

export interface EndpointHandlerContext {
    app: Express;
    allocateManager: AllocateManager;
    uploadManager: UploadManager;
    watchdog: Watchdog;
}
