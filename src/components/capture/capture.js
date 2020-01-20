import {Mixins, Register} from '../../mixins.js';
import Template from './template.js';
import EventBus from '../../eventbus.js';

export default class Capture extends HTMLElement {
    static get TAKE_PHOTO() { return 'onTakePhoto'; }
    //static get RECORD_VIDEO() { return 'onRecordVideo'; }

    connectedCallback() {
        this.init(Template, {
            //recording: false
            photoCount: 0,
            sessionName: '',
            shareCode: ''
        });
    }

    generateFilename() {
        return this.model.sessionName !== '' ? this.model.sessionName : 'unnamed' + '_' + this.model.shareCode + '_' + this.model.photoCount;
    }

    takePhoto() {
        this.model.photoCount ++;

        if (this.model.photoCount === 1) {
            this.model.shareCode = parseInt(Date.now() / 1000).toString(36);
        }
        const ce = new CustomEvent(Capture.TAKE_PHOTO, { detail: this.generateFilename(), bubbles: true, composed: true });
        new EventBus().triggerEvent(ce);
        this.render();
    }

    enterName(e) {
        this.model.sessionName = e.target.value;
    }

    resetSession() {
        this.model.photoCount = 0;
        this.model.sessionName = '';
        this.shadowRoot.querySelector('sp-textfield').value = '';
        this.render();
    }

    /*recordVideo() {
        this.model.recording = !this.model.recording;
        const ce = new CustomEvent(Capture.RECORD_VIDEO, { detail: { recording: this.model.recording }, bubbles: true, composed: true });
        new EventBus().triggerEvent(ce);
        this.render();
    }*/
}

Register('dy-capture', Capture, Mixins);
