<template>
    <v-sheet
        class="drop-zone"
        :class="{ 'drop-zone-grab': isGrabbing }"
        elevation="24"
        @click="clickHandler"
        @dragover="dragOverHandler"
        @dragleave="dragLeaveHandler"
        @drop="dropHandler"
    >
        <div
            class="drop-zone-mask"
            :class="{ 'drop-zone-mask-grab': isGrabbing }"
        >
            <v-icon icon="mdi-file-upload" size="200px" style="opacity: 0.7" />
        </div>
        <h1>Drag and drop files here</h1>
        <h2>or click/tap to choose files</h2>
    </v-sheet>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isGrabbing = ref(false);
const emit = defineEmits(["upload"]);

function clickHandler() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => emit("upload", input.files);
    input.click();
}

function dragOverHandler(event: DragEvent) {
    event.preventDefault();
    isGrabbing.value = true;
}

function dragLeaveHandler() {
    isGrabbing.value = false;
}

function dropHandler(event: DragEvent) {
    event.preventDefault();
    isGrabbing.value = false;

    if (!event.dataTransfer) {
        return;
    }

    const data = event.dataTransfer;
    if (data.items) {
        emit(
            "upload",
            [...data.items]
                .filter((value) => value.kind === "file")
                .map((value) => value.getAsFile())
        );
    } else {
        emit("upload", data.files);
    }
}
</script>

<style scoped>
.drop-zone {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
    border-radius: 30px;
}

.drop-zone-grab {
    cursor: grabbing;
}

.drop-zone-mask {
    display: flex;
    height: 100%;
    width: 100%;
    backdrop-filter: blur(2px);
    background-color: #000000b0;
    border-radius: 30px;
    position: absolute;
    justify-content: center;
    align-items: center;
    opacity: 0;
}

.drop-zone-mask-grab {
    opacity: 1;
}

.drop-zone * {
    pointer-events: none;
}
</style>
