import {Mixins, Register} from '../../mixins.js';
import Template from './template.js';
import Skeleton from "../../skeleton.js";
import EventBus from '../../eventbus.js';
import PartEditor from "../parteditor/parteditor.js";

export default class AssetLibrary extends HTMLElement {
    static get EDIT_ASSET() { return 'onEditAsset'; }

    async connectedCallback() {
        this.init(Template, {});

        this.addEventListener('dragenter', e => this.onDragEnter(e), false);
        this.addEventListener('dragover', e => this.onDragOver(e), false);
        this.addEventListener('dragleave', e => this.onDragLeave(e), false);
        this.addEventListener('drop', e => this.onFileDrop(e), false);

        new EventBus().addEventListener(PartEditor.ASSET_UPDATE, (e) => {
            this.render()
        });
    }

    editAsset(e) {
        const ce = new CustomEvent(AssetLibrary.EDIT_ASSET, { detail: e.currentTarget.dataset.filename, bubbles: true, composed: true});
        this.dispatchEvent(ce);
    }

    onToggleMenu() {
        this.classList.toggle('expanded');
        this.render();
    }

    onFileInputClick() {
        this.shadowRoot.querySelector('input').click();
    }

    async onFileInputChange(e) {
        if (e.target.files) {
            await Skeleton.loadAssets(e.target.files);
            this.render();
        }
    }

    async onFileDrop(e) {
        e.preventDefault();
        this.shadowRoot.querySelector('#dropzone').classList.toggle('drop-hover', false);

        if (e.dataTransfer.items) {
            const files = [];
            for (let i = 0; i < e.dataTransfer.items.length; ++i) {
                files.push(e.dataTransfer.items[i].getAsFile());
            }
            await Skeleton.loadAssets(files);
            this.render();
        }
    }

    onDragOver(e) {
        e.preventDefault();
    }

    onDragEnter(e) {
        e.preventDefault();
        this.shadowRoot.querySelector('#dropzone').classList.toggle('drop-hover', true);
    }

    onDragLeave(e) {
        e.preventDefault();
        this.shadowRoot.querySelector('#dropzone').classList.toggle('drop-hover', false);
    }
}

Register('dy-asset-library', AssetLibrary, Mixins);
