import {html} from 'lit-html';
import Video from "../video/video.js";
import Settings from '../settings/settings.js';
import AssetLibrary from "../assetlibrary/assetlibrary.js";
import PartEditor from "../parteditor/parteditor.js";
import Capture from "../capture/capture.js";
import {Theme} from '@spectrum-web-components/themes/lib/index';

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<sp-theme color="light" scale="medium">
                        <dy-settings></dy-settings>
                        <dy-asset-library></dy-asset-library>
                        <dy-video></dy-video>
                        <div ?active=${model.showModal} id="modal-container">
                            <div id="modal-contents">
                                <dy-part-editor></dy-part-editor>
                            </div>
                        </div>
                        <dy-capture></dy-capture>
                    </sp-theme>`;
    },

    css() {
        return html`<style>
            #modal-container {
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                margin: auto;
                background-color: #4a4a4a4a;
                position: absolute;
                display: none;
            }
            
            #modal-container[active] {
                display: inline-block;
            }
            
            #modal-contents {
                left: 10%;
                right: 10%;
                top: 10%;
                bottom: 10%;
                margin: auto;
                border-radius: 15px;
                border-width: 1px;
                border-style: solid;
                border-color: #E1E1E1;
                background-color: white;
                position: absolute;
                display: inline-block;
            }
            
            dy-capture {
                position: absolute;
                top: 0;
                left: 33%;
                background-color: white;
                border-bottom-left-radius: 15px;
                border-bottom-right-radius: 15px;
                border-style: solid;
                border-width: 1px;
                border-color: var(--spectrum-global-color-gray-600);
            }
            
            dy-part-editor {
                width: 100%;
                height: 100%;
            }

            dy-video {
                width: 100%;
                height: 100%;
            }
            
            dy-settings {
                width: 300px;
                margin-left: -300px;
                background-color: black;
                height: calc(100% - 30px);
                position: absolute;
                left: 0;
                border-right-style: solid;
                border-right-width: 2px;
                border-right-color: #3a3a3a;
            }
            
            dy-settings.expanded {
                background-color: white;
                margin-left: 0;
                border-right-color: #E1E1E1;
            }
            
            dy-asset-library {
                width: 300px;
                margin-right: -320px;
                background-color: black;
                height: calc(100% - 30px);
                position: absolute;
                right: 0;
                border-left-style: solid;
                border-left-width: 2px;
                border-left-color: #3a3a3a;
            }
            
            dy-asset-library.expanded {
                background-color: white;
                margin-right: 0;
                border-left-color: #E1E1E1;
            }
        </style>`;
    }
}
