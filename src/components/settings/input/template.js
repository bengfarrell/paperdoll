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
        return html`<label>Architecture</label>
                    <sp-radio-group-patched 
                        @change=${e => scope.onChange(e.currentTarget.getAttribute('name'), e.target.value)} 
                        selected="${Model.input.architecture}" name="architecture">
                        <sp-radio value="MobileNetV1">MobileNet v1</sp-radio>
                        <sp-radio value="ResNet50">ResNet 50</sp-radio>
                    </sp-radio-group-patched>
                    <sp-slider 
                        label="Resolution"
                        @change=${e => scope.onChange('inputResolution', e.target.value)}
                        variant="ramp" min="50" max="800" step="50" 
                        value="${Model.input.inputResolution}">    
                    </sp-slider>
                    <label>Output Stride</label>
                    <sp-radio-group-patched 
                        @change=${e => scope.onChange(e.currentTarget.getAttribute('name'), Number(e.target.value))} 
                        selected="${Model.input.outputStride}" 
                        name="outputstride">
                        <sp-radio value="${Model.input.outputStrideOptions[Model.input.architecture][0]}">${Model.input.outputStrideOptions[Model.input.architecture][0]}</sp-radio>
                        <sp-radio value="${Model.input.outputStrideOptions[Model.input.architecture][1]}">${Model.input.outputStrideOptions[Model.input.architecture][1]}</sp-radio>
                    </sp-radio-group-patched>
                    <label>Multiplier</label>
                    <sp-radio-group-patched 
                        @change=${e => scope.onChange(e.currentTarget.getAttribute('name'), Number(e.target.value))} 
                        selected="${Model.input.multiplier}" 
                        class="${Model.input.architecture === 'ResNet50' ? 'hidden' : ''}"
                        name="multiplier">
                        <sp-radio value="0.5">0.5</sp-radio>
                        <sp-radio value="0.75">0.75</sp-radio>
                        <sp-radio value="1.0">1.0</sp-radio>
                    </sp-radio-group-patched>
                    <label>Quant Bytes</label>
                    <sp-radio-group-patched 
                        @change=${e => scope.onChange(e.currentTarget.getAttribute('name'), Number(e.target.value))} 
                        selected="${Model.input.quantBytes}" 
                        name="quantbytes">
                        <sp-radio value="1">1</sp-radio>
                        <sp-radio value="2">2</sp-radio>
                        <sp-radio value="4">4</sp-radio>
                    </sp-radio-group-patched>`;
    },

    css() {
        return html`<style>
            :host {
                display: inline-block;
                width: 100%;
            }
            
            .hidden {
                display: none;
            }
            
            label {
                font-size: var(--spectrum-label-text-size,var(--spectrum-global-dimension-font-size-75));
                line-height: var(--spectrum-label-text-line-height,var(--spectrum-global-font-line-height-small));
                color: var(--spectrum-label-text-color,var(--spectrum-alias-label-text-color));
            }
            
            sp-slider,
            sp-radio-group-patched {
                margin-bottom: 15px;
            }
        </style>`;
    }
}
