import {Mixins, Register} from '../../../mixins.js';
import Model from '../model.js';
import Template from './template.js';

export default class SinglePoseSettings extends HTMLElement {
    static get observedAttributes() {
    }

    propertyChangedCallback(name, oldval, newval) {
    }

    connectedCallback() {
        this.init(Template, {});
    }

    onChange(key, value) {
        Model.setValue('singlePoseDetection', key, value);
    }
}

Register('dy-settings-singlepose', SinglePoseSettings, Mixins);
