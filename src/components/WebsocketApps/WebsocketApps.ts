import { MESSAGING_URL } from "../../config";
import { ReconnectingPromisedWebSocket, DefaultPromisedWebSocketFactory, DefaultDOMWebSocketFactory, FullJitterBackoff } from "amazon-chime-sdk-js";
import { WSMessageType, WSMessage } from "./const";
import { WSFile, addFilePart, sendFilePart, SendingStatus, RecievingStatus, loadFile } from "./FileTransfer";
import { WSText, sendText } from "./Text";
import { WSStamp, sendStamp } from "./Stamp";
import { v4 as uuid } from 'uuid';



export class WebsocketApps{
    meetingId:string  = ""
    attendeeId:string = ""
    joinToken:string  = ""
    messagingSocket:ReconnectingPromisedWebSocket|null = null

    fileSendingEventListener   :((e:SendingStatus)   =>void)[] = []
    fileRecievingEventListener :((e:RecievingStatus) =>void)[] = []
    stampEventListener         :((e:WSStamp)         =>void)[] = []
    textEventListener          :((e:WSText)          =>void)[] = []

    
    constructor(meetingId:string, attendeeId:string, joinToken:string){
        this.joinToken  = joinToken
        this.meetingId  = meetingId
        this.attendeeId = attendeeId
    }

    open = async() =>{
        const messagingURLWithQuery = `${MESSAGING_URL}?joinToken=${this.joinToken}&meetingId=${this.meetingId}&attendeeId=${this.attendeeId}`
        console.log("MESSAGEING_URL", messagingURLWithQuery)
        const messagingSocket = new ReconnectingPromisedWebSocket(
            messagingURLWithQuery,
            [],
            'arraybuffer',
            new DefaultPromisedWebSocketFactory(new DefaultDOMWebSocketFactory()),
            new FullJitterBackoff(1000, 0, 10000)
        );
        await messagingSocket.open(20 * 1000);


        messagingSocket.addEventListener('message', (e: Event) => {
            //console.log("MESSAGE!!!!!!",e)
            const data = JSON.parse((e as MessageEvent).data) as WSMessage;
            //console.log("data: ",data)
            if(data.cmd === WSMessageType.File){
                const filePart = data.content as WSFile
                if(data.done === false){                    
                    // reciever
                    const res = addFilePart(filePart)
                    this.fileRecievingEventListener.map(f=>f(res))
                    console.log(`File Recieving...: ${res.recievedIndex}/${res.partNum}`)
                }else{
                    // sender
                    const res = sendFilePart(messagingSocket, filePart.uuid, data.targetId)
                    this.fileSendingEventListener.map(f=>f(res))
                    console.log(`File Transfering...: ${res.transferredIndex}/${res.partNum}`)
                }
            }else if(data.cmd === WSMessageType.Text){
                const text  = data.content as WSText
                this.textEventListener.map(f=>f(text))
            }else if(data.cmd === WSMessageType.Stamp){
                const stamp = data.content as WSStamp
                this.stampEventListener.map(f=>f(stamp))
            }
        })
        messagingSocket.addEventListener('error', (e: Event) => {
            console.log("Error", e)
        })
        this.messagingSocket = messagingSocket
    }

    addFileSendingEventListener = (f:(e:SendingStatus)=>void) => {
        this.fileSendingEventListener.push(f)
    }
    addFileRecievingEventListener = (f:(e:RecievingStatus)=>void) => {
        this.fileRecievingEventListener.push(f)
    }
    addStampEventListener = (f:(e:WSStamp)=>void) => {
        this.stampEventListener.push(f)
    }
    addTextEventListener = (f:(e:WSText)=>void) => {
        this.textEventListener.push(f)
    }
    //TODO Removing eventListeners



    sendStamp = (targetId: string, imgPath: string) => {
        sendStamp(this.messagingSocket!, targetId, imgPath, false)
    }
    sendText = (targetId: string, text: string) => {
        sendText(this.messagingSocket!, targetId, text, false)
    }
    startFileTransfer = (targetId:string, e: any) => {
        const id = uuid()
        loadFile(e.target.files[0], id, e.target.files[0].name, ()=>{
            sendFilePart(this.messagingSocket!, id, targetId)
        })
    }
}