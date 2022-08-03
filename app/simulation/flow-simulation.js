export class FlowManager {
    constructor(terrain, flow) {
        this.terrain = terrain;
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

        this.terrain = null;
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

        const terrainData = this.terrain.getContext("2d").getImageData(0, 0, this.terrain.width, this.terrain.height);
        const flowData = this.flow.getContext("2d").getImageData(0, 0, this.flow.width, this.flow.height);

        const simulation = new Simulation(terrainData, flowData, this.rect, () => {
            console.log("done");
            simulation.dispose();
        })

        simulation.done();
    }
}

class Simulation {
    constructor(terrainData, flowData, rect, callback) {
        this.terrainData = terrainData;
        this.flowData = flowData;
        this.rect = rect;
        this.callback = callback;
    }

    dispose() {
        this.terrainData = null;
        this.flowData = null;
        this.rect = null;
        this.callback = null;
    }

    done() {
        this.callback();
    }
}