// 環境変数の読み込み
require('dotenv').config();

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



const getData = (ref) => {
  return new Promise((resolve, reject) => {
    ref.on('value', (snapshot) => {
      resolve(snapshot.val())
    });
  });
}
const displayData = async(ref) => {
  data = await getData(ref)
  console.log(data);
}
displayData(usersRef)

// lambda関数をエクスポート
module.exports.handler = async (event, context) => {
  try{
    const users = await getData(usersRef);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users)
    }
  }
  catch(err) {
    console.log(err);
  }
}
