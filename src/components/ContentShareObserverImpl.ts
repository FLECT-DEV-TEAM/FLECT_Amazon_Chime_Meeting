import { ContentShareObserver } from "amazon-chime-sdk-js";
import App from "./App";


class ContentShareObserverImpl implements ContentShareObserver{
    app:App
    props:any
    constructor(app:App, props:any){
        this.app = app
        this.props = props
    }
    contentShareDidStart(): void {
        console.log('content share started.');
    }

    contentShareDidStop(): void {
        console.log('content share stopped.');
    }

    contentShareDidPause(): void {
        console.log('content share paused.');
    }

    contentShareDidUnpause(): void {
        console.log(`content share unpaused.`);
    }
}

export default ContentShareObserverImpl