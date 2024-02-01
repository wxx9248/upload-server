import * as process from "process";
import { z } from "zod";

export const UPLOAD_DIRECTORY = "upload";
export const HTTP_PORT = 3000;

export const MAX_CHUNK_SIZE = "100mb";

export const RUNTIME_MODE = z
    .union([z.literal("development"), z.literal("production")])
    .parse(process.env.RUNTIME_MODE);

const module = await import(`./config.${RUNTIME_MODE}.js`);
export const { API_ROOT, TIMEOUT_MS } = module;
