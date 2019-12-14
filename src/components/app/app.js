import {Mixins, Register} from '../../mixins.js';
import Template from './template.js';

export default class App extends HTMLElement {
    static get observedAttributes() {
    }

    propertyChangedCallback(name, oldval, newval) {}

    connectedCallback() {
        this.init(Template, {});
        const video = this.shadowRoot.querySelector('dy-video');
        video.source = 'test.mp4';
    }
}

Register('dy-app', App, Mixins);
