import * as React from 'react';
import {AppState, addDataMessageConsumers} from '../App';
import { WSStamp } from '../WebsocketApps/Stamp'
import { WSText } from '../WebsocketApps/Text'
import { DrawingType } from '../WebsocketApps/DrawingBySignal';

export interface MainOverlayVideoElementState{
    hoverd           : boolean
    inDrawing        : boolean // mouse pressed or not
    inDrawingMode    : boolean // drawingMode flag or not
    enableDrawing    : boolean // this component support the drawing feature or not
    drawingStroke    : string
    drawingLineWidth : number
    erasing          : boolean

    previousX        : number
    previousY        : number
}

class MainOverlayVideoElement extends React.Component{
    divRef    = React.createRef<HTMLDivElement>()
    videoRef  = React.createRef<HTMLVideoElement>()
    canvasRef = React.createRef<HTMLCanvasElement>()
    statusCanvasRef = React.createRef<HTMLCanvasElement>()

    drawingCanvas = document.createElement("canvas")

    state: MainOverlayVideoElementState = {
        hoverd : false,
        inDrawing: false,
        inDrawingMode: false,
        enableDrawing: true,
        drawingStroke: "black",
        drawingLineWidth: 2,
        erasing: false,
        previousX :0,
        previousY :0,
    }
    statusImages: { [key: string]: HTMLImageElement } = {}
    drawingStart = () =>{
        this.setState({inDrawing:true}
    )}
    drawing = (offsetX:number, offsetY:number, movementX:number, movementY:number) =>{
        const props = this.props as any
        //console.log("drawing", this.state.inDrawing, offsetX, offsetY)
        if(this.state.inDrawing && this.state.inDrawingMode && this.state.enableDrawing){
            const startX = offsetX - movementX
            const startY = offsetY - movementY

            const startXR = startX  / this.drawingCanvas.width!
            const startYR = startY  / this.drawingCanvas.height!
            const endXR   = offsetX / this.drawingCanvas.width!
            const endYR   = offsetY  / this.drawingCanvas.height!
            if(this.state.erasing){
                this.erase(startXR, startYR, endXR, endYR)
                props.sendDrawingBySignal("", "", DrawingType.Erase, startXR, startYR, endXR, endYR, this.state.drawingStroke, this.state.drawingLineWidth )
            }else{
                this.draw(startXR, startYR, endXR, endYR, this.state.drawingStroke, this.state.drawingLineWidth)
                props.sendDrawingBySignal("", "", DrawingType.Draw, startXR, startYR, endXR, endYR, this.state.drawingStroke, this.state.drawingLineWidth )
            }

        }
    }
    draw = (startXR:number, startYR:number, endXR:number, endYR:number, stroke:string, lineWidth:number, force:boolean=false) =>{
        if(this.state.enableDrawing === false){return}
        // if(this.state.enableDrawing===false && force ===false){return}
        const ctx = this.drawingCanvas.getContext("2d")!
        ctx.beginPath();
        ctx.moveTo(startXR*this.drawingCanvas.width, startYR*this.drawingCanvas.height);
        ctx.lineTo(endXR*this.drawingCanvas.width, endYR*this.drawingCanvas.height);
        ctx.strokeStyle = stroke
        ctx.lineWidth = lineWidth
        ctx.stroke();
        ctx.closePath();
    }
    erase = (startXR:number, startYR:number, endXR:number, endYR:number, force:boolean=false) =>{
        if(this.state.enableDrawing === false){return}
        const ctx = this.drawingCanvas!.getContext("2d")!
        const width = 5
        ctx.clearRect(startXR*this.drawingCanvas!.width-width, startYR*this.drawingCanvas!.height-width, width*2, width*2)
        ctx.clearRect(endXR*this.drawingCanvas!.width-width, endYR*this.drawingCanvas!.height-width, width*2, width*2);
    }
    
    drawingEnd = () =>{
        this.setState({inDrawing:false})
    }
    clearDrawingCanvas = () =>{
        const props = this.props as any
        this.clearDrawing()
        props.sendDrawingBySignal("", "", DrawingType.Clear, 0, 0, 0, 0, this.state.drawingStroke, this.state.drawingLineWidth )
    }
    clearDrawing = () =>{
        const ctx = this.drawingCanvas.getContext("2d")!
        ctx.clearRect(0,0, this.drawingCanvas.width!, this.drawingCanvas.height!)
    }

    setDrawingMode    = (enable:boolean) => {
        console.log("set!:", enable)
        this.setState({inDrawingMode:enable})
    }
    setDrawingStroke    = (stroke:string)   => this.setState({drawingStroke:stroke})
    setDrawingLineWidth = (width:number)    => this.setState({drawingStroke:width})
    setErasing          = (erasing:boolean) => this.setState({erasing:erasing})

    fillText = (text:string, x:number, y:number) =>{
        this.canvasRef.current!.getContext("2d")!.fillText(text, x, y)
    }
    clearCanvas = () =>{
        if(this.canvasRef.current !==null){
            const ctx = this.canvasRef.current!.getContext("2d")!
            ctx.clearRect(0, 0, this.canvasRef.current!.width, this.canvasRef.current!.height)
        }
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
        // console.log("putStamp", dstAttendeeId, thisAttendeeId)
        // console.log("putStamp", props)
        // console.log("putStamp", image)
        console.log("STARTTIME:", startTime, image)
        ctx.drawImage(image, this.canvasRef.current!.width - ((startTime % 5) * 20 + width+10), this.canvasRef.current!.height -  this.canvasRef.current!.height * (elapsed / 3000), width, width)
    }


    putText = (dstAttendeeId:string, message:string, startTime:number, elapsed:number) =>{
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
        if(this.videoRef.current === null){
            return
        }
        const sheight = this.videoRef.current!.scrollHeight
        // const swidth = this.videoRef.current!.scrollWidth
        this.divRef.current!.style.height = `${sheight}px`
        // this.canvasRef.current!.style.height = `${sheight}px`
        this.canvasRef.current!.width = this.videoRef.current!.scrollWidth
        this.canvasRef.current!.height = this.videoRef.current!.scrollHeight
        this.statusCanvasRef.current!.width = this.videoRef.current!.scrollWidth
        this.statusCanvasRef.current!.height = this.videoRef.current!.scrollHeight
        // if(this.drawingCanvasRef.current!.width !== this.videoRef.current!.scrollWidth){

        if(this.state.enableDrawing === true){
            if(this.drawingCanvas.width !== this.videoRef.current!.scrollWidth || this.drawingCanvas.height !== this.videoRef.current!.scrollHeight){
                try{
                    this.divRef.current!.removeChild(this.drawingCanvas)
                }catch(e){
                    console.log(e)
                }
                const newCanvas = document.createElement("canvas")
                this.divRef.current!.appendChild(newCanvas)
                newCanvas.style.position="absolute"
                newCanvas.style.width=`${this.videoRef.current!.scrollWidth}px`
                newCanvas.style.height=`${this.videoRef.current!.scrollHeight}px`
                newCanvas.width = this.videoRef.current!.scrollWidth
                newCanvas.height = this.videoRef.current!.scrollHeight
    
                if(this.drawingCanvas){
                    newCanvas.getContext("2d")!.drawImage(this.drawingCanvas,0,0,newCanvas.width,newCanvas.height)
                }
                this.drawingCanvas=newCanvas
                this.drawingCanvas.addEventListener("mousedown", (e)=>{
                    this.drawingStart()
                }, { passive: false })
                this.drawingCanvas.addEventListener("mouseup", (e)=>{
                    this.drawingEnd()
                }, { passive: false })
                this.drawingCanvas.addEventListener("mouseleave", (e)=>{
                    this.drawingEnd()
                }, { passive: false })
                this.drawingCanvas.addEventListener("mousemove", (e)=>{
                    this.drawing(e.offsetX, e.offsetY, e.movementX, e.movementY)
                }, { passive: false })                    

                this.drawingCanvas.addEventListener("touchstart", (e)=>{
                    this.drawingStart()
                    this.setState({
                        previousX:e.changedTouches[0].clientX-this.drawingCanvas.getBoundingClientRect().left,
                        previousY:e.changedTouches[0].clientY-this.drawingCanvas.getBoundingClientRect().top,
                    })
                }, { passive: false })
                this.drawingCanvas.addEventListener("touchmove", (e)=>{
                    e.preventDefault(); 
                    const prevX = this.state.previousX
                    const prevY = this.state.previousY
                    const thisTimeX = e.changedTouches[0].clientX-this.drawingCanvas.getBoundingClientRect().left
                    const thisTimeY = e.changedTouches[0].clientY-this.drawingCanvas.getBoundingClientRect().top
                    this.drawing(thisTimeX, thisTimeY, thisTimeX-prevX, thisTimeY-prevY)
                    this.setState({previousX:thisTimeX,previousY:thisTimeY})
                }, { passive: false })
                this.drawingCanvas.addEventListener("touchend", (e)=>{
                    this.drawingEnd()
                }, { passive: false })
            }
        }
    }

    componentDidMount() {
        addDataMessageConsumers(this)
        requestAnimationFrame(() => this.drawOverlayCanvas())
    }

    drawOverlayCanvas = () => {
        const props = this.props as any
        const appState = props.appState as AppState
        const thisAttendeeId = props.thisAttendeeId
        const thisMeetingId  = props.thisMeetingId as string
        this.fitSize()
        const now = Date.now()
        this.clearCanvas()

        for (const i in appState.joinedMeetings[thisMeetingId].globalStamps ) {
            const message = appState.joinedMeetings[thisMeetingId].globalStamps[i]
            const elapsed = now - message.startTime
            if (elapsed < 3000) {
                if ( (message as any).imgPath !== undefined) {
                    const stamp = message as WSStamp
                    const image = appState.stamps[stamp.imgPath]
                    const targetAttendeeId = stamp.targetId
                    console.log(stamp.imgPath, image, appState.stamps)
                    this.putStamp(targetAttendeeId, image, message.startTime, elapsed)
                } else if ((message as any).text) {
                    const text = message as WSText
                    const targetAttendeeId = text.targetId
                    this.putText(targetAttendeeId, text.text, message.startTime, elapsed)
                }
            }
        }

        if(appState.joinedMeetings[thisMeetingId].roster[thisAttendeeId] && appState.joinedMeetings[thisMeetingId].roster[thisAttendeeId].paused){
            const canvasHeight = this.statusCanvasRef.current!.height
            const fontSize     = Math.ceil(canvasHeight / 12)
            const ctx = this.statusCanvasRef.current!.getContext("2d")!
            ctx.font = `${fontSize}px メイリオ`;
            ctx.fillText("(Paused!)",200,200)
        }
        requestAnimationFrame(() => this.drawOverlayCanvas())
    }



    render()  {
        this.fitSize()
        return(
            <div ref={this.divRef} >
                <video  ref={this.videoRef}  style={{position: "absolute", width: "100%"}} />
                <canvas ref={this.canvasRef} style={{position: "absolute", width: "100%"}} />
                <canvas ref={this.statusCanvasRef} style={{position: "absolute", width: "100%"}} />

            </div>
        )
    }


    componentDidUpdate = () => {
        this.fitSize()
    }
}

export default MainOverlayVideoElement;


