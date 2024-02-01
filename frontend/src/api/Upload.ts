import { PutRequestSchema, PutResponseSchema } from "./schemas/Upload.ts";
import urlJoin from "url-join";
import { API_ROOT } from "utils/Constants.ts";

export async function upload(
    id: string,
    chunkCount: number | "end",
    chunk?: Uint8Array
) {
    const putRequest = PutRequestSchema.parse({
        id: id,
        chunkCount: chunkCount.toString()
    });

    const endpoint = urlJoin(
        API_ROOT,
        "upload",
        putRequest.id,
        putRequest.chunkCount
    );

    const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
            "Content-Type": "application/octet-stream"
        },
        body: chunk?.buffer
    });

    const putResponse = PutResponseSchema.parse(await response.json());
    switch (putResponse.status) {
        case "fail":
            throw new Error(putResponse.reason);
        case "success":
            return putResponse.nextChunkCount;
        default:
            throw new TypeError(`Unknown server response`);
    }
}
