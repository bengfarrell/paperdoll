import EventBus from '../../eventbus.js';

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = 0.75;
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

const defaultResNetMultiplier = 1.0;
const defaultResNetStride = 32;
const defaultResNetInputResolution = 250;

export default {
    get CHANGE_SETTINGS() { return 'onChangeSettings'; },

    setValue(category, key, value) {
        let uiNeedsUpdate = false;
        if (category) {
            this[category][key] = value;
        } else {
            this[key] = value;
        }

        // reset to defaults because switching architectures means that some options aren't available
        if (key === 'architecture') {
            if (value === 'MobileNetV1') {
                this.input.outputStride = defaultMobileNetStride;
                this.input.multiplier = defaultMobileNetMultiplier;
                this.input.inputResolution = defaultMobileNetInputResolution;
            } else {
                this.input.outputStride = defaultResNetStride;
                this.input.multiplier = defaultResNetMultiplier;
                this.input.inputResolution = defaultResNetInputResolution;
            }
            uiNeedsUpdate = true;
        }

        const ce = new CustomEvent(this.CHANGE_SETTINGS, {
            detail: {
                category: category,
                key: key,
                value: value
        }});
        new EventBus().triggerEvent(ce);
        return uiNeedsUpdate;
    },

    algorithm: 'multi-pose',
    input: {
        architecture: 'MobileNetV1',
        outputStride: defaultMobileNetStride,
        outputStrideOptions: {
            "MobileNetV1": [8, 16],
            "ResNet50": [32, 16]
        },
        inputResolution: defaultMobileNetInputResolution,
        multiplier: defaultMobileNetMultiplier,
        quantBytes: defaultQuantBytes,


      /*  function updateGui() {
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
}*/
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

}
