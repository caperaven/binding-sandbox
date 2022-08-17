export default class Events extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    async mousemove(event, value) {
        this.setProperty("mouseX", event.clientX);
        this.setProperty("mouseY", event.clientY);
        console.log(value)
    }

    async click(event) {
        this.setProperty("clickX", event.clientX);
        this.setProperty("clickY", event.clientY);
    }
}

