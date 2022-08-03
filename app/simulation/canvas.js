export function setDimensions(data, canvases) {
    for (const canvas of canvases) {
        canvas.width = data.width;
        canvas.style.width = `${data.width}px`;
        canvas.height = data.height;
        canvas.style.height = `${data.height}px`;
    }
}