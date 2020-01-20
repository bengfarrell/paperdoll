import {html} from 'lit-html';
import InputSettings from "./input/input.js";
import MultiPoseSettings from "./multipose/multipose.js";
import SinglePoseSettings from "./singlepose/singlepose.js";
import VideoModel from '../video/model.js';
import Model from './model.js';
import {Switch} from '@spectrum-web-components/switch/lib/index';
import {Button} from '@spectrum-web-components/button/lib/index';
import {Dropdown} from '@spectrum-web-components/dropdown/lib/index';
import {Dropzone} from '@spectrum-web-components/dropzone/lib/index';
import {Menu} from '@spectrum-web-components/menu/lib/index';
import {MenuItem} from '@spectrum-web-components/menu-item/lib/index';
import {Link} from '@spectrum-web-components/link/lib/index';
import Theme from '@spectrum-web-components/themes/lib/theme-light.css.js';
import {RAIL_RIGHT_LEFT, RAIL_RIGHT_RIGHT} from "../../icons.js";
import Video from "../video/video";

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<h3>Video Source</h3>
                    <br />
                    <sp-radio-group-patched column
                        @change=${e => scope.onDeviceChange(e)} 
                        selected=${VideoModel.currentDevice.id} name="devices">
                        ${VideoModel.devices.map( (device, i) => {
                            return html`<sp-radio ?checked=${VideoModel.currentDevice.id === device.id} value="${device.id}">${device.label}</sp-radio>`;
                        })}
                    </sp-radio-group-patched>
                    <br /><br />
                    <h3>Preferred Resolution</h3>
                    <br />
                    <sp-dropdown ?disabled=${!model.showCameraMenu} @change=${e => scope.onSelectResolution(e)}>
                        ${VideoModel.preferredResolution.label}
                        <sp-menu slot="options" role="listbox">
                            ${VideoModel.resolutions.map( (opt, i) => {
                                return html`<sp-menu-item value="${i}" ?selected=${i === VideoModel.preferredResolutionIndex}>${opt.label}</sp-menu-item>`;
                            })}
                        </sp-menu>
                    </sp-dropdown>
                    <br /><br />
                    <h3>Upload Test Video</h3>
                    <br />
                    <sp-dropzone @drop=${e => scope.onDropVideo(e)} id="dropzone" tabindex="1" style="width: 135px; height: 75px">
                        <sp-illustrated-message heading="Drag and Drop Your File">
                            <img src="./images/bg-dragdrop-illustration.svg"/>
                        </sp-illustrated-message>
                    
                        <div style="color: grey">
                            <div>
                                <label for="file-input">
                                    <sp-link>Select a Sample Video</sp-link>
                                    &nbsp;from your computer
                                </label>
                                <input @change=${ e => scope.onChooseVideo(e)} type="file" id="file-input" style="display: none" />
                            </div>
                        </div>
                    </sp-dropzone>
                    
                    <br />
                    <br />
                    <h3>Multi-Pose or Single-Pose</h3>
                    <sp-switch @change=${e => scope.onChange('algorithm', e.target.checked ? 'multi-pose' : 'single-pose')}
                        ?checked=${Model.algorithm === 'multi-pose'}>
                        ${Model.algorithm.toUpperCase()}
                    </sp-switch>
                    
                    <div class="spectrum-Well">
                        <h3>Input Settings</h3>
                        <hr class="spectrum-Rule">
                        <dy-settings-input></dy-settings-input>
                    </div>
                  
                    <div class="spectrum-Well ${Model.algorithm === 'single-pose' ? 'hidden' : ''}">
                        <h3>Multi Pose Settings</h3>
                        <hr class="spectrum-Rule">
                        <dy-settings-multipose></dy-settings-multipose>
                    </div>
                    
                    <div class="spectrum-Well ${Model.algorithm === 'multi-pose' ? 'hidden' : ''}">
                        <h3>Singe Pose Settings</h3>
                        <hr class="spectrum-Rule">
                        <dy-settings-singlepose></dy-settings-singlepose>
                    </div>
                    
                    <sp-action-button quiet @click=${ e => scope.onToggleMenu()}>
                        <svg slot="icon" role="img">${ scope.classList.contains('expanded') ? RAIL_RIGHT_RIGHT : RAIL_RIGHT_LEFT}</svg>
                    </sp-action-button>`;
    },

    css() {
        return html`<style>
            .spectrum-Rule {
                border-radius: 2px;
                height: 2px;
                border: none;
                background-color: rgb(75, 75, 75);
            }
            
            .spectrum-Well {
              display: block;
              padding: 16px;
              margin-top: 4px;
              border-width: 1px;
              border-style: solid;
              border-radius: var(--spectrum-global-dimension-size-50);
            }
            
            .spectrum-Well {
              background-color: var(--spectrum-well-background-color);
              border-color: var(--spectrum-well-border-color);
            }
            
            :host {
                display: inline-block;
                background-color: white;
                overflow-y: scroll;
                position: relative;
                padding: 15px;
            }
   
            .hidden {
                display: none;
            }
            
            h3 {
                margin: 0;
            }
            
            sp-action-button {
                position: absolute;
                top: 10px;
                right: 0;
                outline: none;
            }
            
            sp-dropdown {
                width: 75%;
            }
        </style>`;
    }
}
