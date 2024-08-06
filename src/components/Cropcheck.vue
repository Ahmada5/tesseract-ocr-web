<template>
	<div>
		<input type="file" @change="onFileChange($event, 'A')" accept="image/*" />
		<input type="file" @change="onFileChange($event, 'B')" accept="image/*" />
		<canvas ref="canvas"></canvas>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
	setup() {
		const canvas = ref<HTMLCanvasElement | null>(null);
		const imageA = ref<HTMLImageElement | null>(null);
		const imageB = ref<HTMLImageElement | null>(null);

		const onFileChange = (event: Event, imageType: 'A' | 'B') => {
			const files = (event.target as HTMLInputElement).files;
			if (files && files[0]) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const img = new Image();
					img.onload = () => {
						if (imageType === 'A') {
							imageA.value = img;
						} else {
							imageB.value = img;
						}
						drawImages();
					};
					img.src = e.target?.result as string;
				};
				reader.readAsDataURL(files[0]);
			}
		};
		
		
		const drawImages = () => {
			console.log(canvas.value);
			console.log(imageA.value);
			console.log(imageB.value);
			if (canvas.value && imageA.value && imageB.value) {
				const ctx = canvas.value.getContext('2d');
				if (ctx) {
					const canvasWidth = imageA.value.width > imageB.value.width ? imageA.value.width : imageB.value.width;
					const canvasHeight = imageA.value.height > imageB.value.height ? imageA.value.height : imageB.value.height;
					canvas.value.width = canvasWidth;
					canvas.value.height = canvasHeight;
					ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
					ctx.drawImage(imageB.value, 0, 0, canvas.value.width, canvas.value.height);
					ctx.drawImage(imageA.value, 0, 0, canvas.value.width, canvas.value.height);
					logCanvasImage();
				}
			}
		};

		const logCanvasImage = () => {
			if (canvas.value) {
				const dataURL = canvas.value.toDataURL();
				console.log("Canvas image data URL:", dataURL);
			}
		};

		return {
			canvas,
			onFileChange,
		};
	},
});
</script>

<style scoped>
canvas {
	border: 1px solid #000;
	max-width: 100%;
	height: auto;
}
</style>
