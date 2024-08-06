<template>
    <div>
        <div class="bg-blue mb-10">
            <input type="file" @change="onFileChange" />
        </div>

        <div class="mt-10">
            <button @click="processFile">Process File</button>
        </div>

        <div v-if="combinedImage" class="mt-10">
            <img :src="combinedImage" alt="Combined Image" />
        </div>

        <div v-if="ocrResult">
            <h3>OCR Results:</h3>
            <div class="d-flex flex-row mb-6 bg-surface-variant pa-4">
                <div>
                    <p class="d-flex" v-for="(value, index) in ocrResult" :key="index">
                        {{ Object.keys(value)[0] }}
                    </p>
                </div>
                <div class="flex ml-4">
                    <p class="d-flex" v-for="(value, index) in ocrResult" :key="index">
                        : {{ Object.values(value)[0] }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup() {
        const file = ref<File | null>(null);
        const combinedImage = ref<string | null>(null);
        const ocrResult = ref<{ [key: string]: string }[] | null>(null);

        const onFileChange = (event: Event) => {
            const input = event.target as HTMLInputElement;
            if (input.files && input.files[0]) {
                file.value = input.files[0];
                console.log("Input file: ", file.value);
            }
        };

        const processFile = async () => {
            if (file.value) {
                try {
                    const { stackImagesAndOcr } = await import('./utils/Index');
                    const result = await stackImagesAndOcr(file.value);
                    ocrResult.value = result;

                    // Convert the combined image file to a URL to display it
                    const url = URL.createObjectURL(file.value);
                    combinedImage.value = url;
                } catch (error) {
                    console.error('Error processing images and OCR:', error);
                }
            }
        };

        return {
            onFileChange,
            processFile,
            file,
            combinedImage,
            ocrResult
        };
    }
});
</script>

