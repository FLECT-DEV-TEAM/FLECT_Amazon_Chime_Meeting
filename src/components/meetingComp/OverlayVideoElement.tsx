import * as React from 'react';
import { AppState } from '../App';
import MainOverlayVideoElement from './MainOverlayVideoElement'

interface OverlayVideoElementState{
    hoverd: boolean
}

class OverlayVideoElement extends MainOverlayVideoElement {

    render()  {
        const props = this.props as any
        const thisAttendeeId = props.thisAttendeeId
        const focusedAttendeeId = props.focusedAttendeeId
        const border = thisAttendeeId === focusedAttendeeId ? "2px solid #ff0000" : "2px solid #000000"
        return(
            <div ref={this.divRef} 
                onMouseEnter={()=>{this.state.hoverd = true;this.setState({})}} 
                onMouseLeave={()=>{this.state.hoverd=false;this.setState({})}} 
                onClick ={()=>{props.setFocusedAttendee(thisAttendeeId)}}
                >
                <video  ref={this.videoRef}  style={{ position: "absolute", width: "100%"}} />
                <canvas ref={this.canvasRef} style={{ position: "absolute", width: "100%", border: border}} />
                <canvas ref={this.statusCanvasRef} style={{position: "absolute", width: "100%"}} />
            </div>     


        )
    }
}

export default OverlayVideoElement;


