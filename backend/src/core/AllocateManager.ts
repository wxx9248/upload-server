import { File, FileId } from "/types/File.js";
import { HTTP_BAD_REQUEST } from "/utils/Constants.js";
import { HTTPError } from "/utils/HTTPError.js";
import * as crypto from "crypto";

export class AllocateManager {
    #map: Map<FileId, File>;

    constructor() {
        this.#map = new Map();
    }

    allocateId(file: File) {
        const id = crypto.randomUUID();
        this.#map.set(id, file);
        return id;
    }

    freeId(id: FileId) {
        this.#fileIdGuard(id);
        this.#map.delete(id);
    }

    getFileById(id: FileId) {
        this.#fileIdGuard(id);
        return this.#map.get(id)!;
    }

    #fileIdGuard(id: FileId) {
        if (!this.#map.has(id)) {
            throw new HTTPError(HTTP_BAD_REQUEST, "Unknown file ID");
        }
    }
}
