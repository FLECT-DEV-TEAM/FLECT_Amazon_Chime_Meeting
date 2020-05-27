
exports.getDefaultResponse = () =>{
    body = {result:"success"}
    return response = {
        "statusCode": 200,
        "headers": {
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Origin': '*'
        },
        "body":  JSON.stringify(body, '', 2),
        "isBase64Encoded": false
    };
}
