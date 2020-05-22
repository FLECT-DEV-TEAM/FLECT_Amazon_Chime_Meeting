import { fork, take, call, put } from 'redux-saga/effects';
import { Actions } from '../actions';
import { DefaultModality } from 'amazon-chime-sdk-js';
import { API_BASE_URL } from '../config';

function* handleCreateUser() {
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

function* handleLoginUser() {
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



function* handleCreateMeetingRoom() {
    const action = yield take('CREATE_MEETING_ROOM');
    console.log(action)

    const base_url     = action.payload[0]
    const roomTitle    = action.payload[1]
    const userName     = action.payload[2]
    const region       = action.payload[3]
    const roomTitleEnc = encodeURIComponent(roomTitle)
    const userNameEnc  = encodeURIComponent(userName)
    const regionEnc    = encodeURIComponent(region)

    const url = `${API_BASE_URL}meetings?roomTitle=${roomTitleEnc}&userName=${userNameEnc}&region=${regionEnc}`
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
        yield put(Actions.createdMeetingRoom(base_url, roomTitle, userName, region, data.JoinInfo));
    }catch(e){
        console.log('failed:'+e)
    }
}


function* handleEnterSession() {
    while (true) {
        const action = yield take('ENTER_SESSION');
        console.log("SAGA")
        console.log(action)

        const base_url  = action.payload[0]
        const roomID    = encodeURIComponent(action.payload[1])
        const userName  = encodeURIComponent(action.payload[2])
        const region    = encodeURIComponent(action.payload[3])

        const url = `${API_BASE_URL}meetings/${roomID}/attendees?name=${userName}&region=${region}`
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
            yield put(Actions.join(base_url, decodeURIComponent(roomID), decodeURIComponent(userName), decodeURIComponent(region), data.JoinInfo));

        }catch(e){
            console.log('failed:'+e)
        }
    }
}

function* fetchAttendeeInfomation(){
    while(true){
        const action = yield take('GET_ATTENDEE_INFORMATION')
        const baseURL = action.payload[0]
        const roomID = encodeURIComponent(action.payload[1])
        const attendeeId = action.payload[2]

        const baseAttendeeId = encodeURIComponent(new DefaultModality(attendeeId).base());

        const url = `${API_BASE_URL}attendee?title=${encodeURIComponent(roomID)}&attendee=${baseAttendeeId}`
        try{
            let data = yield call((url:string) =>{
                return fetch(url, {
                    method: 'GET',
                })
                .then(res => res.json())
                .catch(error => {throw error})
            }, url);
            console.log("UPDATE_ATTENDEE_INFO", data)
            yield put(Actions.updateAttendeeInformation(attendeeId, baseAttendeeId, decodeURIComponent(data.AttendeeInfo.Name)));
        }catch(e){
            console.log('failed:'+e)
        }
    }
}





export default function* rootSaga() {
    yield fork(handleCreateUser)
    yield fork(handleLoginUser)
    


    yield fork(handleEnterSession)
    yield fork(fetchAttendeeInfomation)
    yield fork(handleCreateMeetingRoom)

    
}

