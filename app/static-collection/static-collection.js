import {data} from "./data.js"

export default class Welcome extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    preLoad() {
        this.setProperty("data", data);
    }

    load() {
        crsbinding.data.updateUI(this,"data");
        this.dataProxy = this.getProperty("data");
        super.load();
    }

    update() {
        crsbinding.data.setProperty(this.dataProxy[0], "age", 30);
    }

    add() {
        this.dataProxy.push({
            firstName: "Hello",
            lastName: "World",
            age: 25
        })
    }

    remove() {
        this.dataProxy.pop();
    }
}

