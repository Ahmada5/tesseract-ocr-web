export const stackImagesAndOcr = (imageBFile: File): Promise<{ [key: string]: string }[]> => {
    return new Promise((resolve, reject) => {
        const imageA = new Image();
        const imageB = new Image();
        const imageC = new Image();

        imageA.src = "src/utils/img/cropfinal2.png";
        imageC.src = "src/utils/img/cropfinal1.png";

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (event.target && event.target.result) {
                imageB.src = event.target.result as string;
            }
        };
        reader.onerror = () => reject('Failed to read image file.');
        reader.readAsDataURL(imageBFile);

        let imagesLoaded = 0;
        const checkAndDrawImages = () => {
            imagesLoaded++;
            if (imagesLoaded === 3) {
                drawAndOcrImages();
            }
        };

        imageA.onload = checkAndDrawImages;
        imageA.onerror = () => reject('Failed to load imageA.');

        imageB.onload = checkAndDrawImages;
        imageB.onerror = () => reject('Failed to load imageB.');

        imageC.onload = checkAndDrawImages;
        imageC.onerror = () => reject('Failed to load imageC.');

        const drawAndOcrImages = () => {
            const drawImage = (img1: HTMLImageElement, img2: HTMLImageElement) => {
                return new Promise<File>((resolve, reject) => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject('Canvas context is not supported');
                        return;
                    }

                    const canvasWidth = Math.max(img1.width, img2.width);
                    const canvasHeight = Math.max(img1.height, img2.height);
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img1, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const file = new File([blob], 'combinedImage.png', { type: 'image/png' });
                            resolve(file);
                        } else {
                            reject('Failed to create blob from canvas.');
                        }
                    }, 'image/png');
                });
            };

            Promise.all([
                drawImage(imageA, imageB),
                drawImage(imageC, imageB)
            ]).then(([file1, file2]) => {
                Promise.all([
                    ocrSystem(file1),
                    ocrSystem(file2)
                ]).then(([ocrResult1, ocrResult2]) => {
                    // Combine the results into a single array
                    const combinedResult = [...ocrResult2, ...ocrResult1];
                    console.log(combinedResult);
                    resolve(combinedResult);
                }).catch(error => {
                    reject('OCR processing failed: ' + error);
                });
            }).catch(error => {
                reject('Image stacking failed: ' + error);
            });
        };
    });
};

export const ocrSystem = (toOcrFile: File | HTMLImageElement): Promise<{ [key: string]: string }[]> => {
    console.log("on ocr");

    return new Promise<{ [key: string]: string }[]>((resolve, reject) => {
        const reader = new FileReader();

        const processImage = (imgSrc: string) => {
            const img = new Image();

            img.onload = () => {
                Tesseract.recognize(img, 'ind', {
                    // logger: (m) => console.log(m)
                }).then(({ data: { lines: recognizedLines } }) => {
                    const modifiedLines: { text: string }[] = [];
                    for (let i = 0; i < recognizedLines.length; i++) {
                        if (i <= 2) {
                            modifiedLines.push(recognizedLines[i]);
                        } else if (i === 4) {
                            const joinedText = [recognizedLines[4].text, recognizedLines[5].text, recognizedLines[6].text].join(' ');
                            modifiedLines.push({ text: joinedText });
                            i += 2;
                        } else {
                            modifiedLines.push(recognizedLines[i]);
                        }
                    }
                    const fixArrayValue = modifiedLines.map(line => line.text.replace(/\n/g, ''));
                    console.log(fixArrayValue.length);
                    if (fixArrayValue.length < 2) {
                        const keys = ["tipe sim"];
                        const newDataArray = fixArrayValue.map((text, index) => {
                            const key = keys[index];
                            return { [key]: text };
                        });
                        resolve(newDataArray);
                    } else {
                        const keys = ["nomor sim", "nama", "ttl", "jenis kelamin", "alamat", "status", "polda", "masa berlaku"];
                        const newDataArray = fixArrayValue.map((text, index) => {
                            const key = keys[index];
                            return { [key]: text };
                        });
                        resolve(newDataArray);
                    }


                }).catch((error) => {
                    reject(error);
                });
            };
            img.src = imgSrc;
        };

        if (toOcrFile instanceof File) {
            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    processImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(toOcrFile);
        } else if (toOcrFile instanceof HTMLImageElement) {
            processImage(toOcrFile.src);
        } else {
            reject('Invalid input for OCR processing.');
        }
    });
};
