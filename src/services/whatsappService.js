const axios = require('axios');

class WhatsAppService {
    constructor() {
        this.baseURL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`;
        this.token = process.env.WHATSAPP_TOKEN;
    }

    async sendMessage(to, messageData) {
        try {
            console.log('Sending WhatsApp message:', { to, messageData });
            const response = await axios.post(
                `${this.baseURL}/messages`, {
                    messaging_product: 'whatsapp',
                    to: to,
                    ...messageData
                }, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    // Send text message
    async sendTextMessage(to, text) {
        return this.sendMessage(to, {
            type: 'text',
            text: { body: text }
        });
    }

    // Send button message
    async sendButtonMessage(to, text, buttons) {
        return this.sendMessage(to, {
            type: 'interactive',
            interactive: {
                type: 'button',
                body: { text },
                action: {
                    buttons: buttons.map((btn, index) => ({
                        type: 'reply',
                        reply: {
                            id: btn.id || `btn_${index}`,
                            title: btn.title
                        }
                    }))
                }
            }
        });
    }

    // Send list message
    async sendListMessage(to, text, buttonText, sections) {
        return this.sendMessage(to, {
            type: 'interactive',
            interactive: {
                type: 'list',
                body: { text },
                action: {
                    button: buttonText,
                    sections: sections
                }
            }
        });
    }

    // Send media message
    async sendMediaMessage(to, type, mediaUrl, caption = '') {
        const mediaData = {
            type: type,
            [type]: {
                link: mediaUrl
            }
        };
        console.log(`Sending ${type} message to ${to}:`, mediaData);
        if (caption && (type === 'image' || type === 'video')) {
            mediaData[type].caption = caption;
        }

        return await this.sendMessage(to, mediaData);
    }

    // Send template message
    async sendTemplateMessage(to, templateName, languageCode = 'en', components = []) {
        return this.sendMessage(to, {
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components: components
            }
        });
    }

    // Send location message
    async sendLocationMessage(to, latitude, longitude, name, address) {
        return this.sendMessage(to, {
            type: 'location',
            location: {
                latitude,
                longitude,
                name,
                address
            }
        });
    }

    // Send contact message
    async sendContactMessage(to, contacts) {
        return this.sendMessage(to, {
            type: 'contacts',
            contacts: contacts
        });
    }
}

module.exports = new WhatsAppService();