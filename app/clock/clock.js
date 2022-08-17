export default class Clock extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    async disconnectedCallback() {
        this.hour_hand = null;
        this.min_hand = null;
        this.sec_hand = null;
    }

    async load() {
        this.hour_hand = this._element.querySelector("#hour_hand");
        this.min_hand = this._element.querySelector("#min_hand");
        this.sec_hand = this._element.querySelector("#sec_hand");
        await this.render();
        await this.updateTime()
        super.load();
    }

    async updateTime() {
        setInterval(async () => {
            await this.render();
        }, 1000)
    }

    async render() {
        const time = new Date();
        const hours = time.getHours();
        const min = time.getMinutes();
        const sec = time.getSeconds();

        const hourDeg = hours * 30;
        const minDeg = min * 6;
        const secDeg = sec * 6;

        this.hour_hand.style.transform = `rotate(${hourDeg}deg)`;
        this.min_hand.style.transform = `rotate(${minDeg}deg)`;
        this.sec_hand.style.transform = `rotate(${secDeg}deg)`;
    }
}