document.addEventListener('DOMContentLoaded', function() {
    let counter = new Counter('counter', 1);
    counter.start();
});
class Counter {
    constructor(id, minutes) {
        this.minutes = --minutes;
        this.id = id;
        this.timerId;
        this.seconds = 60;
    }
    _tick() {
        let counter = document.getElementById(this.id);
        this.seconds--;
        if (this.seconds < 0) {
            this.seconds = 60;
            this.minutes--;
        }
        if (this.minutes < 0) {
            counter.innerHTML = `TILBUDET AVSLUTTES 0 MIN 00 SEK`;
            return;
        }
        counter.innerHTML = `TILBUDET AVSLUTTES ${this.minutes} MIN ${(this.seconds<10) ? `0${this.seconds}`: this.seconds} SEK`;
        this.timerId = setTimeout(()=> {this._tick.bind(this)()}, 1000);
    }
    start() {
        this._tick();
    }
}

