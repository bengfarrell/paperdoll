import {Mixins, Register} from '../../mixins.js';
import Template from './template.js';
import Skeleton from "../../skeleton.js";
import EventBus from '../../eventbus.js';

export default class PartEditor extends HTMLElement {
    static get observedAttributes() { return ['part']; }
    static get DISMISS() { return 'onDismiss'; }
    static get ASSET_UPDATE() { return 'onAssetUpdate'; }

    propertyChangedCallback(name, oldval, newval) {
        this.setAsset(newval);
    }

    onChooseAsset(val) { this.setAsset(val); }

    setAsset(a) {
        this.model.asset = Skeleton.findAssetByFilename(a);
        this.model.transform = this.calculateInitialTransform(this.model.asset.image);
        this.render();
        this.redraw();
    }

    onZoom(e) {
        const ce = new CustomEvent(PartEditor.DISMISS, { bubbles: true, composed: true });
        this.dispatchEvent(ce);
    }

    onDismiss() {
        const ce = new CustomEvent(PartEditor.DISMISS, { bubbles: true, composed: true });
        this.dispatchEvent(ce);
    }

    onChoosePartForCurrentAsset(val) {
        this.model.asset.partname = val;
        this.model.asset.pins = Skeleton.defaultPinsForPartName(val);
        const ce = new CustomEvent(PartEditor.ASSET_UPDATE, { detail: 'assignment', bubbles: true, composed: true });
        new EventBus().triggerEvent(ce);
        this.render();
        this.redraw();
    }

    connectedCallback() {
        this.init(Template, {
            transform: {
                offsetX: 0,
                offsetY: 0,
                scale: null,
            },
            pinRadius: 5,
            pinDragging: null
        });

        this.imgCanvas = this.shadowRoot.querySelector('canvas#imaging');

        this.imgCanvas.addEventListener('pointerdown', e => this.onPointerDown(e));
        this.imgCanvas.addEventListener('pointermove', e => this.onPointerMove(e));
        document.addEventListener('pointerup', e => this.onPointerUp(e));
        window.addEventListener('resize', e => this.resize());

        this.resize();
        this.render();
    }

    pinHitTest(x, y) {
        if (this.model.asset && this.model.asset.pins) {
            const bounds = this.imgCanvas.getBoundingClientRect();
            // convert all to pixels relative to upper-left corner of image
            const posX = x - bounds.left - (this.model.transform.offsetX);
            const posY = y - bounds.top - (this.model.transform.offsetY);

            for (let c = 0; c < this.model.asset.pins.length; c++) {
                const pin = this.model.asset.pins[c];
                const pinPosX = this.model.asset.width * pin.x * this.model.transform.scale;
                const pinPosY = this.model.asset.height * pin.y * this.model.transform.scale;
                const dist = Math.sqrt(Math.pow(pinPosX - posX, 2) + Math.pow(pinPosY - posY, 2));
                if (dist < 10) {
                    return c;
                }
            }
        }
        return -1;
    }

    pointerCoordsToPercentage(pt) {
        return this.imageCoordsToPercentage(this.pointerCoordsToImageCoords(pt));
    }

    pointerCoordsToImageCoords(pt) {
        const bounds = this.imgCanvas.getBoundingClientRect();
        return  {
            x: (pt.x - bounds.left - this.model.transform.offsetX) * (1/this.model.transform.scale),
            y: (pt.y - bounds.top - this.model.transform.offsetY) * (1/this.model.transform.scale)
        };
    }

    imageCoordsToPercentage(pt) {
        return {
            x: pt.x / this.model.asset.width,
            y: pt.y / this.model.asset.height
        }
    }

    onPointerDown(e) {
        this._pointerIsDown = true;
        const pinIndex = this.pinHitTest(e.clientX, e.clientY);
        if (pinIndex !== -1) {
            this.model.pinDragging = this.model.asset.pins[pinIndex];
        }
        this._lastPointerPosition = { x: e.clientX, y: e.clientY };
    }

    onPointerUp(e) {
        if (this._pointerIsDown) {
            this._pointerIsDown = false;
            this.model.pinDragging = null;
        }
    }

    onPointerMove(e) {
        if (this.model.pinDragging) {
            const pt = this.pointerCoordsToPercentage( {x: e.clientX, y: e.clientY});
            this.model.pinDragging.x = pt.x;
            this.model.pinDragging.y = pt.y;
            this.redraw();
            return;
        }
        if (this._pointerIsDown) {
            const dx = e.clientX - this._lastPointerPosition.x;
            const dy = e.clientY - this._lastPointerPosition.y;
            this.model.transform.offsetX += dx | 0;
            this.model.transform.offsetY += dy | 0;
            this.redraw();
            this._lastPointerPosition = {x: e.clientX, y: e.clientY};
        }
    }

    onZoom(scale) {
        this.model.transform.scale = scale / 100;
        this.redraw();
    }

    redraw() {
        if (this.model.asset && this.model.asset.image) {
            this.imgctx.clearRect(0, 0, this.imgCanvas.width, this.imgCanvas.height);
            this.imgctx.drawImage(this.model.asset.image,
                0, 0,
                this.model.asset.width, this.model.asset.height,
                this.model.transform.offsetX, this.model.transform.offsetY,
                this.model.asset.width * this.model.transform.scale, this.model.asset.height * this.model.transform.scale);

            // draw image boundary
            this.imgctx.strokeStyle = '#6a6a6a';
            this.imgctx.lineWidth = .5;
            this.imgctx.beginPath();
            this.imgctx.rect(this.model.transform.offsetX, this.model.transform.offsetY, this.model.asset.width * this.model.transform.scale, this.model.asset.height * this.model.transform.scale);
            this.imgctx.stroke();
            this.imgctx.closePath();

            const pinStyle = ['#ff2222', '#22ff22', '#2222ff', '#ffff22', '#22ffff'];
            // draw any pins
            if (this.model.asset.pins) {
                this.model.asset.pins.forEach( (pin, index) => {
                    this.imgctx.fillStyle = pinStyle[index];
                    this.imgctx.beginPath();
                    this.imgctx.ellipse(
                        this.model.transform.offsetX + pin.x * this.model.asset.width * this.model.transform.scale,
                        this.model.transform.offsetY + pin.y * this.model.asset.height * this.model.transform.scale,
                        this.model.pinRadius, this.model.pinRadius, 0, 0, Math.PI*2);
                    this.imgctx.fill();
                });
            }
        }
    }

    resize() {
        const bounds = this.shadowRoot.getElementById('canvas-container').getBoundingClientRect();
        this.imgCanvas.width = bounds.width;
        this.imgCanvas.height = bounds.height;
        this.imgctx = this.imgCanvas.getContext('2d');
        this.render();
        this.redraw();
    }

    calculateInitialTransform(asset) {
        if (asset.width > asset.height) {
            const scale = (this.imgCanvas.width * .95) / asset.width;
            return {
                scale: scale,
                offsetX: this.imgCanvas.width / 2 - (asset.width * scale) / 2,
                offsetY: this.imgCanvas.height / 2 - (asset.height * scale) / 2,
            }
        } else {
            const scale = (this.imgCanvas.height * .95) / asset.height;
            return {
                scale: scale,
                offsetX: this.imgCanvas.width / 2 - (asset.width * scale) / 2,
                offsetY: this.imgCanvas.height / 2 - (asset.height * scale) / 2,
            }
        }
    }

}
Register('dy-part-editor', PartEditor, Mixins);
