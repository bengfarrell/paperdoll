import {
    createProgramInfo,
    createBufferInfoFromArrays,
    setBuffersAndAttributes,
    setUniforms,
    drawBufferInfo,
    createTexture } from '../node_modules/twgl.js/dist/4.x/twgl-full.module.js';

export default class {
    constructor(texture) {
        if (texture) { this.texture = texture; }
        this.glCanvas = document.createElement('canvas');
        this.glContext = this.glCanvas.getContext("webgl", { premultipliedAlpha: false } );
        this.programInfo = createProgramInfo(this.glContext, [`
            attribute vec4 position;
            attribute vec2 a_texcoord;
            varying vec2 v_texCoord;
    
            void main() {
                gl_Position = position;
                v_texCoord = a_texcoord;
            }`, `        
            precision mediump float;

            varying vec4 v_position;
            varying vec2 v_texCoord;
            uniform sampler2D u_texture;
    
            void main() {
              gl_FragColor = texture2D(u_texture, v_texCoord);
            }`]);
    }

    set texture(img) {
        this.imgSource = img;
        this.glTexture = createTexture(this.glContext, { src: img, flipY: true });
    }

    get texture() {
        return this.imgSource;
    }

    render(points) {
        if (!this.glTexture) { return; }

        const minX = Math.min(points.topLeft.x, points.topRight.x, points.bottomLeft.x, points.bottomRight.x );
        const maxX = Math.max(points.topLeft.x, points.topRight.x, points.bottomLeft.x, points.bottomRight.x );
        const minY = Math.min(points.topLeft.y, points.topRight.y, points.bottomLeft.y, points.bottomRight.y );
        const maxY = Math.max(points.topLeft.y, points.topRight.y, points.bottomLeft.y, points.bottomRight.y );
        const width = maxX - minX;
        const height = maxY - minY;
        this.glCanvas.width = width;
        this.glCanvas.height = height;

        const vertices = [];

        Object.keys(points).forEach( pos => {
            const setRelativeCoords = function(vertpos, pt) {
                vertices[vertpos] = -1 + ((pt.x - minX) / width) * 2;
                vertices[vertpos+1] = 1 - ((pt.y - minY) / height) * 2;
                vertices[vertpos+2] = 0;
            };

            switch (pos) {
                case 'topLeft': // shared edge
                    setRelativeCoords(6, points[pos]);
                    setRelativeCoords(9, points[pos]);
                    break;

                case 'bottomRight': //shared edge
                    setRelativeCoords(3, points[pos]);
                    setRelativeCoords(12, points[pos]);
                    break;

                case 'bottomLeft':
                    setRelativeCoords(0, points[pos]);
                    break;

                case 'topRight':
                    setRelativeCoords(15, points[pos]);
                    break;
            }
        });

        const arrays = {
            position: vertices,
            a_texcoord: [0.0,  0.0, 1.0,  0.0, 0.0,  1.0, 0.0,  1.0, 1.0,  0.0, 1.0,  1.0]
        };
        const bufferInfo = createBufferInfoFromArrays(this.glContext, arrays);
        this.glContext.viewport(0, 0, this.glContext.canvas.width, this.glContext.canvas.height);

        const uniforms = { u_texture: this.glTexture };
        this.glContext.useProgram(this.programInfo.program);
        setBuffersAndAttributes(this.glContext, this.programInfo, bufferInfo);
        setUniforms(this.programInfo, uniforms);
        drawBufferInfo(this.glContext, bufferInfo);
        return { x: minX, y: minY, width: width, height: height, canvas: this.glCanvas };
    }

}
