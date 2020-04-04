import {html} from 'lit-html';
import {CAMERA, MOVIE_CAMERA} from "../../icons.js";
import {Button} from '@spectrum-web-components/button/lib/index';
import {Textfield} from '@spectrum-web-components/textfield/lib/index';

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<sp-button variant="primary" @click=${ e => scope.takePhoto()}>${CAMERA} Take Photo</sp-button>
                    <sp-button variant="${model.recording ? 'negative' : 'primary'}" variant="primary" @click=${e => scope.recordVideo()}>${MOVIE_CAMERA} Take Video</sp-button>
                    <sp-textfield placeholder="Name your photo" @input=${e => scope.enterName(e)} value="${model.sessionName}">${model.sessionName}</sp-textfield>`;
    },

    css() {
        return html`<style>
            :host {
                padding: 20px;
                position: relative;
            }
            
            svg {
                vertical-align: middle;
            }                        

            sp-button[variant="negative"] svg path {
                fill: red;
            }
            
            sp-button {
                margin-right: 5px;
            }
            
            .filename {
                position: absolute;
                display: inline-block;
                width: 100%;
                text-align: center;
                color: #9a9a9a;
            }
        </style>`;
    }
}
