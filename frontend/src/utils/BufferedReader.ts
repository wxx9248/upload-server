export async function* bufferedRead(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    chunkSize: number
) {
    let arrays: Array<Uint8Array> = [];
    let totalLength = 0;

    for (;;) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }

        arrays.push(value!);
        totalLength += value.byteLength;

        if (totalLength >= chunkSize) {
            yield merge(arrays, totalLength);
            arrays = [];
            // eslint-disable-next-line no-magic-numbers
            totalLength = 0;
        }
    }

    yield merge(arrays, totalLength);
    arrays = [];
}

function merge(arrays: Array<Uint8Array>, totalLength: number) {
    const concatenatedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (const element of arrays) {
        concatenatedArray.set(element, offset);
        offset += element.byteLength;
    }
    return concatenatedArray;
}
