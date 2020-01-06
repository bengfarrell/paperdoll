import {Mixins, Register} from '../../mixins.js';
import Template from './template.js';
import EventBus from '../../eventbus.js';

export default class Capture extends HTMLElement {
    static get TAKE_PHOTO() { return 'onTakePhoto'; }
    static get RECORD_VIDEO() { return 'onRecordVideo'; }

    connectedCallback() {
        this.init(Template, {
            recording: false
        });
    }

    takePhoto() {
        const ce = new CustomEvent(Capture.TAKE_PHOTO, { bubbles: true, composed: true });
        new EventBus().triggerEvent(ce);
    }

    recordVideo() {
        this.model.recording = !this.model.recording;
        const ce = new CustomEvent(Capture.RECORD_VIDEO, { detail: { recording: this.model.recording }, bubbles: true, composed: true });
        new EventBus().triggerEvent(ce);
        this.render();
    }
}

Register('dy-capture', Capture, Mixins);
