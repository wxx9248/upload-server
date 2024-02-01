import { PostRequestSchema, PostResponseSchema } from "./schemas/Allocate.ts";
import urlJoin from "url-join";
import { API_ROOT } from "utils/Constants.ts";

export async function allocate(file: File) {
    const endpoint = urlJoin(API_ROOT, "allocate");

    const payload = PostRequestSchema.parse({
        name: file.name,
        size: file.size
    });

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const postResponse = PostResponseSchema.parse(await response.json());

    switch (postResponse.status) {
        case "fail":
            throw new Error(postResponse.reason);
        case "success":
            return postResponse.id;
        default:
            throw new TypeError(`Unknown server response`);
    }
}
