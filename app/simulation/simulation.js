import {textToData} from "./text-to-data.js";
import {drawTerrain} from "./draw-terrain.js";
import {setDimensions} from "./canvas.js";
import {FlowManager} from "./flow-simulation.js";

export default class Simulation extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        await this.loadData();
    }

    async loadData() {
        const text = await fetch(import.meta.url.replace(".js", ".txt")).then(result => result.text());
        this.data = textToData(text);

        const terrain = this._element.querySelector("#terrain");
        const flow = this._element.querySelector("#flow");

        setDimensions(this.data, [terrain, flow]);
        drawTerrain(this.data, terrain);
        this.flowManager = new FlowManager(this.data, flow);
    }

    async disconnectedCallback() {
        this.flowManager.dispose();
    }

}