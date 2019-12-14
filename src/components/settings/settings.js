import {Mixins, Register, Reflect} from '../../mixins.js';
import Template from './template.js';
import Model from "./model.js";

export default class Settings extends HTMLElement {
    static get observedAttributes() {
    }

    propertyChangedCallback(name, oldval, newval) {
    }

    connectedCallback() {
        this.init(Template, {});
    }

    onChange(key, value) {
        Model.setValue(null, key, value);
        this.render();
    }

    onToggleMenu() {
        this.classList.toggle('expanded');
        this.render();
    }
}

Register('dy-settings', Settings, Mixins);
