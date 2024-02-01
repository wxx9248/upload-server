import { UPLOAD_DIRECTORY } from "/config.js";
import { File, FileDescriptor, FileId } from "/types/File.js";
import { HTTP_BAD_REQUEST } from "/utils/Constants.js";
import { HTTPError } from "/utils/HTTPError.js";
import { promises as fs } from "fs";
import * as path from "path";

export class UploadManager {
    #map: Map<FileId, FileDescriptor>;

    constructor() {
        this.#map = new Map();
    }

    async open(id: FileId, file: File) {
        if (this.#map.has(id)) {
            await this.#map.get(id)!.handle.close();
        }

        await fs.mkdir(UPLOAD_DIRECTORY, { recursive: true });

        const handle = await fs.open(
            path.join(UPLOAD_DIRECTORY, file.name),
            "w"
        );

        this.#map.set(id, {
            handle: handle,
            totalSize: file.size,
            writtenSize: 0,
            nextChunkCount: 0
        });
    }

    async write(id: FileId, chunkCount: number, chunk: Buffer) {
        this.#fileIdGuard(id);
        const fileDescriptor = this.#map.get(id)!;
        const { handle, totalSize, writtenSize, nextChunkCount } =
            fileDescriptor;

        if (chunkCount !== nextChunkCount) {
            throw new HTTPError(HTTP_BAD_REQUEST, "Invalid chunk ID");
        }
        if (writtenSize + chunk.length > totalSize) {
            throw new HTTPError(HTTP_BAD_REQUEST, "Exceeded allocated size");
        }

        const { bytesWritten } = await handle.write(chunk);
        ++fileDescriptor.nextChunkCount;
        fileDescriptor.writtenSize += bytesWritten;

        return fileDescriptor.nextChunkCount;
    }

    async close(id: FileId) {
        this.#fileIdGuard(id);
        const fileDescriptor = this.#map.get(id)!;
        await fileDescriptor.handle.close();
        this.#map.delete(id);
    }

    #fileIdGuard(id: FileId) {
        if (!this.#map.has(id)) {
            throw new HTTPError(HTTP_BAD_REQUEST, "Unknown file ID");
        }
    }
}
