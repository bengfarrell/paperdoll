import {Mixins, Register} from '../../../mixins.js';
import Model from '../model.js';
import Template from './template.js';

export default class MultiPoseSettings extends HTMLElement {
    static get observedAttributes() {
    }

    propertyChangedCallback(name, oldval, newval) {
    }

    connectedCallback() {
        this.init(Template, {});
    }

    onChange(key, value) {
        Model.setValue('multiPoseDetection', key, value);
    }
}

Register('dy-settings-multipose', MultiPoseSettings, Mixins);
