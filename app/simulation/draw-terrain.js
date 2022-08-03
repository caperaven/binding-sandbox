export function drawTerrain(data, canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(data.width, data.height);

    let i = 0;

    for (let row = 0; row < data.height; row++) {
        const rowData = data.points[row];
        for (let column = 0; column < data.width; column++) {
            const value = normalize(rowData[column], data.minValue, data.maxValue);
            const color = Math.trunc(255 * value);

            imageData.data[i + 0] = color;
            imageData.data[i + 1] = color;
            imageData.data[i + 2] = color;
            imageData.data[i + 3] = 255;

            i += 4;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function normalize(value, min, max) {
    // https://www.statology.org/normalize-data-between-0-and-1/
    // (value - min) / (max - min)
    // we need to invert the normalization so we change the formula a bit.
    return (max - value) / (max - min);
}