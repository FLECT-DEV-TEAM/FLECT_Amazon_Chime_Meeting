const { v4 } = require('uuid');
var AWS = require('aws-sdk');
var ddb        = new AWS.DynamoDB();
const chime    = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint('https://service.chime.aws.amazon.com/console');
const util = require('./util.js')

// ===== Join or create meeting ===================================
exports.log = async (event, context, callback) => {
  const response = util.getDefaultResponse()
  console.log("ENVIRONMENT VARIABLES\n" + JSON.stringify(process.env, null, 2))
  console.info("EVENT\n" + JSON.stringify(event, null, 2))

  callback(null, response);
};


