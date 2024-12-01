const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();
const port = process.env.PORT || 3000;

// Khai báo token trực tiếp
const VERIFY_TOKEN = 'duchieu28071999haha';  // Thay thế bằng VERIFY_TOKEN của bạn
const PAGE_ACCESS_TOKEN = 'EAAgJ3Kw8EVABOZByQB3Jk5wkZAK2jd2tiPQeLCV9GTqw0cZC7CZCdN0Iwe894QlpxWZAmt0YDSjeF1hD3ZCAY801Bc17Xqncx1sUvJgkV6PDOBZB0qg81qHiEI2RPqpPPDZBkwcBzIhAhxAjMy1Oa88wVZAtetQfuYEJUEPB5zXH1G93qVZCMGL6zju6NGHT6STZCxAt35IFfZCZCBFUEEcvV';  // Thay thế bằng PAGE_ACCESS_TOKEN của bạn

app.use(bodyParser.json());

// URL xác thực webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook xác thực thành công!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Xử lý tin nhắn từ người dùng
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(function(entry) {
      const webhookEvent = entry.messaging[0];
      const senderPsid = webhookEvent.sender.id;
      
      if (webhookEvent.message) {
        handleMessage(senderPsid, webhookEvent.message);
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Hàm xử lý tin nhắn
function handleMessage(senderPsid, receivedMessage) {
  let response;
  
  if (receivedMessage.text) {    
    const message = receivedMessage.text.toLowerCase();
    
    if (message.includes('chào') || message.includes('hello') || message.includes('hi')) {
      response = {
        "text": `Xin chào! Rất vui được gặp bạn 😊`
      }
    } else {
      // Trả lời mặc định nếu không phải lời chào
      response = {
        "text": "Xin lỗi, tôi chỉ có thể trả lời lời chào."
      }
    }
  }
  
  callSendAPI(senderPsid, response);
}

// Gửi tin nhắn phản hồi
function callSendAPI(senderPsid, response) {
  const requestBody = {
    "recipient": {
      "id": senderPsid
    },
    "message": response
  };

  request({
    "uri": "https://graph.facebook.com/v13.0/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": requestBody
  }, (err, res, body) => {
    if (!err) {
      console.log('Tin nhắn đã được gửi!');
    } else {
      console.error("Không thể gửi tin nhắn:" + err);
    }
  });
}

app.listen(port, () => {
  console.log(`Server đang chạy tại port ${port}`);
});
