import {Mixins, Register} from '../../mixins.js';
import Template from './template.js';
import PartEditor from "../parteditor/parteditor.js";
import AssetLibrary from "../assetlibrary/assetlibrary.js";

export default class App extends HTMLElement {
    static get observedAttributes() {
    }

    propertyChangedCallback(name, oldval, newval) {}

    connectedCallback() {
        this.init(Template, {
            showModal: false
        });

        this.addEventListener(PartEditor.DISMISS, e => {
            this.model.showModal = false;
            this.render();
        });

        this.addEventListener(AssetLibrary.EDIT_ASSET, e => {
            this.model.showModal = true;
            const editor = this.shadowRoot.querySelector('dy-part-editor');
            this.render();

            requestAnimationFrame( () => {
                editor.resize();
                editor.part = e.detail;
            });
        });

        const video = this.shadowRoot.querySelector('dy-video');
        video.source = 'test2.mp4';
    }
}

Register('dy-app', App, Mixins);
