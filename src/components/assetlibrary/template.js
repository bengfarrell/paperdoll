import {html} from 'lit-html';
import {Switch} from '@spectrum-web-components/switch/lib/index';
import {Button} from '@spectrum-web-components/button/lib/index';
import Skeleton from '../../skeleton.js';
import {RAIL_RIGHT_LEFT, RAIL_RIGHT_RIGHT, EDIT} from "../../icons.js";

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<div id="dropzone">
                        <div id="dropzone-content">
                            <img src="./images/bg-dragdrop-illustration.svg" />
                            <p>Drag and drop or choose your assets</p>
                            <sp-button @click=${ e => scope.onFileInputClick()} variant="cta">Load assets</sp-button>
                            <input type="file" id="file-upload" multiple accept="image/*,application/json" @change=${ (e) => scope.onFileInputChange(e)}>
                            <sp-button variant="primary" @click=${e => Skeleton.export()}>Export</sp-button>
                        </div>
                    </div>
                    
                    <ul>
                       ${Skeleton.assets.map( a => { return html`<li>
                                <div class="part-thumb" style="background-image: url('${a.image.src}')"></div>
                                <div class="metainfo">
                                    <h3>${a.partname}</h3>
                                    <h4 class="filename">${a.filename}</h4>
                                    <sp-button variant="primary" data-filename="${a.filename}" @click=${ e => scope.editAsset(e)}>
                                        <svg slot="icon" role="img">${EDIT}</svg>
                                        Edit
                                    </sp-button>
                                </div>
                            </li>`})}
                    </ul>
                    
                    
                    <sp-action-button quiet @click=${ e => scope.onToggleMenu()}>
                        <svg slot="icon" role="img">${ scope.classList.contains('expanded') ? RAIL_RIGHT_LEFT : RAIL_RIGHT_RIGHT}</svg>
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
                padding-left: 35px;
            }
   
            .hidden {
                display: none;
            }
            
            h3 {
                margin: 0;
            }
            
            .metainfo {
                margin-left: 15px;
            }
            
            .metainfo .filename {
                color: var(--spectrum-global-color-gray-600);
                font-size: 10px;
            }
            
            sp-action-button {
                position: absolute;
                top: 10px;
                left: 0;
                outline: none;
            }
            
            input {
                display: none;
            }
            
            #dropzone {
                display: flex;
                width: 240px;
                height: 215px;
                border-color: var(--spectrum-global-color-gray-600);
                border-style: dashed;
                border-width: 1px;
                margin-left: auto;
                margin-right: auto;
            }
            
            #dropzone.drop-hover {
                border-color: #0080FF;
                background-color: #0080FF11;
            }
            
            #dropzone-content {
                text-align: center;
                margin: auto;
            }
            
            svg[slot] {
                stroke: none;
            }
            
            .part-thumb {
                width: 75px;
                height: 125px;
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                background-color: var(--spectrum-global-color-gray-100);
                border-color: var(--spectrum-global-color-gray-300);
                border-style: solid;
                border-width: 1px;
            }
            
            ul {
               padding: 0;
               margin-left: 30px;
               list-style: none;
            }
            
            li {
                display: flex;
                margin-bottom: 10px;
            }
                      
        </style>`;
    }
}
