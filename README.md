# FLECT Amazon Chime Meeting

Video Conference with Amazon Chime.

Inspired by https://github.com/aws/amazon-chime-sdk-js/tree/master/demos/browser

## Features
- Video confrence 
- Share display
- Share movie
- Virtual background
- Send Stamp
- Send Message

## Setup and Configuration
To setup, you need apropriate aws credential. For example, set it to environmetal variables, create the credential file in ~/.aws/credential, or so. If you want to know more detail, see https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html.

### Clone this repository and install dependent modules

```
$ git clone git@github.com:FLECT-DEV-TEAM/Amazon_Chime_Meeting.git
$ cd Amazon_Chime_Meeting/
$ npm install
```

### Configure a bucket for resources
The front-end (client) are provided as HTML and Javascript. At first we should defined the bucket name to contain these resources.

Open "serverless.yml" and edit the service name

```
service: flect-chime-meeting # you should configure here. use only lowercase and no underbar
````

and this service name is used as part of the bucket name. The format of bucket name is following.

```
<service>-web
```

for example, if the service name is "flect-chime-meeting", bucket name is "flect-chime-meeting-web".



### Pre-Build
To run the system, we need the some URI of AWS services. to get these URIs, we pre-build AWS services.
In this operation, it will take about 3 minutes. Please wait.

```
$ npm run build_all
```

This command should produce the following output.

```
<snip...>
Stack Outputs
<snip...>
ServiceEndpoint: https://xxxx.amazonaws.com/dev
ServiceEndpointWebsocket: wss://xxxx.ap-northeast-1.amazonaws.com/dev
<snip...>
```

These ServiceEndpoint and ServiceEndpointWebsocket are used for configuration. Make sure to leave a note.

### Edit const.ts
Open "src/config.ts"

And find following two lines. And replace the URLs which is shown previous step, ServiceEndpoint, ServiceEndpointWebsocket
```
export const API_BASE_URL  =  "https://xxxx.ap-northeast-1.amazonaws.com/dev/"
export const MESSAGING_URL =  "wss://xxxx.ap-northeast-1.amazonaws.com/dev/"
```

### Build
Commit the same command as pre-build.
```
$ npm run build_all
```

## Start

The bucket should have "index.html" which can be accessed from public. Go to S3 console and visit this bucket and get URL of "index.html". You can start the video conference.

## Uninstall
```
sls remove
```

## Note1
This software doesn't have the authentication system yet. 
We provide a very simple and weak way to restrict creating the meeting room.
We can defined the prefix of the name of meeting room. By this, somebody who doesn't know this prefix can not create the room.

To define the prefix of room name, edit following line of "serverless.yml".
```
    MEETING_ROOM_ID_PREFIX : "XXXX"
```
I say again that this is a very simple and weak way to restrict and this is not enough secure. We will provide some authentification method, maybe integrate with cognito.


## Note2
This software is experimental version. 
