import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { GlobalState } from '../../reducers';
import { Attendee } from '../App';
import { VideoTileState } from 'amazon-chime-sdk-js';
import { getTileId } from '../utils';
import OverlayVideoElement from './OverlayVideoElement';

enum SummaryType {
    LoginUser,
    LoginUserSharedContent,
    Attendee,
    AttendeeSharedContent,
}

class AttendeeList extends React.Component {

    TileIdToLoginUserOverlayRef             : { [tileId: number]: React.RefObject<OverlayVideoElement> } = {}
    TileIdToAttendeeOverlayRef              : { [tileId: number]: React.RefObject<OverlayVideoElement> } = {}
    TileIdToLoginUserSharedContetOverlayRef : { [tileId: number]: React.RefObject<OverlayVideoElement> } = {}
    TileIdToAttendeeSharedContetOverlayRef  : { [tileId: number]: React.RefObject<OverlayVideoElement> } = {}

    /**
     * generate summary for roster.
     */
    generateSummaryAttendeeSegment = (summaryType: SummaryType, attendee: Attendee, overlayVideoRef: React.RefObject<OverlayVideoElement>) => {
        const props = this.props as any
        const nameText = (() => {
            if (!attendee.name) {
                // props.getAttendeeInformation(gs.baseURL, gs.roomID, attendee.attendeeId)
                return "loading..."
            } else if (summaryType === SummaryType.LoginUser) {
                return attendee.name + "(you)"
            } else if (summaryType === SummaryType.Attendee) {
                return attendee.name
            } else if (summaryType === SummaryType.LoginUserSharedContent || summaryType === SummaryType.AttendeeSharedContent) {
                return attendee.name + "'s cont."
            } else {
                return "...?"
            }
        })().substring(0, 16)

        const nameTextColor = (() => {
            if (summaryType === SummaryType.LoginUser || summaryType === SummaryType.LoginUserSharedContent) {
                return "red"
            } else {
                return undefined
            }
        })()

        const segment = (
            <div >
                <OverlayVideoElement {...props} ref={overlayVideoRef} thisAttendeeId={attendee.attendeeId}/>
            </div>
        )

        return segment
    }

    generateAttendeeList = (loginUserGrids: JSX.Element[], attendeeGrids: JSX.Element[],
        loginUserSharedContentGrids: JSX.Element[], attendeeSharedContentGrids: JSX.Element[]) => {

        let attendeeList: JSX.Element[] = []
        attendeeList = attendeeList.concat(loginUserGrids, attendeeGrids, loginUserSharedContentGrids, attendeeSharedContentGrids)

        const columns = []
        for (let i = 0; i < attendeeList.length; i++) {
            columns.push(
                <Grid.Column width={4}>
                    {attendeeList[i]}
                </Grid.Column>
            )
        }

        return (
            <Grid>
                <Grid.Row >
                    {columns}
                </Grid.Row >
            </Grid>
        )
    }

    clearCanvas = () =>{
        let overlays:React.RefObject<OverlayVideoElement>[] = []
        overlays = overlays.concat(
            Object.values(this.TileIdToLoginUserOverlayRef),
            Object.values(this.TileIdToAttendeeOverlayRef),
            Object.values(this.TileIdToLoginUserSharedContetOverlayRef),
            Object.values(this.TileIdToAttendeeSharedContetOverlayRef)
        )
        for(let key in overlays){
            overlays[key].current!.clearCanvas()
        }
    }

    putStamp = (targetAttendeeId:string, image:HTMLImageElement, startTime:number, elapsed:number) =>{
        let overlays:React.RefObject<OverlayVideoElement>[] = []
        overlays = overlays.concat(
            Object.values(this.TileIdToLoginUserOverlayRef),
            Object.values(this.TileIdToAttendeeOverlayRef),
            Object.values(this.TileIdToLoginUserSharedContetOverlayRef),
            Object.values(this.TileIdToAttendeeSharedContetOverlayRef)
        )
        for(let key in overlays){
            overlays[key].current!.putStamp(targetAttendeeId, image, startTime, elapsed)
        }
    }    

    putMessage = (targetAttendeeId:string, message:string, startTime:number, elapsed:number) =>{
        let overlays:React.RefObject<OverlayVideoElement>[] = []
        overlays = overlays.concat(
            Object.values(this.TileIdToLoginUserOverlayRef),
            Object.values(this.TileIdToAttendeeOverlayRef),
            Object.values(this.TileIdToLoginUserSharedContetOverlayRef),
            Object.values(this.TileIdToAttendeeSharedContetOverlayRef)
        )
        for(let key in overlays){
            overlays[key].current!.putMessage(targetAttendeeId, message, startTime, elapsed)
        }
    }    

    render() {
        const props = this.props as any
        const gs = this.props as GlobalState
        const roster = props.roster as { [attendeeId: string]: Attendee }
        const videoTileState = props.videoTileState as { [id: number]: VideoTileState }

        const loginUserGrids = []
        const loginUserSharedContentGrids = []
        const attendeeGrids = []
        const attendeeSharedContentGrids = []
        this.TileIdToLoginUserOverlayRef              = {}
        this.TileIdToAttendeeOverlayRef               = {}
        this.TileIdToLoginUserSharedContetOverlayRef  = {}
        this.TileIdToAttendeeSharedContetOverlayRef   = {}

        for (let attendee in roster) {
            const tileId = getTileId(attendee, videoTileState)
            const overlayRef = React.createRef<OverlayVideoElement>()

            if (attendee === gs.userAttendeeId) {
                // Login user
                const grid = this.generateSummaryAttendeeSegment(SummaryType.LoginUser, roster[attendee], overlayRef)
                if (tileId > 0) {
                    this.TileIdToLoginUserOverlayRef[tileId] = overlayRef
                }
                loginUserGrids.push(grid)
            } else if (attendee.endsWith("#content") && attendee.startsWith(gs.userAttendeeId)) {
                // Login user's shared contents
                const grid = this.generateSummaryAttendeeSegment(SummaryType.LoginUserSharedContent, roster[attendee], overlayRef)
                if (tileId > 0) {
                    // @ts-ignore
                    this.TileIdToLoginUserSharedContetOverlayRef[tileId] = overlayRef
                }
                loginUserSharedContentGrids.push(grid)

            } else if (attendee.endsWith("#content")) {
                // Attendee's shared contents
                const grid = this.generateSummaryAttendeeSegment(SummaryType.AttendeeSharedContent, roster[attendee], overlayRef)
                if (tileId > 0) {
                    // @ts-ignore
                    this.TileIdToAttendeeSharedContetOverlayRef[tileId] = overlayRef

                }
                attendeeSharedContentGrids.push(grid)
            } else {
                // Attendee's
                const grid = this.generateSummaryAttendeeSegment(SummaryType.Attendee, roster[attendee], overlayRef)
                if (tileId > 0) {
                    // @ts-ignore
                    this.TileIdToAttendeeOverlayRef[tileId] = overlayRef

                }
                attendeeGrids.push(grid)
            }
        }
        return this.generateAttendeeList(loginUserGrids, attendeeGrids, loginUserSharedContentGrids, attendeeSharedContentGrids)
    }


    componentDidUpdate = () => {

        const props = this.props as any
        const gs = this.props as GlobalState

        /** show LoginUser **/
        for (let tileId in this.TileIdToLoginUserOverlayRef) {
            const overlayVideoRef = this.TileIdToLoginUserOverlayRef[tileId]
            try {
                gs.meetingSession!.audioVideo.bindVideoElement(Number(tileId), overlayVideoRef.current!.getVideoRef().current!)
            } catch (e) {
                console.log("excepttion but may be no problem", e)
            }
        }

        /** show LoginUser's shared Contents List **/
        for (let tileId in this.TileIdToLoginUserSharedContetOverlayRef) {
            const overlayVideoRef = this.TileIdToLoginUserSharedContetOverlayRef[tileId]
            try {
                gs.meetingSession!.audioVideo.bindVideoElement(Number(tileId),  overlayVideoRef.current!.getVideoRef().current!)
            } catch (e) {
                console.log("excepttion but may be no problem", e)
            }
        }

        /** show Attendee List **/
        for (let tileId in this.TileIdToAttendeeOverlayRef) {
            const overlayVideoRef = this.TileIdToAttendeeOverlayRef[tileId]
            try {
                gs.meetingSession!.audioVideo.bindVideoElement(Number(tileId), overlayVideoRef.current!.getVideoRef().current!)
            } catch (e) {
                console.log("excepttion but may be no problem", e)
            }
        }

        /** show Attendee's shared Contents List **/
        for (let tileId in this.TileIdToAttendeeSharedContetOverlayRef) {
            const overlayVideoRef = this.TileIdToAttendeeSharedContetOverlayRef[tileId]
            try {
                gs.meetingSession!.audioVideo.bindVideoElement(Number(tileId), overlayVideoRef.current!.getVideoRef().current!)
            } catch (e) {
                console.log("excepttion but may be no problem", e)
            }
        }
    }



}

export default AttendeeList;


