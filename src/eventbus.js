import EventListener from './eventlistener.js';
import EventBus from './eventbus.js';

let _instance = null;

export default class extends EventListener {
    constructor() {
        super();
        if(!_instance){
            _instance = this;
        }
        return _instance;
    }

    get instance() {
        if (!_instance) {
            _instance = new EventBus();
        }
        return _instance;
    }
}