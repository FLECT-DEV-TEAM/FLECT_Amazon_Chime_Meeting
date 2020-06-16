import * as md5 from 'md5';
import { WSMessage, WSMessageType } from './const';
import { ReconnectingPromisedWebSocket } from 'amazon-chime-sdk-js';

const filePartLength = 1024*10

interface WSFilePart{
    index   : number
    content : string
}

export interface WSFile{
    fileParts : WSFilePart[]
    uuid      : string
    filename  : string
    md5sum    : string
    partNum   : number
}

export interface SendingStatus{
    uuid             : string
    targetId         : string
    filename         : string
    transferredIndex : number
    partNum          : number
    done             : boolean
}

export interface RecievingStatus{
    uuid             : string
    filename         : string
    recievedIndex    : number
    partNum          : number
    available        : boolean
    startTime        : number
}

const loadedFiles:{[uuid:string]:WSFile}                   = {}
const recievedFiles:{[uuid:string]:WSFile}                 = {}
const sendingStatus:{[uuid_targetId:string]:SendingStatus} = {}
// const recievingStatus:{[uuid:string]:RecievingStatus}      = {}

export const getRecievingStatus = ():RecievingStatus[] =>{
    const recievingStatuses:RecievingStatus[] = []
    for(const i in recievedFiles){
        const file = recievedFiles[i]
        const status:RecievingStatus ={
            uuid             : file.uuid,
            filename         : file.filename,
            recievedIndex    : file.fileParts.length - 1,
            partNum          : file.partNum,
            available        : file.fileParts.length === file.partNum,
            startTime        : Date.now()
        }
        recievingStatuses.push(status)
    }
    return recievingStatuses
}

export const getSendingStatus = ():SendingStatus[] =>{
    const sendingStatusStatuses:SendingStatus[] = []
    for(const i in sendingStatus){
        const file = sendingStatus[i]
        const status:SendingStatus ={
            uuid             : file.uuid,
            targetId         : file.targetId,
            filename         : file.filename,
            transferredIndex : file.transferredIndex,
            partNum          : file.partNum,
            done             : file.done
        }
        sendingStatusStatuses.push(status)
    }
    return sendingStatusStatuses
}



//////////////////
// For Sender   //
//////////////////

export const loadFile = (targetFile:Blob, uuid:string, filename:string, onload:()=>void) =>{
    const reader = new FileReader();
    reader.onload= () =>{
//        const content = Buffer.from(reader.result!).toString("base64")
        const content = Buffer.from(reader.result!).toString()
        const length = content.length
        const partNum =  Math.ceil(length / filePartLength)
        const contents:WSFilePart[] = []
        for(let i=0 ; i<partNum ; i++){
            const parts:WSFilePart = {
                index   : i,
                content : content.slice(i*filePartLength, (i+1)*filePartLength),
            }
            contents.push(parts)
        }
        const file:WSFile = {
            fileParts : contents,
            uuid      : uuid,
            filename  : filename,
            md5sum    : md5.default(content),
            partNum   : partNum,
        }
        loadedFiles[file.uuid] = file
        onload()
    }
    reader.readAsDataURL(targetFile);
}

export const sendFilePart = (messagingSocket:ReconnectingPromisedWebSocket, uuid:string, targetId:string):SendingStatus => {

    // Find loaded File
    if(loadedFiles[uuid] === undefined){
        throw new Error("load file before send!")
    }
    const file = loadedFiles[uuid]    

    // Find Status
    const key = `${uuid}_${targetId}`
    if(sendingStatus[key] === undefined){
        sendingStatus[key] = {
            uuid             : uuid,
            targetId         : targetId,
            filename         : file.filename,
            transferredIndex : 0,
            partNum          : file.partNum,
            done             : false
        }
    }
    const status = sendingStatus[key]



    // Send Done
    if(status.transferredIndex === file.partNum){
        status.done = true
        return status
    }

    const part:WSFile={
        fileParts : [file.fileParts[status.transferredIndex]],
        uuid      : file.uuid,
        filename  : file.filename,
        md5sum    : file.md5sum,
        partNum   : file.partNum,   

    }
    const message:WSMessage = {
        action   : 'sendmessage',
        cmd      : WSMessageType.File,
        targetId : targetId,
        private  : true,
        content  : part,
        done     : false
    }
    messagingSocket.send(JSON.stringify(message))
    status.transferredIndex += 1
    return status
}


//////////////////
// For Reciever //
//////////////////
export const addFilePart = (part:WSFile):RecievingStatus => {
    const uuid = part.uuid
    if(recievedFiles[uuid] === undefined){
        const file:WSFile={
            fileParts : [],
            uuid      : part.uuid,
            filename  : part.filename,
            md5sum    : part.md5sum,
            partNum   : part.partNum,
        }
        recievedFiles[uuid] = file
    }
    const file = recievedFiles[uuid]
    file.fileParts.push(part.fileParts[0])

    const result:RecievingStatus ={
        uuid             : file.uuid,
        filename         : file.filename,
        recievedIndex    : file.fileParts.length - 1,
        partNum          : file.partNum,
        available        : file.fileParts.length === file.partNum,
        startTime        : Date.now()
    }
    return result
}

export const saveFile = (uuid: string) =>{

    if(recievedFiles[uuid] === undefined){
        throw new Error("No such file")
    }

    // sort
    const file = recievedFiles[uuid]
    const parts = file.fileParts
    parts.sort((a,b)=>{
      if (a.index < b.index) return -1;
      else return 1
    })

    // concat
    let content = ""  
    for(let i in parts){
      content = content.concat(parts[i].content)
    }

    // sumcheck
    const sum = md5.default(content)
    if(sum !== file.md5sum){
        throw new Error(`MD5 is not match! ${sum} ${file.md5sum}`)
    }
    console.log("FILE_CONCAT", sum, file.md5sum)

    // save
    const a = document.createElement("a");
    a.href = content
    a.download = file.filename
    a.click();
    a.remove();
}

