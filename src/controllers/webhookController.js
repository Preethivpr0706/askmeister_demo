const messageHandler = require('../services/messageHandler');

class WebhookController {
    // Verify webhook (GET request)
    verifyWebhook(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
            console.log('✅ Webhook verified successfully');
            res.status(200).send(challenge);
        } else {
            console.log('❌ Webhook verification failed');
            res.sendStatus(403);
        }
    }

    // Handle incoming messages (POST request)
    async handleMessage(req, res) {
        console.log("Called")
        try {
            const body = req.body;
            console.log(body.object)
            if (body.object === 'whatsapp_business_account') {
                if (body.entry && Array.isArray(body.entry)) {
                    body.entry.forEach(entry => {
                        if (entry.changes && Array.isArray(entry.changes)) {
                            entry.changes.forEach(change => {
                                if (change.field === 'messages') {
                                    const messages = change.value && change.value.messages;
                                    const contacts = change.value && change.value.contacts;

                                    if (messages && messages.length > 0) {
                                        messages.forEach(async(message) => {
                                            const contact = contacts && contacts.find(c => c.wa_id === message.from);
                                            await messageHandler.processMessage(message, contact);
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }

            res.sendStatus(200);
        } catch (error) {
            console.error('Error handling webhook:', error);
            res.sendStatus(500);
        }
    }
}

module.exports = new WebhookController();