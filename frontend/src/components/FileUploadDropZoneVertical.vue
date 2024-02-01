<template>
    <div class="drop-zone" @click="clickHandler">
        <h2>Tap to choose files</h2>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["upload"]);

function clickHandler() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => emit("upload", input.files);
    input.click();
}
</script>

<style scoped>
.drop-zone {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
}
</style>
