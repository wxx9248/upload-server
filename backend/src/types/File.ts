import { promises as fs } from "fs";

export interface File {
    name: string;
    size: number;
}

export interface FileDescriptor {
    handle: fs.FileHandle;
    totalSize: number;
    writtenSize: number;
    nextChunkCount: number;
}

export type FileId = string;
