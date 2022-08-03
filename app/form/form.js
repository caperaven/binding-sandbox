export default class Form extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    preLoad() {
        this.setProperty("firstName", "John");
        this.setProperty("lastName", "Doe");
        this.setProperty("age", 20);
    }
}