import {Mixins, Register, Reflect} from '../../mixins.js';
import Template from './template.js';
import EventBus from '../../eventbus.js';
import Capture from '../capture/capture.js';
import Model from '../settings/model.js';
import {drawBoundingBox, drawKeypoints, drawSegment, drawSkeleton} from "./demo_util.js";
import Skeleton from '../../skeleton.js';
import * as posenet from "@tensorflow-models/posenet";

export default class Video extends HTMLElement {
    static get observedAttributes() {
        return ['camera', 'source']
    }

    async propertyChangedCallback(name, oldval, newval) {
        switch (name) {
            case 'source':
                if (newval !== oldval) {
                    this.videoEl.src = newval;
                }
                break;
            case 'camera':
                const stream = await navigator.mediaDevices.getUserMedia({
                    'audio': false,
                    'video': {
                        width: this.model.width,
                        height: this.model.height,
                    },
                });
                this.videoEl.srcObject = stream;
                break;
        }
    }

    async connectedCallback() {
        this.init(Template, {
            width: 640,
            height: 480,

            playing: false,
            net: null,

            // since images are being fed from a webcam, we want to feed in the
            // original image and then just flip the keypoints' x coordinates. If instead
            // we flip the image, then correcting left-right keypoint pairs requires a
            // permutation on all the keypoints.
            flipPoseHorizontal: true,

            output: {
                showVideo: true,
                showSkeleton: true,
                showPoints: true,
                showBoundingBox: false,
            }
        });
        this.videoEl = this.shadowRoot.querySelector('video');
        this.canvasEl = this.shadowRoot.querySelector('canvas');
        this.ctx = this.canvasEl.getContext('2d');

        this.loadPoseNet();
        this.poseDetectionFrame();

        this.videoEl.onloadedmetadata = (event) => {
            const bounds = this.getBoundingClientRect();
            if (bounds.width > bounds.height) {
                this.model.width = bounds.width;
                this.model.height = bounds.width * event.target.videoHeight / event.target.videoWidth;
            } else {
                this.model.height = bounds.height;
                this.model.width = bounds.height * event.target.videoHeight / event.target.videoWidth;
            }
            this.videoEl.width = this.model.width;
            this.videoEl.height = this.model.height;
            this.canvasEl.width = this.model.width;
            this.canvasEl.height = this.model.height;
        };

        this.videoEl.onloadeddata = () => {
            this.videoEl.play();
            this.model.playing = true;
        };

        new EventBus().addEventListener(Model.CHANGE_SETTINGS, e => {
            // only the following keys require reloading of posenet
            if (['architecture', 'outputStride', 'multiplier', 'inputResolution', 'quantBytes'].indexOf(e.detail.key) !== -1) {
                this.loadPoseNet();
            }
        });

        new EventBus().addEventListener(Capture.TAKE_PHOTO, e => {
            const a = document.createElement('a');
            a.setAttribute('download', 'capture.png');
            a.setAttribute('href', this.canvasEl.toDataURL("image/png").replace("image/png", "image/octet-stream"));
            a.click();
        });

        new EventBus().addEventListener(Capture.RECORD_VIDEO, e => {
            if (e.detail.recording) {
                this.startRecording();
            } else {
                this.stopRecording();
            }
        });
    }

    loadPoseNet() {
        if (this.model.net) {
            this.model.net.dispose();
            this.model.net = null;
        }
        posenet.load({
            architecture: Model.input.architecture,
            outputStride: Model.input.outputStride,
            inputResolution: Model.input.inputResolution,
            multiplier: Model.input.multiplier,
            quantBytes: Model.input.quantBytes
        }).then( (net) => {
            this.model.net = net;
        });
    }

    async poseDetectionFrame() {
        if (this.model.playing && this.model.net) {
            let poses = [];
            let minPoseConfidence;
            let minPartConfidence;

            switch (Model.algorithm) {
                case 'single-pose':
                    const pose = await this.model.net.estimatePoses(this.videoEl, {
                        flipHorizontal: this.model.flipPoseHorizontal,
                        decodingMethod: 'single-person'
                    });
                    poses = poses.concat(pose);
                    minPoseConfidence = Model.singlePoseDetection.minPoseConfidence;
                    minPartConfidence = Model.singlePoseDetection.minPartConfidence;
                    break;
                case 'multi-pose':
                    let all_poses = await this.model.net.estimatePoses(this.videoEl, {
                        flipHorizontal: this.model.flipPoseHorizontal,
                        decodingMethod: 'multi-person',
                        maxDetections: Model.multiPoseDetection.maxPoseDetections,
                        scoreThreshold: Model.multiPoseDetection.minPartConfidence,
                        nmsRadius: Model.multiPoseDetection.nmsRadius
                    });

                    poses = poses.concat(all_poses);
                    minPoseConfidence = Model.multiPoseDetection.minPoseConfidence;
                    minPartConfidence = Model.multiPoseDetection.minPartConfidence;
                    break;
            }

            this.ctx.clearRect(0, 0, this.model.width, this.model.height);

            if (this.model.output.showVideo) {
                this.ctx.save();
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.model.width, 0);
                this.ctx.drawImage(this.videoEl, 0, 0, this.model.width, this.model.height);
                this.ctx.restore();
            }

            // For each pose (i.e. person) detected in an image, loop through the poses
            // and draw the resulting skeleton and keypoints if over certain confidence
            // scores
            poses.forEach(({score, keypoints}) => {
                if (score >= minPoseConfidence) {
                    if (this.model.output.showPoints) {
                        drawKeypoints(keypoints, minPartConfidence, this.ctx);
                    }
                    if (this.model.output.showSkeleton) {
                        //drawSkeleton(keypoints, minPartConfidence, this.ctx);
                        const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minPoseConfidence);

                        const points = {};
                        adjacentKeyPoints.forEach((keypoints) => {
                            points[keypoints[0].part] = keypoints[0];
                            points[keypoints[1].part] = keypoints[1];
                        });
                        Skeleton.drawTorso(points, this.ctx);
                        Skeleton.drawLimb(points.rightShoulder, points.rightElbow, this.ctx);
                        Skeleton.drawLimb(points.rightElbow, points.rightWrist, this.ctx);
                        Skeleton.drawLimb(points.leftShoulder, points.leftElbow, this.ctx);
                        Skeleton.drawLimb(points.leftElbow, points.leftWrist, this.ctx);

                        Skeleton.drawLimb(points.rightHip, points.rightKnee, this.ctx);
                        Skeleton.drawLimb(points.rightKnee, points.rightAnkle, this.ctx);
                        Skeleton.drawLimb(points.leftHip, points.leftKnee, this.ctx);
                        Skeleton.drawLimb(points.leftKnee, points.leftAnkle, this.ctx);
                    }
                    if (this.model.output.showBoundingBox) {
                        drawBoundingBox(keypoints, this.ctx);
                    }
                }
            });
        }

        requestAnimationFrame( () => this.poseDetectionFrame());
    }

    startRecording() {
        let options = {mimeType: 'video/webm'};
        let sourceBuffer;
        const recordedBlobs = [];
        const stream = this.canvasEl.captureStream();
        this.mediaRecorder = new MediaRecorder(stream, options);
        this.mediaRecorder.onstop = (event) => {
            const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
            const video = document.createElement('video');
            video.src = window.URL.createObjectURL(superBuffer);

            const blob = new Blob(recordedBlobs, {type: 'video/webm'});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'test.webm';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        };
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedBlobs.push(event.data);
            }
        };
        this.mediaRecorder.start(100); // collect 100ms of data
        const mediaSource = new MediaSource();
        mediaSource.addEventListener('sourceopen', () => {
            sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        }, false);
    }

    stopRecording() {
        this.mediaRecorder.stop();
        console.log('Stop Recording');
    }

}

Register('dy-video', Video, Mixins);
