import { AudioVideoObserver, MeetingSessionStatus, MeetingSessionStatusCode, VideoTileState, ClientMetricReport, MeetingSessionVideoAvailability } from "amazon-chime-sdk-js";
import App from "./App";


class AudioVideoObserverImpl implements AudioVideoObserver{
    app:App
    constructor(app:App){
        this.app = app
    }
    
    audioVideoDidStartConnecting(reconnecting: boolean): void {
        console.log(`session connecting. reconnecting: ${reconnecting}`);
    }
    audioVideoDidStart(): void {
        console.log('session started');
    }
    audioVideoDidStop(sessionStatus: MeetingSessionStatus): void {
        console.log(`session stopped from ${JSON.stringify(sessionStatus)}`);
        if (sessionStatus.statusCode() === MeetingSessionStatusCode.AudioCallEnded) {
            console.log(`meeting ended`);
            // @ts-ignore
            //window.location = window.location.pathname;
        }
    }

    videoTileDidUpdate(tileState: VideoTileState): void {
        this.app.updateVideoTileState(tileState)
    }

    videoTileWasRemoved(tileId: number): void {
        //console.log(`video tile removed: ${tileId}`);
        this.app.removeVideoTileState(tileId)
        // this.hideTile(this.gs.tileOrganizer!.releaseTileIndex(tileId));
    }
    videoAvailabilityDidChange(availability: MeetingSessionVideoAvailability): void {
        //this.canStartLocalVideo = availability.canStartLocalVideo;
        console.log(`video availability changed: canStartLocalVideo `, availability);
        console.log(`video availability changed: canStartLocalVideo  ${availability.canStartLocalVideo}`);
    }

    ////// videoSendHealthDidChange
    ////// videoSendBandwidthDidChange
    ////// videoReceiveBandwidthDidChange
    estimatedDownlinkBandwidthLessThanRequired(estimatedDownlinkBandwidthKbps: number, requiredVideoDownlinkBandwidthKbps: number): void {
        console.log(`Estimated downlink bandwidth is ${estimatedDownlinkBandwidthKbps} is less than required bandwidth for video ${requiredVideoDownlinkBandwidthKbps}`);
    }
    ////// videoNotReceivingEnoughData?(receivingDataMap

    metricsDidReceive(clientMetricReport: ClientMetricReport): void {
        //const metricReport = clientMetricReport.getObservableMetrics();
        //console.log("metricsDidReceive", metricReport)
        // if (typeof metricReport.availableSendBandwidth === 'number' && !isNaN(metricReport.availableSendBandwidth)) {
        //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Uplink Bandwidth: ' + String(metricReport.availableSendBandwidth / 1000) + ' Kbps';
        // } else if (typeof metricReport.availableOutgoingBitrate === 'number' && !isNaN(metricReport.availableOutgoingBitrate)) {
        //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Uplink Bandwidth: ' + String(metricReport.availableOutgoingBitrate / 1000) + ' Kbps';
        // } else {
        //     (document.getElementById('video-uplink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Uplink Bandwidth: Unknown';
        // }

        // if (typeof metricReport.availableReceiveBandwidth === 'number' && !isNaN(metricReport.availableReceiveBandwidth)) {
        //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Downlink Bandwidth: ' + String(metricReport.availableReceiveBandwidth / 1000) + ' Kbps';
        // } else if (typeof metricReport.availableIncomingBitrate === 'number' && !isNaN(metricReport.availableIncomingBitrate)) {
        //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Downlink Bandwidth: ' + String(metricReport.availableIncomingBitrate / 1000) + ' Kbps';
        // } else {
        //     (document.getElementById('video-downlink-bandwidth') as HTMLSpanElement).innerHTML =
        //         'Available Downlink Bandwidth: Unknown';
        // }
    }
    ////// connectionHealthDidChange

    connectionDidBecomePoor(): void {
        console.log('connection is poor');
    }
    connectionDidSuggestStopVideo(): void {
        console.log('suggest turning the video off');
    }
    videoSendDidBecomeUnavailable(): void {
        console.log('sending video is not available');
    }
}

export default AudioVideoObserverImpl