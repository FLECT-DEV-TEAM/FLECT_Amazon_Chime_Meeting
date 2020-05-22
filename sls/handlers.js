const { v4 } = require('uuid');
var AWS = require('aws-sdk');
var ddb        = new AWS.DynamoDB();
const chime    = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');


// Read resource names from the environment
const meetingsTableName   = process.env.MEETINGS_TABLE_NAME;
const attendeesTableName  = process.env.ATTENDEES_TABLE_NAME;
const sqsQueueArn         = process.env.SQS_QUEUE_ARN;
const meetingRoomIdPrefix = process.env.MEETING_ROOM_ID_PREFIX;

//const provideQueueArn = process.env.USE_EVENT_BRIDGE === 'false';
const provideQueueArn = true;

// function uuid() {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//     var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
//     return v.toString(16);
//   });
// }

const getExpireDate = () =>{
  return Math.floor(Date.now() / 1000) + 60 * 60 * 24
}

const getMeeting = async (meetingTitle) => {
  const result = await ddb.getItem({
    TableName: meetingsTableName,
    Key: {
      'Title': {
        S: meetingTitle
      },
    },
  }).promise();
  if (!result.Item) {
    return null;
  }
  const meetingData = JSON.parse(result.Item.Data.S);
  try {
    // Check Exist? 
    await chime.getMeeting(
      {
        MeetingId: meetingData.Meeting.MeetingId
      }).promise();
  } catch (err) {
    return null;
  }
  return meetingData;
}

const putMeeting = async (title, meetingInfo) => {
  await ddb.putItem({
    TableName: meetingsTableName,
    Item: {
      'Title': { S: title },
      'Data': { S: JSON.stringify(meetingInfo) },
      'TTL': {
        N: '' + getExpireDate()
      }
    }
  }).promise();
}

const getAttendee = async (title, attendeeId) => {
  const result = await ddb.getItem({
    TableName: attendeesTableName,
    Key: {
      'AttendeeId': {
        S: `${title}/${attendeeId}`
      }
    }
  }).promise();
  if (!result.Item) {
    return 'Unknown';
  }
  return result.Item.Name.S;
}

const putAttendee = async (title, attendeeId, name) => {
  await ddb.putItem({
    TableName: attendeesTableName,
    Item: {
      'AttendeeId': {
        S: `${title}/${attendeeId}`
      },
      'Name': { S: name },
      'TTL': {
        N: '' + getExpireDate()
      }
    }
  }).promise();
}

function getNotificationsConfig() {
  if (provideQueueArn) {
    return {
      SqsQueueArn: sqsQueueArn,
    };
  }
  return {}
}

function simplifyTitle(title) {
  // Strip out most symbolic characters and whitespace and make case insensitive,
  // but preserve any Unicode characters outside of the ASCII range.
  return (title || '').replace(/[\s()!@#$%^&*`~_=+{}|\\;:'",.<>/?\[\]-]+/gu, '').toLowerCase() || null;
}

// ===== Join or create meeting ===================================
exports.createMeeting = async (event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': '*'
    },
    "body": 'createMeeting',
    "isBase64Encoded": false
  };
  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
  console.info("EVENT\n" + JSON.stringify(event, null, 2))
  let roomTitle = event.queryStringParameters.roomTitle
  const userName  = event.queryStringParameters.userName
  const region    = event.queryStringParameters.region || 'us-east-1'


  if(roomTitle.startsWith(meetingRoomIdPrefix) === false){
    console.log("----------- not valid room id")
    console.log(roomTitle, meetingRoomIdPrefix)
    response["statusCode"] = 400;
    response["body"] = "Not Valid RoomId";
    callback(null, response);
    return;
  }

  roomTitle = simplifyTitle(roomTitle);
  if (!roomTitle) {
    response["statusCode"] = 400;
    response["body"] = "Must provide title";
    callback(null, response);
    return;
  }

  let meetingInfo = await getMeeting(roomTitle);
  let roomExist   = meetingInfo === null ? false : true
  if (roomExist === false) {
    const request = {
      ClientRequestToken: v4(),
      MediaRegion: region,
      NotificationsConfiguration: getNotificationsConfig(),
    };
    console.info('Creating new meeting: ' + JSON.stringify(request));
    meetingInfo = await chime.createMeeting(request).promise();
    await putMeeting(roomTitle, meetingInfo);
  }

  const joinInfo = {
    JoinInfo: {
      Title   : roomTitle,
      Meeting : meetingInfo.Meeting,
      Exist   : roomExist
    },
  };

  response.body = JSON.stringify(joinInfo, '', 2);
  callback(null, response);
};




exports.join = async (event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': '*'
    },
    "body": 'join',
    "isBase64Encoded": false
  };
  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
  console.info("EVENT\n" + JSON.stringify(event, null, 2))

  const roomId     = event.queryStringParameters.roomId
  const userName  = event.queryStringParameters.userName
  const region    = event.queryStringParameters.region || 'us-east-1'

  if (!roomId || !userName) {
    response["statusCode"] = 400;
    response["body"] = "Must provide title and name";
    callback(null, response);
    return;
  }

  let meetingInfo = await getMeeting(roomId);
  if (meetingInfo === null) {
    response["statusCode"] = 400;
    response["body"] = "No Room " + roomId;
    callback(null, response);
    return;
  }

  console.info('Adding new attendee');
  const attendeeInfo = (await chime.createAttendee({
    MeetingId: meetingInfo.Meeting.MeetingId,
    ExternalUserId: v4(),
  }).promise());

  putAttendee(title, attendeeInfo.Attendee.AttendeeId, name);

  const joinInfo = {
    JoinInfo: {
      Title: title,
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee
    },
  };

  response.body = JSON.stringify(joinInfo, '', 2);
  callback(null, response);
};


exports.end = async (event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': '*'
    },
    "body": 'end',
    "isBase64Encoded": false
  };
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

exports.attendee = async (event, context, callback) => {
  var response = {
    "statusCode": 200,
    "headers": {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': '*'
    },
    "body": '',
    "isBase64Encoded": false
  };
  event.queryStringParameters.title = simplifyTitle(event.queryStringParameters.title);
  const title = event.queryStringParameters.title;
  const attendeeId = event.queryStringParameters.attendee;
  const attendeeInfo = {
    AttendeeInfo: {
      AttendeeId: attendeeId,
      Name: await getAttendee(title, attendeeId),
    },
  };
  response.body = JSON.stringify(attendeeInfo, '', 2);
  callback(null, response);
};
