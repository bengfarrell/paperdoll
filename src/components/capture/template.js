import {html} from 'lit-html';
import {CAMERA, MOVIE_CAMERA} from "../../icons.js";
import {Button} from '@spectrum-web-components/button/lib/index';

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<sp-button variant="primary" @click=${ e => scope.takePhoto()}>${CAMERA}</sp-button>
                    <sp-button variant="${model.recording ? 'negative' : 'primary'}" variant="primary" @click=${ e => scope.recordVideo()}>${MOVIE_CAMERA}</sp-button>`;
    },

    css() {
        return html`<style>
            :host {
                padding: 20px;
            }
            
            sp-button[variant="negative"] svg path {
                fill: red;
            }
            
            
        </style>`;
    }
}
