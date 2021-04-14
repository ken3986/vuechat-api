// 環境変数読み込み
require('dotenv').config();

// Express導入
const express = require('express');
const app = express();

// CORS許可
const cors = require('cors');
app.use(cors);

// serverless-http導入
const serverless = require('serverless-http');

// Firebase Admin SDK
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
// データをPromiseで取得する関数
const getData = (ref) => {
  return new Promise((resolve, reject) => {
    ref.on('value', (snapshot) => {
      resolve(snapshot.val())
    });
  });
}
// ユーザーノードを参照
let usersRef = admin.database().ref("users");



// ルーティング
const router = express.Router();

  // チャンネル一覧の取得
  router.get('/channels', (req, res) => {
    let channelsRef = admin.database().ref("channels");
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

  // チャンネルの作成
  function createChannel(cname) {
    let channelsRef = admin.database().ref("channels");
    let date1 = new Date();
    let date2 = new Date();
    date2.setSeconds(date2.getSeconds() + 1);
    const defaultData = `{
      "messages: {
        "1": {
          "body": "Welcome to #${cname} channel!",
          "date": "${date1.toJSON()}",
          "user": {
            "avatar": "",
            "id": "robot",
            "name": "Robot"
          }
        },
        "2": {
          "body": "はじめてのメッセージを投稿してみましょう。",
          "date": "${date2.toJSON()}",
          "user": {
            "avatar": "",
            "id": "robot",
            "name": "Robot"
          }
        }
      }
    }`;
    channelsRef.child(cname).set(JSON.parse(defaultData));
  }

  router.post('/channels', (req, res) => {
    let cname = req.body.cname;
    createChannel(cname);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(201).json({result: 'ok'});
  });

  // メッセージ一覧の取得
  router.get('/channels/:cname/messages', (req, res) => {
    let cname = req.params.cname;
    let messagesRef = admin.database().ref(`channels/${cname}/messages`).orderByChild('date').limitToLast(20);
    messagesRef.once('value', function(snapshot) {
      let items = new Array();
      snapshot.forEach(function(childSnapshot) {
        let message = childSnapshot.val();
        message.id = childSnapshot.key;
        items.push(message);
      });
      items.reverse();
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.send({messages: items});
    });
  });

  // メッセージの追加
  router.post('/channels/:cname/messages', (req, res) => {
    let messagesRef = admin.database().ref(`channels/${cname}/messages`);
    let cname = req.params.cname;
    let message = {
      date: new Date().toJSON(),
      body: req.body.body,
      user: req.user
    }
    messagesRef.push(message);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(201).send({result: "ok"});
  });

  // 初期状態に戻す
  router.post('/reset', (req, res) => {
    createChannel('general');
    createChannel('random');
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.status(201).send({result: "ok"});
  });

app.use('/.netlify/functions/vuechat-api', router);


// lambda関数としてエクスポート
module.exports.handler = serverless(app);
