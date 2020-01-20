import EventBus from '../../eventbus.js';

const _resolutions = [
{ label: 'Camera 1920x1080 (16:9)', settings: { source: 'camera', width: 1920, height: 1080 }},
{ label: 'Camera 1280x720 (16:9)', settings: { source: 'camera', width: 1280, height: 720 }},
{ label: 'Camera 800x600 (4:3)', settings: { source: 'camera', width: 800, height: 600 }},
{ label: 'Camera 640x480 (4:3)', settings: { source: 'camera', width: 640, height: 480 }}
];

const _devices = [ { label: 'Default', id: 'default', type: 'camera' } ];

let _currentResolution = 0;
let _currentDevice = 0;
let _uploadedVideoSource = null;

export default {
    get VIDEO_SOURCE_CHANGE() { return 'onVideoSourceChange'; },

    set preferredResolutionIndex(indx) {
        _currentResolution = indx;
        const ce = new CustomEvent(this.VIDEO_SOURCE_CHANGE, {
            detail: { resolution: this.preferredResolution, device: this.currentDevice } });
        new EventBus().triggerEvent(ce)
    },

    get preferredResolutionIndex() {
        return _currentResolution;
    },

    set currentDevice(id) {
        for (let c = 0; c < _devices.length; c++) {
            if (id === _devices[c].id) {
                _currentDevice = c;
            }
        }
        const ce = new CustomEvent(this.VIDEO_SOURCE_CHANGE, { detail: this.preferredResolution, device: this.currentDevice });
        new EventBus().triggerEvent(ce)
    },

    get currentDeviceIndex() {
        return _currentDevice;
    },

    get preferredResolution() {
        return _resolutions[_currentResolution];
    },

    get currentDevice() {
        return _devices[_currentDevice];
    },

    get devices() {
        return _devices;
    },

    get resolutions() {
        return _resolutions;
    },

    set uploaded(val) {
        _uploadedVideoSource = val;
        if (!_devices.find( d => d.id === 'uploaded')) {
            _devices.push( { label: 'Uploaded Video', id: 'uploaded', type: 'video' } )
        }
    },

    get uploaded() {
        return _uploadedVideoSource;
    }
}