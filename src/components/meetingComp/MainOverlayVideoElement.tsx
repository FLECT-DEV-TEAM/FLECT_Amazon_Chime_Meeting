import * as React from 'react';
import {AppState} from '../App';

interface MainOverlayVideoElementState{
    hoverd: boolean
}

class MainOverlayVideoElement extends React.Component{
    divRef    = React.createRef<HTMLDivElement>()
    videoRef  = React.createRef<HTMLVideoElement>()
    canvasRef = React.createRef<HTMLCanvasElement>()
    statusCanvasRef = React.createRef<HTMLCanvasElement>()

    state: MainOverlayVideoElementState = {
        hoverd : false
    }
    statusImages: { [key: string]: HTMLImageElement } = {}


    fillText = (text:string, x:number, y:number) =>{
        this.canvasRef.current!.getContext("2d")!.fillText(text, x, y)
    }
    clearCanvas = () =>{
        const ctx = this.canvasRef.current!.getContext("2d")!
        ctx.clearRect(0, 0, this.canvasRef.current!.width, this.canvasRef.current!.height)
    }
    putStamp = (dstAttendeeId:string, image:HTMLImageElement, startTime:number, elapsed:number) =>{
        const props = this.props as any
        const thisAttendeeId = props.thisAttendeeId

        if(dstAttendeeId !== thisAttendeeId){
            return
        }

        const width = Math.floor(this.canvasRef.current!.width / 15)
        
        const ctx = this.canvasRef.current!.getContext("2d")!
        // console.log("STAMP SIZE1", image.width, image.height, width)
        // console.log("STAMP SIZE2", this.canvasRef.current!.width, this.canvasRef.current!.height, this.videoRef.current!.scrollWidth, this.videoRef.current!.scrollHeight)
        console.log("putStamp", dstAttendeeId, thisAttendeeId)
        console.log("putStamp", props)
        console.log("putStamp", image)
        ctx.drawImage(image, this.canvasRef.current!.width - ((startTime % 5) * 20 + width+10), this.canvasRef.current!.height -  this.canvasRef.current!.height * (elapsed / 3000), width, width)
    }


    putMessage = (dstAttendeeId:string, message:string, startTime:number, elapsed:number) =>{
        const props = this.props as any
        const thisAttendeeId = props.thisAttendeeId
        if(dstAttendeeId !== thisAttendeeId){
            return
        }

        const canvasHeight = this.canvasRef.current!.height
        const fontSize     = Math.ceil(canvasHeight / 12)

        const ctx = this.canvasRef.current!.getContext("2d")!
        ctx.font = `${fontSize}px メイリオ`;
        ctx.textBaseline = 'top';
        const textWidth   = ctx.measureText(message).width;
        const textOffsetX = this.canvasRef.current!.width - (textWidth+10)
        const textOffsetY = this.canvasRef.current!.height -  this.canvasRef.current!.height * (elapsed / 3000)        

        ctx.fillStyle = '#000000';
        ctx.fillText(message, textOffsetX, textOffsetY);        

    }

    getVideoRef = () =>{
        return this.videoRef
    }
    fitSize = () =>{
        const sheight = this.videoRef.current!.scrollHeight
        // const swidth = this.videoRef.current!.scrollWidth
        this.divRef.current!.style.height = `${sheight}px`
        // this.canvasRef.current!.style.height = `${sheight}px`
        this.canvasRef.current!.width = this.videoRef.current!.scrollWidth
        this.canvasRef.current!.height = this.videoRef.current!.scrollHeight
        this.statusCanvasRef.current!.width = this.videoRef.current!.scrollWidth
        this.statusCanvasRef.current!.height = this.videoRef.current!.scrollHeight
    }

    componentDidMount() {
        const mute = new Image()
        mute.src = "/resources/system/microphone_rokuon_kinshi_mark.png"
        mute.onload = () => {
            this.statusImages['mute'] = mute
        }
        const noMute = new Image()
        noMute.src = "/resources/system/demo-image.png .png"
        noMute.onload = () => {
            this.statusImages['noMute'] = noMute
        }
    }

    render()  {

        return(
            <div ref={this.divRef} >
                <video  ref={this.videoRef}  style={{position: "absolute", width: "100%"}} />
                <canvas ref={this.canvasRef} style={{position: "absolute", width: "100%"}} />
                <canvas ref={this.statusCanvasRef} style={{position: "absolute", width: "100%"}} />

            </div>
        )
    }

    tmpStatusCanvas = document.createElement("canvas")
    drawStatus = () =>{
        const props = this.props as any
        const thisAttendeeId = props.thisAttendeeId        
        const appState = this.props as AppState
        const attendee = appState.roster[thisAttendeeId]
        if(attendee == undefined){
            console.log("UNDEFINED", props)
            return
        }
        if(this.statusImages['mute'] === undefined || this.statusImages['noMute'] === undefined){
            console.log("Loading", props)
            return
        }
        const name = (attendee.name !== undefined && attendee.name !== null)? attendee.name!.substring(0,20) : "unknown"

        const mute = attendee.muted

        const canvasWidth  = this.statusCanvasRef.current!.width
        const canvasHeight = this.statusCanvasRef.current!.height
        const fontSize     = Math.ceil(canvasHeight / 12)

        const ctx = this.statusCanvasRef.current!.getContext("2d")!
        ctx.font = `${fontSize}px メイリオ`;
        ctx.textBaseline = 'top';

        const imageWidth  = fontSize
        const imageHeight = fontSize
        const textWidth   = ctx.measureText(name).width;
        const textHeight  = fontSize
        const micImageKey = mute ? 'mute' : 'noMute'
        const offsetX = 10
        const offsetY = 10
        ctx.fillStyle = '#ddcccc';
        ctx.fillRect(offsetX, offsetY, imageWidth+textWidth, textHeight)
        ctx.drawImage(this.statusImages[micImageKey], offsetX, offsetY, imageWidth, imageHeight)
        ctx.fillStyle = '#000000';
        ctx.fillText(name, offsetX + imageWidth, offsetY);

    }

    componentDidUpdate = () => {
        console.log("componentDidUpdate Overlay")
        this.fitSize()
        this.drawStatus()
    }
}

export default MainOverlayVideoElement;


