<template>
    <v-container class="container">
        <v-expand-transition>
            <v-progress-linear
                v-if="status !== 'idle'"
                class="progress-bar"
                :color="progressBarColor"
                height="40"
                striped
                :indeterminate="status === 'pending'"
                :model-value="status === 'pending' ? 100 : progress"
            >
                <span class="progress-bar-text">{{ progressBarText }}</span>
            </v-progress-linear>
        </v-expand-transition>
        <FileUploadDropZone
            v-if="!verticalLayout"
            class="drop-zone"
            @upload="handleUpload"
        />
        <FileUploadZoneVertical
            v-if="verticalLayout"
            class="drop-zone-vertical"
            @upload="handleUpload"
        />
    </v-container>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { allocate } from "api/Allocate.ts";
import { upload } from "api/Upload.ts";
import FileUploadDropZone from "components/FileUploadDropZone.vue";
import FileUploadZoneVertical from "components/FileUploadDropZoneVertical.vue";
import { sleep } from "utils/AsyncSleep.ts";
import { bufferedRead } from "utils/BufferedReader.ts";
import { ref, watchEffect } from "vue";

type Status = "idle" | "pending" | "uploading" | "success" | "fail";

const verticalLayout = useMediaQuery("(max-width: 768px)");

// eslint-disable-next-line no-magic-numbers
const progress = ref(0);
const filename = ref("");
const status = ref<Status>("idle");
const progressBarColor = ref("");
const progressBarText = ref("");

watchEffect(() => {
    switch (status.value) {
        case "pending":
            progressBarColor.value = "secondary";
            break;
        case "success":
            progressBarColor.value = "success";
            break;
        case "fail":
            progressBarColor.value = "error";
            break;
        default:
            progressBarColor.value = "primary";
    }
});

watchEffect(() => {
    switch (status.value) {
        case "pending":
            progressBarText.value = "Waiting for server...";
            break;
        case "uploading":
            progressBarText.value = `Uploading ${filename.value}: ${progress.value.toFixed(import.meta.env.VITE_UPLOAD_FRACTION_DIGITS)}%`;
            break;
        case "success":
            progressBarText.value = `Successfully uploaded ${filename.value}`;
            break;
        case "fail":
            progressBarText.value = `Failed to upload ${filename.value}`;
            break;
        default:
            progressBarText.value = "";
    }
});

function handleUpload(files: FileList | File[]) {
    [...files].forEach((file) => uploadFile(file));
}

async function uploadFile(file: File) {
    filename.value = file.name;
    progress.value = 0;

    try {
        status.value = "pending";
        const id = await allocate(file);

        status.value = "uploading";
        const reader = file.stream().getReader();
        let chunkCounter: number | "end" = 0;

        for await (const chunk of bufferedRead(
            reader,
            import.meta.env.VITE_UPLOAD_CHUNK_SIZE
        )) {
            chunkCounter = await upload(id, chunkCounter, chunk);
            progress.value = calculateProgress(
                chunkCounter as number,
                file.size
            );
        }

        // Send an empty upload request to finish the upload process
        void (await upload(id, "end"));
        progress.value = 100;

        reader.releaseLock();
        status.value = "success";
    } catch (e) {
        console.error(e);
        status.value = "fail";
    }

    await sleep(import.meta.env.VITE_UPLOAD_SHOW_STATUS_FOR);
    status.value = "idle";
    filename.value = "";
    progress.value = 0;
}

function calculateProgress(chunkCounter: number, fileSize: number) {
    const uploadedSize = chunkCounter * import.meta.env.VITE_UPLOAD_CHUNK_SIZE;
    const limiter = 99;
    return (
        (limiter * (fileSize > uploadedSize ? uploadedSize : fileSize)) /
        fileSize
    );
}
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
}

.drop-zone {
    width: 50%;
    height: 450px;
}

.drop-zone-vertical {
    width: 100%;
    height: 100%;
}

.progress-bar {
    position: absolute;
}

.progress-bar-text {
    font-size: 1.15rem;
    font-weight: bold;
}

@media screen and (max-width: 959px) and (min-width: 769px) {
    .drop-zone {
        width: 450px;
    }
}
</style>
