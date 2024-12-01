const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

const VERIFY_TOKEN = 'duchieu28071999haha';  // Thay thế bằng VERIFY_TOKEN của bạn
const PAGE_ACCESS_TOKEN = 'EAAgJ3Kw8EVABOZByQB3Jk5wkZAK2jd2tiPQeLCV9GTqw0cZC7CZCdN0Iwe894QlpxWZAmt0YDSjeF1hD3ZCAY801Bc17Xqncx1sUvJgkV6PDOBZB0qg81qHiEI2RPqpPPDZBkwcBzIhAhxAjMy1Oa88wVZAtetQfuYEJUEPB5zXH1G93qVZCMGL6zju6NGHT6STZCxAt35IFfZCZCBFUEEcvV';  // Thay thế bằng PAGE_ACCESS_TOKEN của bạn

app.use(bodyParser.json());

// Route chính để kiểm tra server hoạt động
app.get("/", (req, res) => {
  res.send("Bot Messenger đang chạy! 🚀");
});

// Webhook endpoint
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
});

app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      const senderId = webhookEvent.sender.id;
      const message = webhookEvent.message;

      if (message && message.text.toLowerCase() === "chào") {
        sendTextMessage(senderId, "Xin chào! Tôi là bot Messenger. 😊");
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

function sendTextMessage(recipientId, messageText) {
  const messageData = {
    recipient: { id: recipientId },
    message: { text: messageText },
  };

  request(
    {
      uri: "https://graph.facebook.com/v11.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageData,
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log("Message sent successfully.");
      } else {
        console.error("Unable to send message:", error);
      }
    }
  );
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook is running on port ${PORT}`);
});
