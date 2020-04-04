import {Mixins, Register, Reflect} from '../../mixins.js';
import Template from './template.js';
import EventBus from '../../eventbus.js';
import Capture from '../capture/capture.js';
import Model from '../settings/model.js';
import VideoModel from './model.js';
import {drawBoundingBox, drawKeypoints, drawSegment, drawSkeleton} from "./demo_util.js";
import Skeleton from '../../skeleton.js';
import * as posenet from "@tensorflow-models/posenet";

export default class Video extends HTMLElement {
    async connectedCallback() {
        this.init(Template, {
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
                showPoints: false,
                showBoundingBox: false,
            }
        });
        this.videoEl = this.shadowRoot.querySelector('video');
        this.displayCanvasEl = this.shadowRoot.querySelector('canvas');
        this.displayctx = this.displayCanvasEl.getContext('2d');

        this.fullsizeCanvas = document.createElement('canvas');
        this.fullsizeContext = this.fullsizeCanvas.getContext('2d');

        this.loadPoseNet();
        this.poseDetectionFrame();

        this.videoEl.onloadedmetadata = (event) => {
            // reset model dimensions for arbitrary loaded MP4
            this.model.videoWidth = this.videoEl.videoWidth;
            this.model.videoHeight = this.videoEl.videoHeight;

            const bounds = this.getBoundingClientRect();
            this.videoEl.width = this.model.videoWidth;
            this.videoEl.height = this.model.videoHeight;
            this.fullsizeCanvas.width = this.model.videoWidth;
            this.fullsizeCanvas.height = this.model.videoHeight;
            this.displayCanvasEl.width = bounds.width;
            this.displayCanvasEl.height = bounds.height;
        };

        this.videoEl.onloadeddata = () => {
            this.videoEl.play();
            this.model.playing = true;
        };

        document.body.onresize = () => {
            const bounds = this.getBoundingClientRect();
            this.displayCanvasEl.width = bounds.width;
            this.displayCanvasEl.height = bounds.height;
        };

        new EventBus().addEventListener(VideoModel.VIDEO_SOURCE_CHANGE, e => {
            this.model.playing = false;

            // video is uploaded, just set source and exit
            if (VideoModel.currentDevice.id === 'uploaded') {
                this.videoEl.srcObject = null;
                this.videoEl.src = VideoModel.uploaded;
                return;
            }

            // video is from camera - set the correct
            const videosrc = {
                width: VideoModel.preferredResolution.settings.width,
                height: VideoModel.preferredResolution.settings.height,
            };

            if (VideoModel.currentDevice.id !== 'default') {
                videosrc.deviceId = VideoModel.currentDevice.id
            }

            const stream = navigator.mediaDevices.getUserMedia({
                'audio': false,
                'video': videosrc
            }).then( (stream) => {
                this.videoEl.srcObject = stream;
            });
        });

        new EventBus().addEventListener(Model.CHANGE_SETTINGS, e => {
            // only the following keys require reloading of posenet
            if (['architecture', 'outputStride', 'multiplier', 'inputResolution', 'quantBytes'].indexOf(e.detail.key) !== -1) {
                this.loadPoseNet();
            }
        });

        new EventBus().addEventListener(Capture.TAKE_PHOTO, e => {
            const userAgent = navigator.userAgent.toLowerCase();
            const filename = e.detail;
            if (userAgent.indexOf(' electron/') > -1) {
                // Electron-specific code
                const fs = require('fs');
                const os = require('os');
                const binaryData = new Buffer(this.fullsizeCanvas.toDataURL("image/png").replace(/^data:image\/png;base64,/,""), 'base64').toString('binary');
                fs.writeFile(`${os.homedir()}/Desktop/out/${filename}.png`, binaryData, 'binary',() => {
                    console.log('file written', `${os.homedir()}/Desktop/out/${filename}.png`);
                });
            } else {
                const a = document.createElement('a');
                console.log(filename);
                a.setAttribute('download', `${filename}.jpg`);
                a.setAttribute('href', this.fullsizeCanvas.toDataURL("image/jpg", .7).replace("image/jpg", "image/octet-stream"));
                a.click();
            }
        });

        new EventBus().addEventListener(Capture.RECORD_VIDEO, e => {
            if (e.detail.recording) {
                this.startRecording(e.detail.name);
            } else {
                this.stopRecording();
            }
        });

        const stream = await navigator.mediaDevices.getUserMedia({
            'audio': false,
            'video': {
                width: VideoModel.preferredResolution.settings.width,
                height: VideoModel.preferredResolution.settings.height,
            },
        });
        this.videoEl.srcObject = stream;
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

            this.fullsizeContext.clearRect(0, 0, this.model.videoWidth, this.model.videoHeight);

            if (this.model.output.showVideo) {
                this.fullsizeContext.save();
                this.fullsizeContext.scale(-1, 1);
                this.fullsizeContext.translate(-this.model.videoWidth, 0);
                this.fullsizeContext.drawImage(this.videoEl, 0, 0, this.model.videoWidth, this.model.videoHeight);
                this.fullsizeContext.restore();
            }

            // For each pose (i.e. person) detected in an image, loop through the poses
            // and draw the resulting skeleton and keypoints if over certain confidence
            // scores
            poses.forEach(({score, keypoints}) => {
                if (score >= minPoseConfidence) {
                    if (this.model.output.showSkeleton) {
                        //drawSkeleton(keypoints, minPartConfidence, this.ctx);
                        const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minPoseConfidence);

                        const points = {};
                        adjacentKeyPoints.forEach((keypoints) => {
                            points[keypoints[0].part] = keypoints[0];
                            points[keypoints[1].part] = keypoints[1];
                        });
                        Skeleton.drawTorso(points, this.fullsizeContext);
                        Skeleton.drawHead(keypoints.find( o => o.part === 'leftEye'), keypoints.find( o => o.part === 'rightEye'), this.fullsizeContext);
                        Skeleton.drawLimb(points.rightShoulder, points.rightElbow, this.fullsizeContext);
                        Skeleton.drawLimb(points.rightElbow, points.rightWrist, this.fullsizeContext);
                        Skeleton.drawLimb(points.leftShoulder, points.leftElbow, this.fullsizeContext);
                        Skeleton.drawLimb(points.leftElbow, points.leftWrist, this.fullsizeContext);

                        Skeleton.drawLimb(points.rightHip, points.rightKnee, this.fullsizeContext);
                        Skeleton.drawLimb(points.rightKnee, points.rightAnkle, this.fullsizeContext);
                        Skeleton.drawLimb(points.leftHip, points.leftKnee, this.fullsizeContext);
                        Skeleton.drawLimb(points.leftKnee, points.leftAnkle, this.fullsizeContext);
                    }
                    if (this.model.output.showPoints) {
                        drawKeypoints(keypoints, minPartConfidence, this.fullsizeContext);
                    }
                    if (this.model.output.showBoundingBox) {
                        drawBoundingBox(keypoints, this.fullsizeContext);
                    }
                }
            });
        }

        const bounds = this.getBoundingClientRect();
        const displaySize = {};
        if (bounds.width > bounds.height) {
            displaySize.width = bounds.width;
            displaySize.height = bounds.width * this.model.videoHeight / this.model.videoWidth;
        } else {
            displaySize.height = bounds.height;
            displaySize.width = bounds.height * this.model.videoHeight / this.model.videoWidth;
        }

        const drawSize = this.getSizeToFit(this.fullsizeCanvas.width, this.fullsizeCanvas.height, this.displayCanvasEl.width, this.displayCanvasEl.height);
        this.displayctx.drawImage(this.fullsizeCanvas, 0, 0, this.fullsizeCanvas.width, this.fullsizeCanvas.height, (this.displayCanvasEl.width - drawSize.computedWidth)/2, (this.displayCanvasEl.height - drawSize.computedHeight)/2, drawSize.computedWidth, drawSize.computedHeight);

        requestAnimationFrame( () => this.poseDetectionFrame());
    }

    getSizeToFit(currentWidth, currentHeight, desiredWidth, desiredHeight) {

        // get the aspect ratios in case we need to expand or shrink to fit
        var imageAspectRatio    = currentWidth/currentHeight;
        var targetAspectRatio   = desiredWidth/desiredHeight;

        // no need to adjust the size if current size is square
        var adjustedWidth       = desiredWidth;
        var adjustedHeight      = desiredHeight;

        // get the larger aspect ratio of the two
        // if aspect ratio is 1 then no adjustment needed
        if (imageAspectRatio > targetAspectRatio) {
            adjustedHeight = desiredWidth / imageAspectRatio;
        }
        else if (imageAspectRatio < targetAspectRatio) {
            adjustedWidth = desiredHeight * imageAspectRatio;
        }

        // set the adjusted size (same if square)
        var newSizes = {};
        newSizes.computedWidth = adjustedWidth;
        newSizes.computedHeight = adjustedHeight;

        return newSizes;
    }

    startRecording(filename) {
        let options = {mimeType: 'video/webm'};
        let sourceBuffer;
        const recordedBlobs = [];
        const stream = this.displayCanvasEl.captureStream();
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
            a.download = `${filename}.webm`;
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
