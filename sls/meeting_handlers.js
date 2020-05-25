const { v4 } = require('uuid');
var AWS = require('aws-sdk');
var ddb        = new AWS.DynamoDB();
const util = require('./util.js')
const user_handers = require('./user_handlers')
const chime    = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');

// Read resource names from the environment
const userTableName       = process.env.USER_TABLE_NAME;
const meetingsTableName   = process.env.MEETINGS_TABLE_NAME;
const attendeesTableName  = process.env.ATTENDEES_TABLE_NAME;
const meetingRoomIdPrefix = process.env.MEETING_ROOM_ID_PREFIX;
const sqsQueueArn         = process.env.SQS_QUEUE_ARN;
const provideQueueArn = true;
const getExpireDate = () =>{
  return Math.floor(Date.now() / 1000) + 60 * 60 * 24
}
function getNotificationsConfig() {
  if (provideQueueArn) {
    return {
      SqsQueueArn: sqsQueueArn,
    };
  }
  return {}
}

const getMeetingInfo = async(meetingName) => {
  const result = await ddb.getItem({
    TableName: meetingsTableName,
    Key: {
      'MeetingName': {
        S: meetingName
      },
    },
  }).promise();
  if (!result.Item) {
    return null;
  }
  const meetingInfo = result.Item

  const meetingData = JSON.parse(meetingInfo.Data.S);
  try {
    // Check Exist? 
    const mid = await chime.getMeeting(
      {
        MeetingId: meetingData.Meeting.MeetingId
      }).promise();
  } catch (err) {
    //TBD DeleteMeetin from DB
    return null;
  }

  return {
    MeetingName : meetingInfo.MeetingName.S,
    MeetingId   : meetingInfo.MeetingId.S,
    MeetingInfo : JSON.parse(meetingInfo.Data.S),
    Metadata    : JSON.parse(meetingInfo.Metadata.S)
  }
}

const getMeetingInfoById = async(meetingId) => {
  const meetings = await ddb.query({
    ExpressionAttributeValues: {
      ':meetingId': { S: meetingId },
    },
    // ConsistentRead: true,
    IndexName: "MeetingId",
    KeyConditionExpression : 'MeetingId = :meetingId',
    //ProjectionExpression   : 'ALL',
    TableName              : meetingsTableName,
  }).promise();

  if(meetings.Count === 0){
    return null
  }
  console.log("------>",meetings)

  const meetingInfo = meetings.Items[0]
  console.log(meetingInfo)
  try {
    // Check Exist? 
    const mid = await chime.getMeeting(
      {
        MeetingId: meetingId
      }).promise();
  } catch (err) {
    //TBD DeleteMeetin from DB
    return null;
  }
  return {
    MeetingName : meetingInfo.MeetingName.S,
    MeetingId   : meetingInfo.MeetingId.S,
    MeetingInfo : JSON.parse(meetingInfo.Data.S),
    Metadata    : JSON.parse(meetingInfo.Metadata.S)
  }
}

const getAllMeetingInfo = async() => {
  const meetings = await ddb.scan({
    TableName              : meetingsTableName
  }).promise()

  const meetingInfos = meetings.Items.map(meetings =>{
    return {
      MeetingName : meetings.MeetingName.S,
      MeetingId   : meetings.MeetingId.S,
      MeetingInfo : JSON.parse(meetings.Data.S),
      Metadata    : JSON.parse(meetings.Metadata.S)
    }
  })
  return meetingInfos
}

const createMeeting = async (userName, meetingName, usePassCode, passCode, secret, region) =>{
  // check meeting name exist
  const meetingInfo = await getMeetingInfo(meetingName)
  if(meetingInfo !== null){
    throw new Error("Meeting already exist: " + meetingName);
  }
  if(meetingName.startsWith(meetingRoomIdPrefix) === false){
    throw new Error("Invalid meetingName: " + meetingName);
  }

  const userId = await user_handers.getUserId(userName)

  const request = {
    ClientRequestToken: v4(),
    MediaRegion: region,
    NotificationsConfiguration: getNotificationsConfig(),
  };
  console.info('Creating new meeting: ' + JSON.stringify(request));
  const newMeetingInfo = await chime.createMeeting(request).promise();
  const metadata = {
    OwnerId     : userId ,
    UsePassCode : usePassCode === "true",
    PassCode    : passCode,
    Secret      : secret === "true",
    Region      : region,  
  }
  const item = {
    'MeetingName' : { S: meetingName },
    'MeetingId'   : { S: newMeetingInfo.Meeting.MeetingId },
    'Data'        : { S: JSON.stringify(newMeetingInfo) },
    'Metadata'    : { S: JSON.stringify(metadata)},
    'TTL'         : {
      N: '' + getExpireDate()
    }
  }

  await ddb.putItem({
    TableName: meetingsTableName,
    Item: item,
  }).promise();
  return newMeetingInfo.Meeting.MeetingId
}


joinMeeting = async(meetingId, userName) =>{
  let meetingInfo = await getMeetingInfoById(meetingId);
  if (meetingInfo === null) {
    response["statusCode"] = 400;
    response["body"] = "No meeting " + meetingId;
    callback(null, response);
    return;
  }

  console.info('Adding new attendee');
  const attendeeInfo = (await chime.createAttendee({
    MeetingId: meetingInfo.MeetingId,
    ExternalUserId: v4(),
  }).promise());

  //putAttendee(meetingId, attendeeInfo.Attendee.AttendeeId, userName);

  await ddb.putItem({
    TableName: attendeesTableName,
    Item: {
      'AttendeeId': {
        S: `${meetingId}/${attendeeInfo.Attendee.AttendeeId}`
      },
      'UserName': { S: userName },
      'TTL': {
        N: '' + getExpireDate()
      }
    }
  }).promise();

  console.log("MEETING_INFO", meetingInfo)

  return {
    MeetingName : meetingInfo.MeetingName,
    Meeting     : meetingInfo.MeetingInfo.Meeting,
    Attendee    : attendeeInfo.Attendee
  }
}


const getAttendee = async (meetingId, attendeeId) => {
  const result = await ddb.getItem({
    TableName: attendeesTableName,
    Key: {
      'AttendeeId': {
        S: `${meetingId}/${attendeeId}`
      }
    }
  }).promise();
  if (!result.Item) {
    return 'Unknown';
  }
  console.log(result)
  return result.Item.UserName.S;
}



////////////////////////////
/// REST API
///////////////////////////
// ===== Join or create meeting ===================================
exports.createMeeting = async (event, context, callback) => {
  const response = util.getDefaultResponse()  
  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
  console.info("EVENT\n" + JSON.stringify(event, null, 2))

  const meetingName = event.queryStringParameters.meetingName
  const userName    = event.queryStringParameters.userName
  const region      = event.queryStringParameters.region || 'us-east-1'
  const usePassCode = event.queryStringParameters.usePassCode
  const passCode    = event.queryStringParameters.passCode
  const secret      = event.queryStringParameters.secret

  try{
    const meetingId = await createMeeting(userName, meetingName, usePassCode, passCode, secret, region)
    console.log(meetingId)
    const meetingInfo = await getMeetingInfoById(meetingId)
    console.log(meetingInfo)
    // const joinInfo = {
    //   JoinInfo: {
    //     meetingName   : meetingName,
    //     meetingId     : meetingId,
    //     meetingInfo   : meetingInfo.MeetingInfo,
    //     metadata      : meetingInfo.Metadata,
    //   },
    // };
    response.body = JSON.stringify(meetingInfo, '', 2);
    callback(null, response);
    return;
  }catch(e){
    console.log(e)
    response["statusCode"] = 400;
    body = {result:"error", detail:"Exception: " + e}
    response.body = JSON.stringify(body, '', 2)    
    callback(null, response);
    return;
  }
};

exports.getMeetings = async (event, context, callback) => {
  const response = util.getDefaultResponse()  
  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
  console.info("EVENT\n" + JSON.stringify(event, null, 2))

  const meetingName = event.queryStringParameters === null ? null : event.queryStringParameters.meetingName

  if(meetingName === null){
    const meetingInfo = await getAllMeetingInfo()
    console.log("all: ", meetingInfo)
    response.body = JSON.stringify(meetingInfo, '', 2)
    callback(null, response)
    return
  }else{
    const meetingInfo = await getMeetingInfo(meetingName)
    console.log("one: ", meetingInfo)
    response.body = JSON.stringify(meetingInfo, '', 2)
    callback(null, response)
    return
  }
};

exports.join = async (event, context, callback) => {
  const response = util.getDefaultResponse()  
  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
  console.info("EVENT\n" + JSON.stringify(event, null, 2))

  const meetingId = event.pathParameters.meetingId
  const userName  = event.queryStringParameters.userName
  const joinInfo = await joinMeeting(meetingId, userName)
  console.log("GET JOIN INFO",joinInfo)

  response.body = JSON.stringify(joinInfo, '', 2);
  callback(null, response);
};


exports.getAttendee = async (event, context, callback) => {
  const response = util.getDefaultResponse()
  const meetingId  = event.pathParameters.meetingId
  const attendeeId = event.pathParameters.attendeeId;
  const attendeeInfo = {
    AttendeeInfo: {
      AttendeeId: attendeeId,
      UserName: await getAttendee(meetingId, attendeeId),
    },
  };
  response.body = JSON.stringify(attendeeInfo, '', 2);
  callback(null, response);
};

exports.end = async (event, context, callback) => {
  const response = util.getDefaultResponse() 
  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
  console.info("EVENT\n" + JSON.stringify(event, null, 2))

  event.queryStringParameters.title = simplifyTitle(event.queryStringParameters.title);
  const title = event.queryStringParameters.title;
  let meetingInfo = await getMeeting(title);
  try {
    await chime.deleteMeeting({
      MeetingId: meetingInfo.Meeting.MeetingId,
    }).promise();
  } catch (e) {
    console.log(e)
  }
  callback(null, response);
};