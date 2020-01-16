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
        return html`<sp-button variant="primary" @click=${ e => scope.takePhoto()}>${CAMERA} Take Photo #${model.photoCount+1}</sp-button>
                    <sp-textfield placeholder="Enter your name" @input=${e => scope.enterName(e)} value="${model.sessionName}">${model.sessionName}</sp-textfield>
                    <sp-button variant="primary" quiet @click=${ e => scope.resetSession()}>Reset Session</sp-button>
                    <br /><span class="filename">${scope.generateFilename()}</span>`;
        //<sp-button variant="${model.recording ? 'negative' : 'primary'}" variant="primary" @click=${ e => scope.recordVideo()}>${MOVIE_CAMERA}</sp-button>
    },

    css() {
        return html`<style>
            :host {
                padding: 20px;
                position: relative;
            }

            sp-button[variant="negative"] svg path {
                fill: red;
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
