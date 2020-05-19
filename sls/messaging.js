const AWS = require('aws-sdk');

const ddb      = new AWS.DynamoDB({ region: process.env.AWS_REGION });
const chime    = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');
const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME;
const strictVerify = true;

exports.authorize = async (event, context, callback) => {
    console.log('authorize event:', JSON.stringify(event, null, 2));
    const generatePolicy = (principalId, effect, resource, context) => {
        const authResponse = {};
        authResponse.principalId = principalId;
        if (effect && resource) {
            const policyDocument        = {};
            policyDocument.Version      = '2012-10-17';
            policyDocument.Statement    = [];
            const statementOne          = {};
            statementOne.Action         = 'execute-api:Invoke';
            statementOne.Effect         = effect;
            statementOne.Resource       = resource;
            policyDocument.Statement[0] = statementOne;
            authResponse.policyDocument = policyDocument;
        }
        authResponse.context = context;
        return authResponse;
    };
    let passedAuthCheck = false;
    if (
        !!event.queryStringParameters.meetingId &&
        !!event.queryStringParameters.attendeeId &&
        !!event.queryStringParameters.joinToken
    ) {
        try {
            //   attendeeInfo = await chime
            //     .getAttendee({
            //       MeetingId: event.queryStringParameters.MeetingId,
            //       AttendeeId: event.queryStringParameters.AttendeeId
            //     })
            //     .promise();
            //   if (
            //     attendeeInfo.Attendee.JoinToken ===
            //     event.queryStringParameters.JoinToken
            //   ) {
            //     passedAuthCheck = true;
            //   } else if (strictVerify) {
            //     console.error('failed to authenticate with join token');
            //   } else {
            //     passedAuthCheck = true;
            //     console.warn(
            //       'failed to authenticate with join token (skipping due to strictVerify=false)'
            //     );
            //   }
            passedAuthCheck = true;
        } catch (e) {
            if (strictVerify) {
                console.error(`failed to authenticate with join token: ${e.message}`);
            } else {
                passedAuthCheck = true;
                console.warn(
                    `failed to authenticate with join token (skipping due to strictVerify=false): ${e.message}`
                );
            }
        }
    } else {
        console.error('missing MeetingId, AttendeeId, JoinToken parameters');
    }

    passedAuthCheck = true
    return generatePolicy(
        'me',
        passedAuthCheck ? 'Allow' : 'Deny',
        event.methodArn,
        {
            meetingId: event.queryStringParameters.meetingId,
            attendeeId: event.queryStringParameters.attendeeId
        }
    );
};

exports.onconnect = async event => {
    console.log('onconnect event:', JSON.stringify(event, null, 2));
    const oneDayFromNow  = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    try {
        const meetingId  = event.queryStringParameters.meetingId
        const attendeeId = event.queryStringParameters.attendeeId

        await ddb.putItem({
                TableName : process.env.CONNECTIONS_TABLE_NAME,
                Item      : {
                    MeetingId    : { S: meetingId },
                    AttendeeId   : { S: attendeeId },
                    ConnectionId : { S: event.requestContext.connectionId },
                    TTL          : { N: `${oneDayFromNow}` }
                }
            })
            .promise();
    } catch (e) {
        console.error(`error connecting: ${e.message}`);
        return {
            statusCode: 500,
            body: `Failed to connect: ${JSON.stringify(e)}`
        };
    }
    return { statusCode: 200, body: 'Connected.' };
};

exports.ondisconnect = async event => {
    console.log('ondisconnect event:', JSON.stringify(event, null, 2));
    try {
        const meetingId  = event.requestContext.authorizer.meetingId
        const attendeeId = event.requestContext.authorizer.attendeeId
        console.log(meetingId, attendeeId)
        await ddb.deleteItem({
                TableName : process.env.CONNECTIONS_TABLE_NAME,
                Key       : {
                    MeetingId  : { S: meetingId  },
                    AttendeeId : { S: attendeeId }
                }
            })
            .promise();
    } catch (err) {
        console.error(`error : ${err.message}`);
        return {
            statusCode: 500,
            body: `Failed to disconnect: ${JSON.stringify(err)}`
        };
    }
    return { statusCode: 200, body: 'Disconnected.' };
};

exports.sendmessage = async event => {
    console.log('sendmessage event:', JSON.stringify(event, null, 2));
    let attendees = {};
    try {
        attendees = await ddb.query({
                ExpressionAttributeValues: {
                    ':meetingId': { S: event.requestContext.authorizer.meetingId }
                },
                KeyConditionExpression : 'MeetingId = :meetingId',
                ProjectionExpression   : 'ConnectionId',
                TableName              : CONNECTIONS_TABLE_NAME
            })
            .promise();
    } catch (e) {
        return { statusCode: 500, body: e.stack };
    }
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion : '2018-11-29',
        endpoint   : `${event.requestContext.domainName}/${event.requestContext.stage}`
    });
    const postData = JSON.parse(event.body).data;

    const postCalls = attendees.Items.map(async connection => {
        const connectionId = connection.ConnectionId.S;
        try {
            await apigwManagementApi
                .postToConnection({ ConnectionId: connectionId, Data: postData })
                .promise();
        } catch (e) {
            if (e.statusCode === 410) {
                console.log(`found stale connection, skipping ${connectionId}`);
            } else {
                console.error(
                    `error posting to connection ${connectionId}: ${e.message}`
                );
            }
        }
    });
    try {
        await Promise.all(postCalls);
    } catch (e) {
        console.error(`failed to post: ${e.message}`);
        return { statusCode: 500, body: e.stack };
    }
    return { statusCode: 200, body: 'Data sent.' };
};