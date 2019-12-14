import * as posenet from '@tensorflow-models/posenet';
import * as dat from 'dat.gui';

import {drawBoundingBox, drawKeypoints, drawSkeleton, isMobile, toggleLoadingUI, tryResNetButtonName, tryResNetButtonText, updateTryResNetButtonDatGuiCss} from './demo_util.js';

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = 0.75;
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

const defaultResNetMultiplier = 1.0;
const defaultResNetStride = 32;
const defaultResNetInputResolution = 250;

const guiState = {
    algorithm: 'multi-pose',
    input: {
        architecture: 'MobileNetV1',
        outputStride: defaultMobileNetStride,
        inputResolution: defaultMobileNetInputResolution,
        multiplier: defaultMobileNetMultiplier,
        quantBytes: defaultQuantBytes
    },
    singlePoseDetection: {
        minPoseConfidence: 0.1,
        minPartConfidence: 0.5,
    },
    multiPoseDetection: {
        maxPoseDetections: 5,
        minPoseConfidence: 0.15,
        minPartConfidence: 0.1,
        nmsRadius: 30.0,
    },
    output: {
        showVideo: true,
        showSkeleton: true,
        showPoints: true,
        showBoundingBox: false,
    },
    net: null,
};

/**
 * Sets up dat.gui controller on the top-right of the window
 */
function setupGui(cameras, net) {
    guiState.net = net;

    if (cameras.length > 0) {
        guiState.camera = cameras[0].deviceId;
    }

    const gui = new dat.GUI({width: 300});

    let architectureController = null;
    guiState[tryResNetButtonName] = function() {
        architectureController.setValue('ResNet50')
    };
    gui.add(guiState, tryResNetButtonName).name(tryResNetButtonText);
    updateTryResNetButtonDatGuiCss();

    // The single-pose algorithm is faster and simpler but requires only one
    // person to be in the frame or results will be innaccurate. Multi-pose works
    // for more than 1 person
    const algorithmController =
        gui.add(guiState, 'algorithm', ['single-pose', 'multi-pose']);

    // The input parameters have the most effect on accuracy and speed of the
    // network
    let input = gui.addFolder('Input');
    // Architecture: there are a few PoseNet models varying in size and
    // accuracy. 1.01 is the largest, but will be the slowest. 0.50 is the
    // fastest, but least accurate.
    architectureController =
        input.add(guiState.input, 'architecture', ['MobileNetV1', 'ResNet50']);
    guiState.architecture = guiState.input.architecture;
    // Input resolution:  Internally, this parameter affects the height and width
    // of the layers in the neural network. The higher the value of the input
    // resolution the better the accuracy but slower the speed.
    let inputResolutionController = null;
    function updateGuiInputResolution(
        inputResolution,
        inputResolutionArray,
    ) {
        if (inputResolutionController) {
            inputResolutionController.remove();
        }
        guiState.inputResolution = inputResolution;
        guiState.input.inputResolution = inputResolution;
        inputResolutionController =
            input.add(guiState.input, 'inputResolution', inputResolutionArray);
        inputResolutionController.onChange(function(inputResolution) {
            guiState.changeToInputResolution = inputResolution;
        });
    }

    // Output stride:  Internally, this parameter affects the height and width of
    // the layers in the neural network. The lower the value of the output stride
    // the higher the accuracy but slower the speed, the higher the value the
    // faster the speed but lower the accuracy.
    let outputStrideController = null;
    function updateGuiOutputStride(outputStride, outputStrideArray) {
        if (outputStrideController) {
            outputStrideController.remove();
        }
        guiState.outputStride = outputStride;
        guiState.input.outputStride = outputStride;
        outputStrideController =
            input.add(guiState.input, 'outputStride', outputStrideArray);
        outputStrideController.onChange(function(outputStride) {
            guiState.changeToOutputStride = outputStride;
        });
    }

    // Multiplier: this parameter affects the number of feature map channels in
    // the MobileNet. The higher the value, the higher the accuracy but slower the
    // speed, the lower the value the faster the speed but lower the accuracy.
    let multiplierController = null;
    function updateGuiMultiplier(multiplier, multiplierArray) {
        if (multiplierController) {
            multiplierController.remove();
        }
        guiState.multiplier = multiplier;
        guiState.input.multiplier = multiplier;
        multiplierController =
            input.add(guiState.input, 'multiplier', multiplierArray);
        multiplierController.onChange(function(multiplier) {
            guiState.changeToMultiplier = multiplier;
        });
    }

    // QuantBytes: this parameter affects weight quantization in the ResNet50
    // model. The available options are 1 byte, 2 bytes, and 4 bytes. The higher
    // the value, the larger the model size and thus the longer the loading time,
    // the lower the value, the shorter the loading time but lower the accuracy.
    let quantBytesController = null;
    function updateGuiQuantBytes(quantBytes, quantBytesArray) {
        if (quantBytesController) {
            quantBytesController.remove();
        }
        guiState.quantBytes = +quantBytes;
        guiState.input.quantBytes = +quantBytes;
        quantBytesController =
            input.add(guiState.input, 'quantBytes', quantBytesArray);
        quantBytesController.onChange(function(quantBytes) {
            guiState.changeToQuantBytes = +quantBytes;
        });
    }

    function updateGui() {
        if (guiState.input.architecture === 'MobileNetV1') {
            updateGuiInputResolution(
                defaultMobileNetInputResolution,
                [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800]);
            updateGuiOutputStride(defaultMobileNetStride, [8, 16]);
            updateGuiMultiplier(defaultMobileNetMultiplier, [0.50, 0.75, 1.0]);
        } else {  // guiState.input.architecture === "ResNet50"
            updateGuiInputResolution(
                defaultResNetInputResolution,
                [200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800]);
            updateGuiOutputStride(defaultResNetStride, [32, 16]);
            updateGuiMultiplier(defaultResNetMultiplier, [1.0]);
        }
        updateGuiQuantBytes(defaultQuantBytes, [1, 2, 4]);
    }

    updateGui();
    input.open();
    // Pose confidence: the overall confidence in the estimation of a person's
    // pose (i.e. a person detected in a frame)
    // Min part confidence: the confidence that a particular estimated keypoint
    // position is accurate (i.e. the elbow's position)
    let single = gui.addFolder('Single Pose Detection');
    single.add(guiState.singlePoseDetection, 'minPoseConfidence', 0.0, 1.0);
    single.add(guiState.singlePoseDetection, 'minPartConfidence', 0.0, 1.0);

    let multi = gui.addFolder('Multi Pose Detection');
    multi.add(guiState.multiPoseDetection, 'maxPoseDetections')
        .min(1)
        .max(20)
        .step(1);
    multi.add(guiState.multiPoseDetection, 'minPoseConfidence', 0.0, 1.0);
    multi.add(guiState.multiPoseDetection, 'minPartConfidence', 0.0, 1.0);
    // nms Radius: controls the minimum distance between poses that are returned
    // defaults to 20, which is probably fine for most use cases
    multi.add(guiState.multiPoseDetection, 'nmsRadius').min(0.0).max(40.0);
    multi.open();

    let output = gui.addFolder('Output');
    output.add(guiState.output, 'showVideo');
    output.add(guiState.output, 'showSkeleton');
    output.add(guiState.output, 'showPoints');
    output.add(guiState.output, 'showBoundingBox');
    output.open();


    architectureController.onChange(function(architecture) {
        // if architecture is ResNet50, then show ResNet50 options
        updateGui();
        guiState.changeToArchitecture = architecture;
    });

    algorithmController.onChange(function(value) {
        switch (guiState.algorithm) {
            case 'single-pose':
                multi.close();
                single.open();
                break;
            case 'multi-pose':
                single.close();
                multi.open();
                break;
        }
    });
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {
    //toggleLoadingUI(true);
    const net = await posenet.load({
        architecture: guiState.input.architecture,
        outputStride: guiState.input.outputStride,
        inputResolution: guiState.input.inputResolution,
        multiplier: guiState.input.multiplier,
        quantBytes: guiState.input.quantBytes
    });

    //toggleLoadingUI(false);

    const video = document.querySelector('dy-video');
    video.source = 'test.mp4';

    setupGui([], net);
    //detectPoseInRealTime(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// kick off the demo
bindPage();
