import {html} from 'lit-html';
import Video from "../video/video.js";
import Settings from '../settings/settings.js';
import {Theme} from '@spectrum-web-components/themes/lib/index';

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<sp-theme color="light" scale="medium">
                        <dy-settings></dy-settings>
                        <dy-video></dy-video>
                    </sp-theme>`;
    },

    css() {
        return html`<style>
            dy-video {
                width: 100%;
                height: 100%;
            }
            
            dy-settings {
                width: 300px;
                margin-left: -300px;
                background-color: black;
                padding: 15px;
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
        </style>`;
    }
}
