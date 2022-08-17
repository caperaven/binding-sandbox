export default class MazeEscape extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        this.maze = this._element.querySelector(".maze");

        this.mouseDownHandler = this.mouseDown.bind(this);
        this.mouseOverHandler = this.mouseOver.bind(this);
        this.mouseUpHandler = this.mouseUp.bind(this);
        this.setMarkersHandler = this.setMarkers.bind(this);

        this.maze.addEventListener("mousedown", this.mouseDownHandler);
    }

    preLoad() {
        this.setProperty("dimensions", "15x15");
    }

    async disconnectedCallback() {
        this.maze.removeEventListener("mousedown", this.mouseDownHandler);

        this.mouseDownHandler = null;
        this.mouseOverHandler = null;
        this.mouseUpHandler = null;
        this.setMarkersHandler = null;

        await super.disconnectedCallback();
    }

    async dimensionsChanged(newValue) {
        const values = newValue.split("x").map(item => Number(item));
        this.size = values[0];

        await this.initializeMaze(values[0], values[1]);
        await this.loadFromStorage();
    }

    async initializeMaze(rows, columns) {
        this.data = [];

        this.maze = this._element.querySelector(".maze");
        this.maze.innerText = "";
        this.maze.style.gridTemplateColumns = `repeat(${columns}, 2rem)`;
        this.maze.style.gridTemplateRows = `repeat(${rows}, 2rem)`;

        const fragment = document.createDocumentFragment();
        for (let row = 0; row < rows; row++) {
            const dataRow = [];
            for (let col = 0; col < columns; col++) {
                const div = document.createElement("div");
                div.dataset.row = row;
                div.dataset.col = col;

                const isWall = row == 0 || row == rows -1 || col == 0 || col == columns -1;
                div.classList.add(isWall ? "wall" : "gap");
                fragment.appendChild(div);

                dataRow[col] = isWall ? 1 : 0;
            }
            this.data.push(dataRow);
        }
        this.maze.appendChild(fragment);
    }

    async mouseDown(event) {
        if (event.target.dataset.row == null) return;

        if (event.ctrlKey || event.altKey) {
            return this.setMarkers(event);
        }

        this.drawType = event.buttons == 1 ? "wall" : "gap";

        if (event.target.classList.contains("start")) {
            this.setProperty("start", null);
        }

        if (event.target.classList.contains("end")) {
            this.setProperty("end", null);
        }

        await this.draw(event.target);

        this.maze.addEventListener("mouseover", this.mouseOverHandler);
        this.maze.addEventListener("mouseup", this.mouseUpHandler);
        event.preventDefault();
        event.stopPropagation();
    }

    async mouseUp(event) {
        this.maze.removeEventListener("mouseover", this.mouseOverHandler);
        this.maze.removeEventListener("mouseup", this.mouseUpHandler);
        event.preventDefault();
        event.stopPropagation();
    }

    async mouseOver(event) {
        await this.draw(event.target);
        event.preventDefault();
        event.stopPropagation();
    }

    async draw(target) {
        target.classList.remove("wall", "gap", "start", "end");
        target.classList.add(this.drawType);

        const row = Number(target.dataset.row);
        const col = Number(target.dataset.col);
        this.data[row][col] = this.drawType == "wall" ? 1 : 0;
    }

    async clear() {
        const values = this.getProperty("dimensions").split("x").map(item => Number(item));
        await this.initializeMaze(values[0], values[1]);
    }

    async saveToStorage() {
        const dimensions = this.getProperty("dimensions");
        localStorage.setItem(dimensions, JSON.stringify(this.data));
    }

    async loadFromStorage() {
        const dimensions = this.getProperty("dimensions");
        const result = localStorage.getItem(dimensions);

        if (result == null) return false;

        this.data = JSON.parse(result);

        const size = this.data.length;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const drawType = this.data[row][col] == 1 ? "wall" : "gap";
                const element = this.elementAt(row, col);
                element.classList.remove("wall", "gap");
                element.classList.add(drawType);
            }
        }
    }

    async setMarkers(event) {
        const pos = {row: Number(event.target.dataset.row), col: Number(event.target.dataset.col)};

        if (event.ctrlKey) {
            const start = this.getProperty("start");
            if (start != null) {
                const element = this.elementAt(start.row, start.col);
                element?.classList.remove("start");
            }

            this.setProperty("start", pos);
            event.target.classList.add("start");
        }
        else if (event.altKey) {
            const end = this.getProperty("end");
            if (end != null) {
                const element = this.elementAt(end.row, end.col);
                element?.classList.remove("end");
            }

            this.setProperty("end", pos);
            event.target.classList.add("end");
        }
    }

    elementAt(row, col) {
        return this.maze.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    async solve() {
        this.currentPos = this.getProperty("start");
        const endPos = this.getProperty("end");

        this.goto(this.currentPos.row, this.currentPos.col);

        const interval = setInterval(() => {
            if (this.currentPos.row == endPos.row && this.currentPos.col == endPos.col) {
                clearInterval(interval);
            }
            else {
                this.step();
            }
        }, 500);
    }

    step() {
        let row;
        let col;

        // look up
        if (this.isOpen(this.currentPos.row - 1, this.currentPos.col)) {
            this.goto(this.currentPos.row - 1, this.currentPos.col)
        }
    }

    isOpen(row, col) {
        if (row < 0 || col < 0) return false;
        if (row >= this.size || col >= this.size) return false;
        return this.data[row][col] == 0;
    }

    goto(row, col) {
        this.elementAt(this.currentPos.row, this.currentPos.col).classList.remove("actor");
        this.currentPos.row = row;
        this.currentPos.col = col;
        this.elementAt(this.currentPos.row, this.currentPos.col).classList.add("actor");
    }
}