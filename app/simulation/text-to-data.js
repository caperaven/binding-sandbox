export function textToData(text) {
    const result = {
        width: 0,
        height: 0,
        points: [],
        minValue: Number.MAX_VALUE,
        maxValue: Number.MIN_VALUE
    }

    const lines = text.split("\n");
    setDimensions(result, lines[0]);
    setPointData(result, lines[1]);

    return result;
}

function setDimensions(result, line) {
    const dimensions = line.split(" ");
    result.width = Number(dimensions[0]);
    result.height = Number(dimensions[1]);
}

function setPointData(result, line) {
    const points = line.split(" ");
    let index = 0;

    for (let row = 0; row < result.height; row++) {
        const row = [];

        for (let column = 0; column < result.width; column++) {
            const value = Number(points[index]);

            if (value > result.maxValue) {
                result.maxValue = value;
            }

            if (value < result.minValue) {
                result.minValue = value;
            }

            row.push(value);

            index += 1;
        }

        result.points.push(row);
    }
}