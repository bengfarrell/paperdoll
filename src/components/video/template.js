import {html} from 'lit-html';

export default {
    render(scope, model) {
        return html`${this.css()}
                    ${this.html(scope, model)}`;
    },

    html(scope, model) {
        return html`<canvas></canvas>
                    <video playsinline></videoplaysinline>`;
    },

    css() {
        return html`<style>
            :host {
                display: inline-block;
                background-color: black;
            }
            
            video {
                transform: scaleX(1);
                display: none;
            }
        </style>`;
    }
}
