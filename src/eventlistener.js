export default class EventListener {
    constructor() {
        /**
         * event listeners
         * @type {Array}
         * @private
         */
        this._listeners = [];
    }

    /**
     * add event listener
     * @param type
     * @param cb
     * @returns {{type: *, callback: *}}
     */
    addEventListener(type, cb) {
        let listener = { type: type, callback: cb };
        this._listeners.push(listener);
        return listener;
    }

    /**
     * remove event listener
     * @param listener
     */
    removeEventListener(listener) {
        for (let c = 0; c < this._listeners.length; c++) {
            if (listener === this._listeners[c]) {
                this._listeners.splice(c, 0);
                return;
            }
        }
    }

    /**
     * trigger event
     * @param custom event
     */
    triggerEvent(ce) {
        this._listeners.forEach( function(l) {
            if (ce.type === l.type) {
                l.callback.apply(this, [ce]);
            }
        });
    }
}
