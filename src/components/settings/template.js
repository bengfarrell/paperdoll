import {html} from 'lit-html';
import InputSettings from "./input/input.js";
import MultiPoseSettings from "./multipose/multipose.js";
import SinglePoseSettings from "./singlepose/singlepose.js";
import Model from './model.js';
import {Switch} from '@spectrum-web-components/switch/lib/index';
import {Button} from '@spectrum-web-components/button/lib/index';
import Theme from '@spectrum-web-components/themes/lib/theme-light.css.js';
import {RAIL_RIGHT_CLOSE, RAIL_RIGHT_OPEN} from "../../icons.js";

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<h3>Multi-Pose or Single-Pose</h3>
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
                        <svg slot="icon" role="img">${ scope.classList.contains('expanded') ? RAIL_RIGHT_OPEN : RAIL_RIGHT_CLOSE}</svg>
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
            
        </style>`;
    }
}
