import {html} from 'lit-html';
import Model from '../model.js';
import {Switch} from '@spectrum-web-components/switch/lib/index';
import {RadioGroupPatched} from '../../radiogroup-patched.js';
import {Radio} from '@spectrum-web-components/radio/lib/index';
import {Slider} from '@spectrum-web-components/slider/lib/index';

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<sp-slider
                        @change=${e => scope.onChange('maxPoseDetections', e.target.value)}
                        variant="ramp" min="1" max="20" step="1" 
                        label="Maximum Number of Poses"
                        value="${Model.multiPoseDetection.maxPoseDetections}">    
                    </sp-slider>
                    <sp-slider 
                        @change=${e => scope.onChange('minPoseConfidence', e.target.value)}
                        variant="ramp" min="0" max="1" step=".01" 
                        label="Minimum Pose Confidence"
                        value="${Model.multiPoseDetection.minPoseConfidence}">    
                    </sp-slider>
                    <sp-slider 
                        @change=${e => scope.onChange('minPartConfidence', e.target.value)}
                        variant="ramp" min="0" max="1" step=".01"
                        label="Minimum Part Confidence" 
                        value="${Model.multiPoseDetection.minPartConfidence}">    
                    </sp-slider>
                    <sp-slider 
                        label="NMS Radius"
                        @change=${e => scope.onChange('nmsRadius', e.target.value)}
                        variant="ramp" min="0" max="30" step="1" 
                        value="${Model.multiPoseDetection.nmsRadius}">    
                    </sp-slider>`;
    },

    css() {
        return html`<style>
            .spectrum-Well {
              display: block;
              min-width: 248px;
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
                width: 100%;
            }
            
            sp-slider {
                margin-bottom: 15px;
            }
        </style>`;
    }
}
