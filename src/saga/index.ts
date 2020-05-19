import { fork, take, call, put } from 'redux-saga/effects';
import { Actions } from '../actions';
import { DefaultModality } from 'amazon-chime-sdk-js';
import { API_BASE_URL } from '../config';

function* handleEnterSession() {
    while (true) {
        const action = yield take('ENTER_SESSION');
        console.log("SAGA")
        console.log(action)

        const base_url  = action.payload[0]
        const roomID    = encodeURIComponent(action.payload[1])
        const userName  = encodeURIComponent(action.payload[2])
        const region    = encodeURIComponent(action.payload[3])
        

        const url = `${API_BASE_URL}join?title=${roomID}&name=${userName}&region=${region}`
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
    yield fork(handleEnterSession)
    yield fork(fetchAttendeeInfomation)
    
}

