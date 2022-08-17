export default class Welcome extends crsbinding.classes.ViewBase {
    get firstName() {
        return this._firstName;
    }

    set firstName(newValue) {
        this._firstName = newValue;
        this.form.querySelector("[data-field='firstName']").value = newValue;
    }

    async connectedCallback() {
        await super.connectedCallback();

        this.form = this._element.querySelector("form");
        this.summary = this._element.querySelector("#summary")

        this.changeHandler = this.change.bind(this);
        this.form.addEventListener("change", this.changeHandler);
    }

    async disconnectedCallback() {
        this.form.removeEventListener("change", this.changeHandler);
        this.changeHandler = null;
        this.summary = null;
        this.form = null;
    }

    change(event) {
        this[event.target.dataset.field] = event.target.value;
        this.summary.textContent = `${this.firstName} ${this.lastName} is ${this.age} old`;
        this.summary.style.color = this.age < 20 ? "red" : "blue";
    }

    update() {
        this.firstName = "Charles";
    }
}

