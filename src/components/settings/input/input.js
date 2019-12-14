import {Mixins, Register} from '../../../mixins.js';
import Model from '../model.js';
import Template from './template.js';

export default class InputSettings extends HTMLElement {
    static get observedAttributes() {
    }

    propertyChangedCallback(name, oldval, newval) {
    }

    connectedCallback() {
        this.init(Template, {});
    }

    onChange(key, value) {
        const update = Model.setValue('input', key, value);
        if (update) {
            this.render();
        }

    }
}

Register('dy-settings-input', InputSettings, Mixins);
