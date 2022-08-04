export class FlowManager {
    constructor(data, flow) {
        this.data = data;
        this.flow = flow;
        this.flowCtx = this.flow.getContext("2d");
        this.flowCtx.fillStyle = "#0080ff3f";
        this.flowRect = this.flow.getBoundingClientRect();

        this._mouseDownHandler = this.mouseDown.bind(this);
        this._mouseMoveHandler = this.mouseMove.bind(this);
        this._mouseUpHandler = this.mouseUp.bind(this);

        this.flow.addEventListener("mousedown", this._mouseDownHandler);
    }

    dispose() {
        this.flow.removeEventListener("mousedown", this._mouseDownHandler);

        this.data = null;
        this.flow = null;
        this._mouseDownHandler = null;
        this._mouseMoveHandler = null;
        this._mouseUpHandler = null;
        this.flowRect = null;
        this.flowCtx = null;
    }

    async mouseDown(event) {
        this.rect = {
            cx: event.clientX,
            cy: event.clientY,
            x: event.clientX - this.flowRect.left,
            y: event.clientY - this.flowRect.top,
            width: 0,
            height: 0
        }

        this.flow.addEventListener("mousemove", this._mouseMoveHandler);
        this.flow.addEventListener("mouseup", this._mouseUpHandler);
    }

    async mouseMove(event) {
        this.rect.width = event.clientX - this.rect.cx;
        this.rect.height = event.clientY - this.rect.cy;

        this.flowCtx.clearRect(0, 0, this.flowCtx.canvas.width, this.flowCtx.canvas.height);
        this.flowCtx.beginPath();
        this.flowCtx.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        this.flowCtx.fill();
    }

    async mouseUp(event) {
        this.flow.removeEventListener("mousemove", this._mouseMoveHandler);
        this.flow.removeEventListener("mouseup", this._mouseUpHandler);

        const flowCtx = this.flow.getContext("2d");

        const simulation = new Simulation(this.data, flowCtx, this.rect, () => {
            console.log("done");
            simulation.dispose();
        })
    }
}

class Simulation {
    constructor(data, flowCtx, rect, callback) {
        this.data = data;
        this.flowCtx = flowCtx;
        this.rect = rect;
        this.callback = callback;
        const points = this.createPointData();

        crsbinding.idleTaskManager.add(() => this.processPoints(points)).catch(error => console.error(error));
    }

    dispose() {
        this.data = null;
        this.flowCtx = null;
        this.rect = null;
        this.callback = null;
    }

    done() {
        this.callback();
    }

    createPointData() {
        const points = [];
        const x = this.rect.x;
        const y = this.rect.y;

        for (let row = 0; row < this.rect.height; row ++) {
            for (let column = 0; column < this.rect.width; column ++) {
                points.push( {x: x + column, y: y + row} )
            }
        }

        return points;
    }

    async processPoints(points) {
        await crsbinding.idleTaskManager.add(async () => {
            let affectedCount = 0;
            for (let i = 0; i < points.length; i++) {
                const point = points[i];

                if (point == null) {
                    continue;
                }

                const p = await this.processPoint(point);
                points[i] = p;
                affectedCount += 1;
            }

            if (affectedCount == 0) {
                this.done();
            }
            else {
                await this.drawPoints(points);
            }
        });
    }

    async processPoint(point) {
        const pValue = this.getValue(point.x, point.y);
        const surround = this.setSurround(point.x, point.y);
        const lowest = this.findLowestPoint(surround);

        if (lowest.value < pValue) {
            return { x: lowest.x, y: lowest.y };
        }
    }

    setSurround(x, y) {
        const surround = [
            { x: x, y: y + 1, value: this.getValue(x, y + 1) },
            { x: x + 1, y: y + 1, value: this.getValue(x + 1, y + 1) },
            { x: x + 1, y: y, value: this.getValue(x + 1, y) },
            { x: x + 1, y: y - 1, value: this.getValue(x + 1, y - 1) },
            { x: x, y: y - 1, value: this.getValue(x, y - 1) },
            { x: x - 1, y: y - 1, value: this.getValue(x - 1, y - 1) },
            { x: x - 1, y: y, value: this.getValue(x - 1, y) },
            { x: x - 1, y: y + 1, value: this.getValue(x - 1, y + 1) }
        ]

        return surround;
    }

    findLowestPoint(surround) {
        let lowest = surround[0];

        for (let i = 1; i < surround.length; i++) {
            if (surround[i].value < lowest.value) {
                lowest = surround[i];
            }
        }

        return lowest;
    }

    getValue(x, y) {
        if (x < 0) return Number.MAX_VALUE;
        if (y < 0) return Number.MAX_VALUE;
        if (x > this.data.width) return Number.MAX_VALUE;
        if (y > this.data.height) return Number.MAX_VALUE;

        return this.data.points[x][y];
    }

    async drawPoints(points) {
        const canvasData = this.flowCtx.createImageData(this.data.width, this.data.height)

        const rowSize = this.data.width * 4;

        for (const point of points) {
            if (point != null) {
                const rIndex = point.y * rowSize;
                const cIndex = point.x * 4;
                const i = rIndex + cIndex;
                this.setDataAt(canvasData, i)
            }
        }

        this.flowCtx.putImageData(canvasData, 0, 0);

        const timeout = setTimeout(async () => {
            clearTimeout(timeout);
            await this.processPoints(points);
        }, 20)
    }

    setDataAt(canvasData, index) {
        canvasData.data[index + 0] = 0;
        canvasData.data[index + 1] = 128;
        canvasData.data[index + 2] = 255;
        canvasData.data[index + 3] = 255;
    }
}