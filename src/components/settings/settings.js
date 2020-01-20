import {Mixins, Register, Reflect} from '../../mixins.js';
import Template from './template.js';
import Model from "./model.js";
import VideoModel from '../video/model.js';

export default class Settings extends HTMLElement {
    static get observedAttributes() {
    }

    propertyChangedCallback(name, oldval, newval) {
    }

    async connectedCallback() {
        this.init(Template, {
            showCameraMenu: true
        });

        const devices = await navigator.mediaDevices.enumerateDevices();
        devices.forEach(function(device) {
            if (device.kind === 'videoinput') {
                VideoModel.devices.push({label: device.label, id: device.deviceId, type: 'camera'});
            }
        });
        this.render();
    }


    onSelectResolution(e) {
        VideoModel.preferredResolutionIndex = parseInt(e.target.value);
    }

    onDeviceChange(e) {
        if (e.target.value === 'uploaded') {
            this.model.showCameraMenu = false;
        } else {
            this.model.showCameraMenu = true;
        }
        VideoModel.currentDevice = e.target.value;
        this.render();
    }

    onDropVideo(e) {
        VideoModel.uploaded = URL.createObjectURL(e.dataTransfer.files[0]);
        this.render();
    }

    onChooseVideo(e) {
        VideoModel.uploaded = URL.createObjectURL(e.target.files[0]);
        this.render();
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
