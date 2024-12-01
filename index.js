const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Xác minh webhook
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Xử lý tin nhắn từ người dùng
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(async (entry) => {
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                const userMessage = webhook_event.message.text.toLowerCase();
                if (userMessage.includes('chào')) {
                    await sendMessage(sender_psid, "Xin chào! Chúc bạn một ngày vui vẻ!");
                }
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Hàm gửi tin nhắn
async function sendMessage(sender_psid, response) {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    try {
        await axios.post(
            `https://graph.facebook.com/v15.0/me/messages`,
            {
                recipient: { id: sender_psid },
                message: { text: response },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${PAGE_ACCESS_TOKEN}`,
                },
            }
        );
    } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
    }
}

app.listen(PORT, () => console.log(`Bot đang chạy tại http://localhost:${PORT}`));
