import {textToData} from "./text-to-data.js";

export default class Simulation extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    async loadData() {
        const text = await fetch(import.meta.url.replace(".js", ".txt")).then(result => result.text());
        this.data = textToData(text);
    }
}