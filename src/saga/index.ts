import { fork, take, call, put } from 'redux-saga/effects';
import { Actions } from '../actions';
import { DefaultModality } from 'amazon-chime-sdk-js';
import { API_BASE_URL } from '../config';
import { GlobalState } from '../reducers';

function* handleCreateUser() {
    while (true) {
        const action = yield take('CREATE_USER');
        console.log(action)
        const userName     = action.payload[0]
        const code         = action.payload[1]
        const userNameEnc  = encodeURIComponent(userName)

        const url = `${API_BASE_URL}users?userName=${userNameEnc}`
        console.log(url)
        try{
            let data = yield call((url:string) =>{
                return fetch(url, {
                    method: 'POST',
                })
                .then(res => res.json())
                .catch(error => {throw error})
            }, url);
            console.log(data)
            yield put(Actions.userCreated(userName, data.userId, code));
        }catch(e){
            console.log('failed:'+e)
        }
    }
}

function* handleLoginUser() {
    while (true) {
        const action = yield take('LOGIN');
        console.log(action)
        const userName     = action.payload[0]
        const code         = action.payload[1]
        const userNameEnc  = encodeURIComponent(userName)
        const codeEnc      = encodeURIComponent(code)

        // get userId
        const url = `${API_BASE_URL}users?userName=${userNameEnc}`
        console.log(url)
        let userData
        try{
            userData = yield call((url:string) =>{
                return fetch(url, {
                    method: 'GET',
                })
                .then(res => res.json())
                .catch(error => {throw error})
            }, url);
            console.log(userData)
        }catch(e){
            console.log('failed:'+e)
        }

        // login
        const url2 = `${API_BASE_URL}users/${userData.userId}/execLogin?code=${codeEnc}`
        console.log(url2)

        try{
            let userData = yield call((url2:string) =>{
                return fetch(url2, {
                    method: 'POST',
                })
                .then(res => res.json())
                .catch(error => {throw error})
            }, url2);
            console.log(userData)
            yield put(Actions.userLogined(userName, userData.userId, code));
        }catch(e){
            console.log('failed:'+e)
        }
    }
}

function* handleCreateMeeting() {
    while (true) {
        const action = yield take('CREATE_MEETING');
        console.log(action)

        const userName    = action.payload[0]
        const meetingName = action.payload[1]
        const region      = action.payload[2]
        const usePassCode = action.payload[3]
        const passCode    = action.payload[4]
        const secret      = action.payload[5]
        const userNameEnc = encodeURIComponent(userName)
        const meetingNameEnc = encodeURIComponent(meetingName)
        const passCodeEnc = encodeURIComponent(passCode)

        const url = `${API_BASE_URL}meetings?userName=${userNameEnc}&meetingName=${meetingNameEnc}&region=${region}`+
                        `&usePassCode=${usePassCode}&passCode=${passCodeEnc}&secret=${secret}`
        console.log(url)
        try{
            let data = yield call((url:string) =>{
                return fetch(url, {
                    method: 'POST',
                })
                .then(res => res.json())
                .catch(error => {throw error})
            }, url);
            console.log(data)
            yield put(Actions.refreshRoomList());
        }catch(e){
            console.log('failed:'+e)
        }
    }
}


function* handleRefreshRoomList() {
    while (true) {
        const action = yield take('REFRESH_ROOM_LIST');
        console.log(action)

        const url = `${API_BASE_URL}meetings`
        console.log(url)
        try{
            let data = yield call((url:string) =>{
                return fetch(url, {
                    method: 'GET',
                })
                .then(res => res.json())
                .catch(error => {throw error})
            }, url);
            console.log(data)
            yield put(Actions.gotAllRoomList(data));
        }catch(e){
            console.log('failed:'+e)
        }
    }
}

function* handleJoinMeeting() {
    while (true) {
        const action = yield take('JOIN_MEETING');
        console.log(action)
        const meetingId = action.payload[0]
        const gs = action.payload[1] as GlobalState
        

        const url = `${API_BASE_URL}meetings/${meetingId}/attendees?userName=${gs.userName}`
        console.log(url)
        try{
            let data = yield call((url:string) =>{
                return fetch(url, {
                    method: 'POST',
                })
                .then(res => {
                    if(res.ok){
                        return res.json()
                    }else{
                        throw new Error('Join failed: '+res);
                    }
                })
                .catch(error => {
                    throw error
                })
            }, url);
            console.log(data)
            yield put(Actions.joinedMeeting(data));
        }catch(e){
            yield put(Actions.showError(`Sorry, there is no meeting room! [${meetingId}]`))
            yield put(Actions.refreshRoomList())
            console.log('failed:'+e)
        }
    }
}

function* handleLeaveMeeting() {
    while (true) {
        const action = yield take('LEAVE_MEETING');
        console.log(action)
        const meetingId = action.payload[0]
        const attendeeId = action.payload[1]
        

        const url = `${API_BASE_URL}meetings/${meetingId}/attendees/${attendeeId}`
        console.log(url)
        try{
            let data = yield call((url:string) =>{
                return fetch(url, {
                    method: 'DELETE',
                })
                .then(res => res.json())
                .catch(error => {throw error})
            }, url);
            console.log(data)
            yield put(Actions.leftMeeting(data));
        }catch(e){
            console.log('failed:'+e)
        }
    }
}

function* handleGetAttendeeInfomation(){
    while(true){
        const action = yield take('GET_ATTENDEE_INFORMATION')
        const meetingId  = action.payload[0]
        const attendeeId = action.payload[1]

        const baseAttendeeId = encodeURIComponent(new DefaultModality(attendeeId).base());

        const url = `${API_BASE_URL}meetings/${meetingId}/attendees/${baseAttendeeId}`
        console.log(meetingId, attendeeId, url)
        try{
            let data = yield call((url:string) =>{
                return fetch(url, {
                    method: 'GET',
                })
                .then(res => res.json())
                .catch(error => {throw error})
            }, url);
            console.log("UPDATE_ATTENDEE_INFO", data)
            yield put(Actions.updateAttendeeInformation(attendeeId, baseAttendeeId, decodeURIComponent(data.AttendeeInfo.UserName)));
        }catch(e){
            console.log('failed:'+e)
        }
    }
}




// function* handleEnterSession() {
//     while (true) {
//         const action = yield take('ENTER_SESSION');
//         console.log("SAGA")
//         console.log(action)

//         const base_url  = action.payload[0]
//         const roomID    = encodeURIComponent(action.payload[1])
//         const userName  = encodeURIComponent(action.payload[2])
//         const region    = encodeURIComponent(action.payload[3])

//         const url = `${API_BASE_URL}meetings/${roomID}/attendees?name=${userName}&region=${region}`
//         console.log(url)
//         try{
//             let data = yield call((url:string) =>{
//                 return fetch(url, {
//                     method: 'POST',
//                 })
//                 .then(res => res.json())
//                 .catch(error => {throw error})
//             }, url);
//             console.log(data)
//             yield put(Actions.join(base_url, decodeURIComponent(roomID), decodeURIComponent(userName), decodeURIComponent(region), data.JoinInfo));

//         }catch(e){
//             console.log('failed:'+e)
//         }
//     }
// }






export default function* rootSaga() {
    yield fork(handleCreateUser)
    yield fork(handleLoginUser)
    yield fork(handleCreateMeeting)
    yield fork(handleRefreshRoomList)
    yield fork(handleJoinMeeting)
    yield fork(handleLeaveMeeting)
    

    yield fork(handleGetAttendeeInfomation)
    
    

//    yield fork(handleEnterSession)

    
}

