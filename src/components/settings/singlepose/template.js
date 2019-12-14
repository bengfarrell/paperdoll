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
                        label="Minimum Pose Confidence"
                        @change=${e => scope.onChange('minPoseConfidence', e.target.value)}
                        variant="ramp" min="0" max="1" step=".01" 
                        value="${Model.singlePoseDetection.minPoseConfidence}">    
                    </sp-slider>
                    <sp-slider 
                        label="Minimum Part Confidence"
                        @change=${e => scope.onChange('minPartConfidence', e.target.value)}
                        variant="ramp" min="0" max="1" step=".01" 
                        value="${Model.singlePoseDetection.minPartConfidence}">    
                    </sp-slider>`;
    },

    css() {
        return html`<style>
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
