require('dotenv').config();

exports.handler = function(event, context, callback) {
  callback(null, {
    statusCode: 200,
    body: process.env.KEY1
  });
}