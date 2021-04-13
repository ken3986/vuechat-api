const express = require('express');
const cors = require('cors')({origin: true});
const serverless = require('serverless-http');
require('dotenv').config();

const app = express();
app.use(cors);

// Firebase Admin SDKをインポート
const admin = require('firebase-admin');
const serviceAccount = {
  "type": process.env.TYPE,
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, ('\n')),
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL
}
// Firebase Admin SDKの初期化
if(!admin.apps.length){
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://vuechat2-c16f9-default-rtdb.firebaseio.com/"
  });
}
// ユーザーテーブルを参照
const usersRef = admin.database().ref("users");
// チャンネルノードを参照
const channelsRef = admin.database().ref("channels");

// Promiseでデータを取得する関数
const getData = (ref) => {
  return new Promise((resolve, reject) => {
    ref.on('value', (snapshot) => {
      resolve(snapshot.val());
    });
  });
}


const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    'hello': 'hi!'
  });
});

router.get('/test', (req, res) => {
  res.json({
    'hello': process.env.KEY1,
    'hello2': 'helllll'
  })
});

router.get('/users', async(req, res) => {
  let users = await getData(usersRef);
  res.json(users);
});
  // チャンネル一覧の取得
  router.get('/channels', (req, res) => {
    channelsRef.once('value', function(snapshot) {
      let items = new Array();
      snapshot.forEach(function(childSnapshot) {
        let cname = childSnapshot.key;
        items.push(cname);
      });
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.send({channels: items});
    });
  });


app.use('/.netlify/functions/express', router);

// lambda関数をエクスポート
module.exports.handler = serverless(app);
