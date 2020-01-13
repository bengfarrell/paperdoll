import QuadFitter from './quadfitter.js';

const assets = [];
const quad = new QuadFitter();

export default {
    get partsList() {
        return [
            this.UPPER_LEFT_ARM,
            this.UPPER_RIGHT_ARM,
            this.UPPER_LEFT_LEG,
            this.UPPER_RIGHT_LEG,
            this.LOWER_LEFT_LEG,
            this.LOWER_LEFT_ARM,
            this.LOWER_RIGHT_ARM,
            this.LOWER_RIGHT_LEG,
            this.TORSO,
            this.HEAD
        ]
    },

    get UPPER_LEFT_LEG() { return { name: 'upper left leg', defaultPins: [ { name: 'top', x: .5, y: .1 }, { name: 'bottom', x: .5, y: .9 }] }},
    get LOWER_LEFT_LEG() { return { name: 'lower left leg', defaultPins: [ { name: 'top', x: .5, y: .1 }, { name: 'bottom', x: .5, y: .9 }] }},
    get UPPER_RIGHT_LEG() { return { name: 'upper right leg', defaultPins: [ { name: 'top', x: .5, y: .1 }, { name: 'bottom', x: .5, y: .9 }] }},
    get LOWER_RIGHT_LEG() { return { name: 'lower right leg', defaultPins: [ { name: 'top', x: .5, y: .1 }, { name: 'bottom', x: .5, y: .9 }] }},

    get UPPER_LEFT_ARM() { return { name: 'upper left arm', defaultPins: [ { name: 'top', x: .5, y: .1 }, { name: 'bottom', x: .5, y: .9 }] }},
    get LOWER_LEFT_ARM() { return { name: 'lower left arm', defaultPins: [ { name: 'top', x: .5, y: .1 }, { name: 'bottom', x: .5, y: .9 }] }},
    get UPPER_RIGHT_ARM() { return { name: 'upper right arm', defaultPins: [ { name: 'top', x: .5, y: .1 }, { name: 'bottom', x: .5, y: .9 }] }},
    get LOWER_RIGHT_ARM() { return { name: 'lower right arm', defaultPins: [ { name: 'top', x: .5, y: .1 }, { name: 'bottom', x: .5, y: .9 }] }},

    get TORSO() { return { name: 'torso', defaultPins: [ { name: 'topleft', x: .1, y: .1 }, { name: 'topright', x: .9, y: .1 }, { name: 'bottomleft', x: .1, y: .9 }, { name: 'bottomright', x: .9, y: .9 }]}},
    get HEAD() { return { name: 'head' }},

    get assets() {
        return assets;
    },

    export() {
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(assets)], {type: 'text/plain'});
        a.href = URL.createObjectURL(file);
        a.download = 'skeleton.json';
        a.click();
    },

    findAssetByFilename(f) {
      for (let c = 0; c < assets.length; c++) {
          if (assets[c].filename === f) {
              return assets[c];
          }
      }
      return null;
    },

    defaultPinsForPartName(name) {
        for (let c = 0; c < this.partsList.length; c++) {
            if (this.partsList[c].name === name) {
                return this.partsList[c].defaultPins.slice();
            }
        }
    },

    async loadAssets(files) {
        let manifest;
        for (let c = 0; c < files.length; c++) {
            if (files[c].type === 'application/json') {
                manifest = await this.loadAssetManifest(files[c]);
            } else {
                assets.push( await this.loadImage(files[c]) );
            }
        }

        // merge manifest and assets
        if (manifest) {
            for (let d = 0; d < manifest.length; d++) {
                for (let e = 0; e < assets.length; e++) {
                    if (assets[e].filename === manifest[d].filename) {
                        if (manifest[d].partname) {
                            assets[e].partname = manifest[d].partname;

                            if (manifest[d].pins) {
                                assets[e].pins = manifest[d].pins;
                            }
                        }
                    }
                }
            }
        }
        return assets;
    },

    resolvePointsToSegment(p1, p2) {
        const parts = [p1.part, p2.part].sort();
        switch (parts.join(',')) {
            case 'rightElbow,rightShoulder':
                return this.UPPER_RIGHT_ARM;

            case 'leftElbow,leftShoulder':
                return this.UPPER_LEFT_ARM;

            case 'rightElbow,rightWrist':
                return this.LOWER_RIGHT_ARM;

            case 'leftElbow,leftWrist':
                return this.LOWER_LEFT_ARM;

            case 'leftHip,leftKnee':
                return this.UPPER_LEFT_LEG;

            case 'rightHip,rightKnee':
                return this.UPPER_RIGHT_LEG;

            case 'leftAnkle,leftKnee':
                return this.LOWER_LEFT_LEG;

            case 'rightAnkle,rightKnee':
                return this.LOWER_RIGHT_LEG;
        }
    },

    drawTorso(points, ctx) {
        let asset = assets.find(a => a.partname === 'torso');
        if (!asset) { return; }
        if (quad.texture !== asset.image) {
            quad.texture = asset.image;
        }

        if (points.leftShoulder && points.rightShoulder && points.leftHip && points.rightHip) {
            const topLeftPin = asset.pins.filter( p => { return p.name === 'topleft'})[0];
            const topRightPin = asset.pins.filter( p => { return p.name === 'topright'})[0];
            const bottomLeftPin = asset.pins.filter( p => { return p.name === 'bottomleft'})[0];
            const bottomRightPin = asset.pins.filter( p => { return p.name === 'bottomright'})[0];

            const result = quad.render({
                topLeft: {
                    x: points.leftShoulder.position.x - topLeftPin.x * (points.rightShoulder.position.x - points.leftShoulder.position.x),
                    y: points.leftShoulder.position.y - topLeftPin.y * (points.leftHip.position.y - points.leftShoulder.position.y)
                },
                topRight: {
                    x: points.rightShoulder.position.x + (1-topRightPin.x) * (points.rightShoulder.position.x - points.leftShoulder.position.x),
                    y: points.rightShoulder.position.y - topRightPin.y * (points.leftHip.position.y - points.leftShoulder.position.y)
                },
                bottomLeft: {
                    x: points.leftHip.position.x - bottomLeftPin.x * (points.rightHip.position.x - points.leftHip.position.x),
                    y: points.leftHip.position.y + (1-bottomLeftPin.y) * (points.leftHip.position.y - points.leftShoulder.position.y),
                },
                bottomRight: {
                    x: points.rightHip.position.x + (1-bottomRightPin.x) * (points.rightHip.position.x - points.leftHip.position.x),
                    y: points.rightHip.position.y + (1-bottomRightPin.y) * (points.rightHip.position.y - points.rightShoulder.position.y)
                }
            });

            ctx.drawImage(result.canvas, result.x, result.y);
        }
    },

    drawLimb(p1, p2, ctx) {
        if (!p1 || !p2) { return; }
        const part = this.resolvePointsToSegment(p1, p2);
        if (!part) { return; }
        let asset = assets.filter( a => { return a.partname === part.name });
        if (asset.length === 0) {
            return;
        }
        asset = asset[0];
        const dist = Math.sqrt( Math.pow(p1.position.x - p2.position.x, 2) + Math.pow(p1.position.y - p2.position.y, 2));

        const top = asset.pins.filter( p => { return p.name === 'top'})[0];
        const bottom = asset.pins.filter( p => { return p.name === 'bottom'})[0];
        const pxTop = { x: top.x * asset.width, y: top.y * asset.height };
        const pxBottom = { x: bottom.x * asset.width, y: (1-bottom.y) * asset.height };

        // angular difference between pivot points x and y values
        const endPointAxisOffset = Math.asin((pxTop.x - pxBottom.x)/dist );

        // factor axis offset into angular different between p1 & p2
        let rotation = ( Math.asin((p1.position.x - p2.position.x)/dist ) );
        if (p2.position.y < p1.position.y) {
            rotation = Math.PI - rotation;
        }
        rotation -= endPointAxisOffset;

        // 0-1 scale based on vertical height of asset (minus pivots)
        const scale = dist / (asset.height - (pxTop.y + pxBottom.y));

        const m = [
            Math.cos(rotation) * scale,
            Math.sin(rotation) * scale,
            -Math.sin(rotation) * scale,
            Math.cos(rotation) * scale,
            p1.position.x,
            p1.position.y
        ];
        ctx.save();
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        ctx.drawImage(asset.image, -pxTop.x, -pxTop.y);
        ctx.restore();
    },

    async loadAssetManifest(file) {
        return new Promise( (resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = function (e) {
                resolve(JSON.parse(e.target.result));
            };
            reader.readAsText(file);
        });
    },

    async loadImage(file) {
        return new Promise( (resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            img.onload = e => {
                resolve( {
                    partname: 'unmapped',
                    image: img,
                    filename: file.name,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    pins: [] });
            };
            if (typeof file === 'string') {
                // todo: handle straight URLs //img.src = baseuri + '/' + filename;
            } else {
                img.src = URL.createObjectURL(file);
            }
        });
    }
}
