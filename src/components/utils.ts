import { NO_DEVICE_SELECTED } from "../const"
import { VideoTileState } from "amazon-chime-sdk-js"

/**
 * Not used.
 * @param kind 
 */
export const getDeviceList = async (kind:string) =>{
    const list = await navigator.mediaDevices.enumerateDevices()
    const res = list.filter((x:InputDeviceInfo | MediaDeviceInfo)=>{
        if(x.kind === kind){
            return true
        }else{
            return false
        }
    })
    console.log(kind, res)
}

export const getVideoDevice = async (deviceId:string): Promise<MediaStream|null>=>{
    // const list = await navigator.mediaDevices.enumerateDevices()
    // const target = list.find((x:InputDeviceInfo | MediaDeviceInfo)=>{
    //     return (x.label === label)
    // })

    // console.log("getVideoDevice", list, label)
    // console.log("getVideoDevice", target)
    // if(target === undefined){
    //     return null
    // }
    if(deviceId === NO_DEVICE_SELECTED){
        return null
    }
    const webCamPromise = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { deviceId: deviceId,
            // video: { deviceId: target?.deviceId,
                width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    })
    return webCamPromise
}


export const getTileId = (attendeeId: string, videoTileState: { [id: number]: VideoTileState }): number => {
    for (let tileId in videoTileState) {
        const key = Number(tileId)
        const tile = videoTileState[key]
        if (tile === undefined) { continue }
        if (tile.boundAttendeeId === attendeeId) {
            return key
        }
    }
    return -1
}


