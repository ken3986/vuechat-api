const admin = require('firebase-admin');
const path = require('path');
// const ENV_PATH = path.join(__dirname, '.env');

// require('dotenv').config({ path: ENV_PATH });
require('dotenv').config();
// console.log(ENV_PATH);
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
console.log(serviceAccount);
const value = process.env.TEST_VALUE;
console.log(value);
