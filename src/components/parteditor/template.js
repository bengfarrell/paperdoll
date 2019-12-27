import {html} from 'lit-html';
import {Button} from '@spectrum-web-components/button/lib/index';
import {Dropdown} from '@spectrum-web-components/dropdown/lib/index';
import {Slider} from '@spectrum-web-components/slider/lib/index';
import {Menu} from '@spectrum-web-components/menu/lib/index';
import {MenuItem} from '@spectrum-web-components/menu-item/lib/index';
import Skeleton from '../../skeleton.js';

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<div id="canvas-controls">
                        <sp-dropdown 
                            value=${model.asset ? model.asset.filename : ''} 
                            @change=${e => scope.onChooseAsset(e.target.value)}>
                          <sp-menu slot="options" role="listbox">
                            ${Skeleton.assets.map( asset => {
                                return html`<sp-menu-item>${asset.filename}</sp-menu-item>`;
                            })}
                        </sp-menu>
                        </sp-dropdown>
                        <span>&nbsp;&nbsp;becomes the&nbsp;&nbsp;</span>
                        <sp-dropdown 
                            value=${model.asset ? model.asset.partname : ''}
                            @change=${e => scope.onChoosePartForCurrentAsset(e.target.value)}>
                            Unassigned
                            <sp-menu slot="options" role="listbox">
                                ${Skeleton.partsList.map( p => {
                                    return html`<sp-menu-item ?selected=${model.asset && model.asset.partname === p.name}>${p.name}</sp-menu-item>`;
                                })}
                            </sp-menu>
                        </sp-dropdown>
                        <sp-slider @input=${e => scope.onZoom(e.target.value)} label="scale" min="10" max="500" variant="ramp" value="${Math.round(model.transform.scale * 100)}"></sp-slider>
                    </div>
                    <div id="canvas-container">               
                        <canvas id="imaging"></canvas>
                    </div>
                    <div id="bottom-controls">
                        <sp-button variant="primary" @click=${e => Skeleton.export()}">Export</sp-button>
                        <sp-button @click=${e => scope.onDismiss(e)}">Done</sp-button>
                    </div>`;
    },

    css() {
        return html`<style>  
            :host {
                display: inline-block;
            }
            
            #canvas-container {
                display: inline-block;
                height: calc(100% - 100px);
                width: 100%;               
                background-image: linear-gradient(45deg, #eaeaea 25%, transparent 25%), linear-gradient(-45deg, #eaeaea 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eaeaea 75%), linear-gradient(-45deg, transparent 75%, #eaeaea 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                border-radius: 15px;
            }
            
            #canvas-controls {
                display: flex;
                align-items: center;
                height: 50px;
                padding-left: 15px;
                padding-right: 15px;
                border-bottom-style: solid;
                border-bottom-width: 1px;
                border-bottom-color: var(--spectrum-global-color-gray-600);
            }
            
            #bottom-controls {
                display: flex;
                align-items: center;
                height: 50px;
                padding-left: 15px;
                padding-right: 15px;
                border-top-style: solid;
                border-top-width: 1px;
                border-top-color: var(--spectrum-global-color-gray-600);
            }
            
            #bottom-controls sp-button:first-child {
                margin-left: auto;
                margin-right: 10px;
            }
            
            sp-slider {
                margin-left: auto;
            }
        </style>`;
    }
}
