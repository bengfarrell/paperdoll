import {RadioGroup} from '@spectrum-web-components/radio-group/lib/index';

export class RadioGroupPatched extends RadioGroup {
    set selected(value) {
        const radio = value
            ? this.querySelector(`sp-radio[value="${value}"]`)
            : undefined;
        this.deselectChecked();
        if (radio) {
            this._selected = value;
            radio.checked = true;
        }
        else {
            // If no matching radio, selected is reset to empty string
            this._selected = '';
        }
    }
}

if (!customElements.get('sp-radio-group-patched')) {
    customElements.define('sp-radio-group-patched', RadioGroupPatched);
}
